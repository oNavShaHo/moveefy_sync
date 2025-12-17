"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { getUser, logoutAction } from "./actions";
import { useRouter } from "next/navigation";

export default function RoomSelectionPage() {
  const [user, setUser] = useState<any>({});
  const router = useRouter();

  const logout = async () => {
    await logoutAction();
    router.push("/login");
  };

  useEffect(() => {
    async function load() {
      const u: any = await getUser();
      setUser(u);
    }
    load();
  }, []);
  // console.log("user", user);
  console.log("user", user);
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">♪</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Moviefy</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-white border-white/30 hover:bg-white/10 bg-transparent cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <Link href="/rooms/account">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome, {user.username}!
          </h2>
          <p className="text-purple-100 text-lg">What would you like to do?</p>
        </div>

        {/* Room Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Create Room Card */}
          <Link href="/rooms/create">
            <div className="glass-effect rounded-2xl p-12 backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform duration-300 h-full">
              <div className="flex flex-col items-center justify-center h-64 md:h-80">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-3xl font-bold text-white text-center">
                  Create Room
                </h3>
                <p className="text-purple-200 text-center mt-3">
                  Start a new listening session
                </p>
              </div>
            </div>
          </Link>

          {/* Join Room Card */}
          <Link href="/rooms/join">
            <div className="glass-effect rounded-2xl p-12 backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform duration-300 h-full">
              <div className="flex flex-col items-center justify-center h-64 md:h-80">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-3xl font-bold text-white text-center">
                  Join Room
                </h3>
                <p className="text-purple-200 text-center mt-3">
                  Connect with friends
                </p>
              </div>
            </div>
          </Link>
        </div>

       
      </div>
    </main>
  );
}
