"use server";

import User from "@/lib/models/userModels";
import bcryptjs from "bcryptjs";
import { connect } from "@/lib/db/dbConfig";
import { cookies } from "next/headers";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/utils/email";

connect();

export async function signup(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validation
    if (!username || !email || !password) {
      return { success: false, message: "All fields are required" };
    }

    // Username validation
    if (username.trim().length < 3) {
      return { success: false, message: "Username must be at least 3 characters long" };
    }

    if (username.trim().length > 20) {
      return { success: false, message: "Username must be less than 20 characters" };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return { success: false, message: "Username can only contain letters, numbers, and underscores" };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, message: "Please enter a valid email address" };
    }

    // Password validation
    if (password.length < 8) {
      return { success: false, message: "Password must be at least 8 characters long" };
    }

    if (password.length > 100) {
      return { success: false, message: "Password is too long" };
    }

    // Check existing user by email
    const existingUserByEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUserByEmail) {
      return { success: false, message: "An account with this email already exists" };
    }

    // Check existing user by username
    const existingUserByUsername = await User.findOne({ username: username.trim() });
    if (existingUserByUsername) {
      return { success: false, message: "This username is already taken" };
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate verification token
    const verifyToken = generateVerificationToken();
    const verifyTokenExpiry = new Date();
    verifyTokenExpiry.setHours(verifyTokenExpiry.getHours() + 24); // 24 hours

    // Create user (not verified yet)
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      verifyToken,
      verifyTokenExpiry,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email.trim().toLowerCase(),
      username.trim(),
      verifyToken
    );

    if (!emailResult.success) {
      // If email fails, still create user but log error
      console.error("Failed to send verification email:", emailResult.error);
      // Don't fail signup if email fails - user can request resend later
    }

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      requiresVerification: true,
    };
  } catch (err: any) {
    console.error("SIGNUP ERROR:", err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      if (field === "email") {
        return { success: false, message: "An account with this email already exists" };
      }
      if (field === "username") {
        return { success: false, message: "This username is already taken" };
      }
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0] as any;
      return { success: false, message: firstError.message || "Validation error occurred" };
    }

    return { success: false, message: "An error occurred during signup. Please try again." };
  }
}
