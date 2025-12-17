"use server";

import User from "@/lib/models/userModels";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connect } from "@/lib/db/dbConfig";
import { cookies } from "next/headers";

connect();

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validation
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, message: "Please enter a valid email address" };
    }

    // Check user exists
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return { success: false, message: "No account found with this email address" };
    }

    // Check if email is verified
    if (!user.isVerified) {
      return {
        success: false,
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
      };
    }

    // Validate password
    const isValidPassword = await bcryptjs.compare(password, user.password as string);

    if (!isValidPassword) {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    // Sign token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    });

    return { success: true, message: "Login successful" };
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    };
  }
}
