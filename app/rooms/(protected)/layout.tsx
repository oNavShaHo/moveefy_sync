import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  // If no token → force login
  if (!token) {
    redirect("/login");
  }

  try {
    // Verify JWT token (Edge compatible)
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    // If token invalid → redirect to clear-token route which will clear cookie and redirect to login
    redirect("/api/clear-token");
  }

  return <>{children}</>;
}
