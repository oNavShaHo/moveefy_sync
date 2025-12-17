"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Upload, X } from "lucide-react";
import { getUser, updateProfileImage } from "../actions";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function loadUser() {
      const userData = await getUser();
      if (!userData) {
        router.push("/login");
        return;
      }
      setUser(userData);
      setImagePreview(userData.profileImage || "");
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setImagePreview(imageData);
        stopCamera();
      }
    }
  };

  const handleSave = async () => {
    if (!imagePreview) {
      setError("Please select or capture an image");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const result = await updateProfileImage(imagePreview);

    if (result.success) {
      setSuccess("Profile image updated successfully!");
      // Reload user data
      const userData = await getUser();
      if (userData) {
        setUser(userData);
      }
    } else {
      setError(result.message || "Failed to update profile image");
    }

    setSaving(false);
  };

  const removeImage = () => {
    setImagePreview("");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4 md:p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Form Container */}
        <div className="glass-effect rounded-2xl p-8 md:p-12 backdrop-blur-xl">
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-purple-100 mb-8">Manage your profile</p>

          {/* User Info */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-white">
                <p className="text-sm text-purple-300 mb-1">Username</p>
                <p className="text-lg font-semibold">{user?.username}</p>
              </div>
            </div>
            <div className="text-white">
              <p className="text-sm text-purple-300 mb-1">Email</p>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="mb-8">
            <label className="block text-white text-sm font-medium mb-3">
              Profile Image
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block mb-4">
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/30"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Upload Options */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg transition-colors"
              >
                <Upload size={20} />
                <span>Upload Image</span>
              </button>

              <button
                onClick={showCamera ? stopCamera : startCamera}
                className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg transition-colors"
              >
                <Camera size={20} />
                <span>{showCamera ? "Stop Camera" : "Capture Photo"}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Camera View */}
          {showCamera && (
            <div className="mb-8 bg-black/50 rounded-lg p-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={capturePhoto}
                    className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-lg font-semibold"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !imagePreview}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}

