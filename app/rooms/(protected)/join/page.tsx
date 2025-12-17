"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { joinRoom } from "../actions";

export default function JoinRoomPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!roomId.trim()) {
      setError("Please enter a room ID");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("roomId", roomId.toUpperCase().trim());

    const result = await joinRoom(formData);

    if (result.success) {
      router.push(`/rooms/player?id=${result.roomId}`);
    } else {
      setError(result.message || "Failed to join room");
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Join Room</h1>
          <p className="text-purple-100 mb-8">
            Enter a room code to listen with friends
          </p>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-3">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room code (e.g., ABC123)"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg tracking-widest"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!roomId || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
          </form>

         
        </div>
      </div>
    </main>
  );
}
