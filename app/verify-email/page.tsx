"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. The link may have expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    }

    verifyEmail();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-8 md:p-12 w-full max-w-md backdrop-blur-xl text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-3xl font-bold text-white mb-2">Verifying Email</h1>
            <p className="text-purple-200">Please wait while we verify your email address...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-purple-200 mb-6">{message}</p>
            <p className="text-purple-300 text-sm">Redirecting to login page...</p>
            <Link
              href="/login"
              className="inline-block mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-purple-200 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className="block bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Sign Up Again
              </Link>
              <Link
                href="/login"
                className="block text-pink-300 hover:text-pink-200 font-semibold"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

