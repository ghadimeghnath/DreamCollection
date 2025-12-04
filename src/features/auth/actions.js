"use server";

import { connectToDB } from "@/src/lib/db"; // Assuming you have a DB connection helper
import { User } from "./models/User";
import bcrypt from "bcryptjs";

export const registerUser = async (formData) => {
  const { name, email, password } = formData;

  try {
    await connectToDB();
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists!" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return { success: true };

  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};