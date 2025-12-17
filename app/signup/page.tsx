"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signup } from "./action";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return "Username is required";
    }
    if (username.trim().length < 3) {
      return "Username must be at least 3 characters";
    }
    if (username.trim().length > 20) {
      return "Username must be less than 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (password.length > 100) {
      return "Password is too long";
    }
    return undefined;
  };

  const getPasswordStrength = (password: string): {
    strength: "weak" | "medium" | "strong";
    color: string;
    text: string;
  } => {
    if (password.length === 0) {
      return { strength: "weak", color: "", text: "" };
    }
    if (password.length < 8) {
      return { strength: "weak", color: "bg-red-500", text: "Weak" };
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (score >= 3) {
      return { strength: "strong", color: "bg-green-500", text: "Strong" };
    }
    if (score >= 2) {
      return { strength: "medium", color: "bg-yellow-500", text: "Medium" };
    }
    return { strength: "weak", color: "bg-red-500", text: "Weak" };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
    if (success) {
      setSuccess(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error: string | undefined;

    if (name === "username") {
      error = validateUsername(value);
    } else if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validatePassword(value);
    }

    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors and success
    setErrors({});
    setSuccess(false);

    // Validate form
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (usernameError || emailError || passwordError) {
      setErrors({
        username: usernameError,
        email: emailError,
        password: passwordError,
      });
      return;
    }

    startTransition(async () => {
      const formDataObj = new FormData();
      formDataObj.append("username", formData.username.trim());
      formDataObj.append("email", formData.email.trim());
      formDataObj.append("password", formData.password);

      const result = await signup(formDataObj);

      if (result.success) {
        setSuccess(true);
        // Don't redirect automatically - show success message
      } else {
        setErrors({
          general: result.message || "Signup failed. Please try again.",
        });
      }
    });
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 mb-4 shadow-lg">
            <span className="text-3xl">♪</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-purple-200 text-sm sm:text-base">
            Join Moviefy and start listening together
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-effect rounded-2xl p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl border border-white/10">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Account Created!
              </h2>
              <p className="text-purple-200 mb-6">
                We've sent a verification email to{" "}
                <span className="font-semibold text-white">{formData.email}</span>
              </p>
              <p className="text-purple-300 text-sm mb-6">
                Please check your inbox and click the verification link to activate your account.
              </p>
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm font-medium flex-1">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-purple-300" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Choose a username"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border ${
                      errors.username
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-white/20 focus:border-pink-500 focus:ring-pink-500/50"
                    } text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 transition-all`}
                    disabled={isPending}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </p>
                )}
                {!errors.username && formData.username && (
                  <p className="mt-1.5 text-xs text-purple-300">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-purple-300" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-white/20 focus:border-pink-500 focus:ring-pink-500/50"
                    } text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 transition-all`}
                    disabled={isPending}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a strong password"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg bg-white/10 border ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-white/20 focus:border-pink-500 focus:ring-pink-500/50"
                    } text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 transition-all`}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.password && !errors.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all`}
                          style={{
                            width:
                              passwordStrength.strength === "weak"
                                ? "33%"
                                : passwordStrength.strength === "medium"
                                ? "66%"
                                : "100%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-purple-300">
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
                {!errors.password && formData.password && (
                  <p className="mt-1.5 text-xs text-purple-300">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* Sign In Link */}
          {!success && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-purple-200 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-pink-300 hover:text-pink-200 font-semibold transition-colors underline underline-offset-2"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-purple-300/70 text-xs mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}
