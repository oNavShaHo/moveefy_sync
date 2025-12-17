import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cokkiesMaker = await cookies();
  const token = cokkiesMaker.get("token")?.value;
  
  console.log(token)
  // If no token → force login
  if (!token) {
    redirect("/login");
  }

  try {
    // Verify JWT token (Edge compatible)
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    // If token invalid → logout + redirect
    cokkiesMaker.set("token", "", { maxAge: 0 });
    redirect("/login");
  }

  return <>{children}</>;
}
