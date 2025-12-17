"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(
            data.message || "Verification failed. The link may have expired."
          );
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    }

    verifyEmail();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
      <div className="rounded-2xl p-8 md:p-12 w-full max-w-md backdrop-blur-xl text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Verifying Email
            </h1>
            <p className="text-purple-200">Please wait...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-purple-200 mb-4">{message}</p>
            <Link href="/login" className="text-pink-300 font-semibold">
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-purple-200 mb-4">{message}</p>
            <Link href="/signup" className="text-pink-300 font-semibold">
              Sign Up Again
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
