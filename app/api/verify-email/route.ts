import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/userModels";
import { connect } from "@/lib/db/dbConfig";

connect();

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Verify the user
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("VERIFY EMAIL ERROR:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during verification" },
      { status: 500 }
    );
  }
}

