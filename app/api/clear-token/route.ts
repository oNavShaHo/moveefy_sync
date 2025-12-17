import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  
  // Clear the invalid token cookie
  cookieStore.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  // Redirect to login page
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/login`);
}

