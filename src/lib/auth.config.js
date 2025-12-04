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
        
        // Check if user exists and has a password (google users might not have one)
        if (!user || !user.password) {
           throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        
        if (!isMatch) {
           throw new Error("Invalid email or password");
        }

        // Return the user object (NextAuth will use this to build the token)
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
      // 1. Logic for Google Provider
      if (account.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user if they don't exist
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              isAdmin: false,
            });
          }
          return true; // Allow sign in
        } catch (error) {
          console.error("Error saving Google user to DB:", error);
          return false; // Deny sign in on error
        }
      }
      // 2. Logic for Credentials (already verified in authorize)
      return true; 
    },
    async session({ session }) {
      // 3. Attach DB ID and Role to the session for the frontend to use
      try {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.role = dbUser.isAdmin ? "admin" : "user";
            // Ensure the image is up to date from DB if needed, or stick to Google's
            session.user.image = dbUser.image || session.user.image;
        }
      } catch (error) {
          console.error("Error fetching user session data:", error);
      }
      return session;
    },
    async jwt({ token, user }) {
        // Pass data from authorize() to the token
        if (user) {
            token.role = user.role;
            token.id = user.id;
        }
        return token;
    }
  },
  pages: {
    signIn: "/login", // Redirect here if auth fails
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};