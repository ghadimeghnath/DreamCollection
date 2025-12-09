import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/features/auth/models/User";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user || !user.password) {
           throw new Error("Invalid email or password");
        }

        // CRITICAL: Check verification status
        // We throw a specific string "unverified" to catch it in the UI
        if (!user.isVerified) {
            throw new Error("unverified");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
           throw new Error("Invalid email or password");
        }

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.isAdmin ? "admin" : "user"
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new Google user (Auto Verified)
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              isAdmin: false,
              isVerified: true, 
            });
          } else if (!existingUser.isVerified) {
            // Existing unverified user logging in with Google -> Verify them now
            existingUser.isVerified = true;
            existingUser.provider = "google"; 
            await existingUser.save();
          }
          return true;
        } catch (error) {
          console.error("Error saving Google user:", error);
          return false;
        }
      }
      return true; 
    },
    
    async jwt({ token, user, account }) {
        if (user) {
            token.id = user.id;
            token.role = user.role;
        }
        
        // Sync with DB for Google Logins to get role/id
        if (account?.provider === "google") {
            await dbConnect();
            const dbUser = await User.findOne({ email: token.email });
            if (dbUser) {
                token.id = dbUser._id.toString();
                token.role = dbUser.isAdmin ? "admin" : "user";
                token.picture = dbUser.image || token.picture;
            }
        }
        return token;
    },

    async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.image = token.picture;
        }
        return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};