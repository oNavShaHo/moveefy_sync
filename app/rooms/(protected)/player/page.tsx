"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Copy, LogOut } from "lucide-react";
import { io } from "socket.io-client";
import { useSearchParams, useRouter } from "next/navigation";
import { getUser, getRoom, leaveRoom } from "../actions";

interface Participant {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
}

export default function MusicPlayerPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = searchParams.get("id") || "";

  // Load user and room data
  useEffect(() => {
    async function loadData() {
      if (!roomId) {
        router.push("/rooms");
        return;
      }

      const userData = await getUser();
      if (!userData) {
        router.push("/login");
        return;
      }
      setUser(userData);

      const roomData = await getRoom(roomId);
      if (!roomData) {
        alert("Room not found");
        router.push("/rooms");
        return;
      }
      setRoom(roomData);
      setParticipants(roomData.participants || []);
      setLoading(false);
    }
    loadData();
  }, [roomId, router]);

  // Initialize socket
  useEffect(() => {
    if (!roomId || !user) return;

    socketRef.current = io("https://moveefy.onrender.com");

    // Join room
    socketRef.current.emit("join_room", { roomId, username: user.username });

    socketRef.current.on("receive_msg", (data: any) => {
      if (!videoRef.current) return;
      const { msg } = data;

      switch (msg) {
        case "play":
          videoRef.current.play();
          setIsPlaying(true);
          break;
        case "pause":
          videoRef.current.pause();
          setIsPlaying(false);
          break;
        default:
          const t = parseFloat(msg);
          if (!isNaN(t)) videoRef.current.currentTime = t;
      }
    });

    socketRef.current.on("user_joined", (data: any) => {
      // Refresh participants list
      getRoom(roomId).then((roomData) => {
        if (roomData) {
          setParticipants(roomData.participants || []);
        }
      });
    });

    socketRef.current.on("user_left", (data: any) => {
      // Refresh participants list
      getRoom(roomId).then((roomData) => {
        if (roomData) {
          setParticipants(roomData.participants || []);
        }
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_room", { roomId });
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user]);

  // Video change
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        };
      }
    }
  };

  const handleLeaveRoom = async () => {
    if (confirm("Are you sure you want to leave this room?")) {
      await leaveRoom(roomId);
      router.push("/rooms");
    }
  };

  // Emit socket events
  const emitAction = (action: string | number) => {
    if (socketRef.current && user) {
      socketRef.current.emit("send_msg", {
        roomId,
        user: user.username,
        msg: action,
      });
    }
  };

  const handlePlay = () => {
    if (!videoRef.current) return;
    videoRef.current.play();
    setIsPlaying(true);
    emitAction("play");
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    emitAction("pause");
  };

  const handleForward = () => {
    if (!videoRef.current) return;
    const newTime = videoRef.current.currentTime + 10;
    videoRef.current.currentTime = newTime;
    emitAction(newTime);
  };

  const handleBackward = () => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
    emitAction(newTime);
  };

  const handleSync = () => {
    if (!videoRef.current) return;
    emitAction(videoRef.current.currentTime);
  };

  const handleCopyRoomId = () => navigator.clipboard.writeText(roomId);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4 md:p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  if (!user || !room) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-purple-300 text-sm">Room ID:</p>
            <button
              onClick={handleCopyRoomId}
              className="flex items-center gap-2 text-white font-bold text-lg hover:text-pink-300 transition-colors"
            >
              {roomId}
              <Copy size={16} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-purple-300 text-sm">Username:</p>
            <p className="text-white font-bold">{user.username}</p>
          </div>
        </div>

        {/* Main Player Card */}
        <div className="glass-effect rounded-2xl p-8 md:p-12 backdrop-blur-xl mb-8">
          {/* Album Art Placeholder */}
          <div className="mb-8">
            {/* <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl h-64 md:h-80 flex items-center justify-center mb-8">
              <div className="text-8xl">♪</div>
            </div> */}

            {/* Track Info */}
            <div className="text-center mb-8">
              {/* <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Now Playing
              </h2> */}
              <p className="text-purple-200">Upload your favorite tracks</p>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-white text-sm font-medium mb-3">
              Upload Video/Audio
            </label>
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleVideoChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white file:bg-pink-500 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer hover:file:bg-pink-600"
            />
          </div>

          {/* Video Player */}
          {selectedVideo && (
            <div className="mb-6">
              <video
                ref={videoRef}
                className="w-full rounded-lg mb-4"
                controls
                onTimeUpdate={() =>
                  setCurrentTime(
                    videoRef.current ? videoRef.current.currentTime : 0
                  )
                }
              >
                <source src={URL.createObjectURL(selectedVideo)} />
              </video>

              {/* Progress Bar */}
              <div className="bg-white/10 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-purple-200 text-sm mb-4">
                <span>
                  {Math.floor(currentTime / 60)}:
                  {String(Math.floor(currentTime % 60)).padStart(2, "0")}
                </span>
                <span>
                  {Math.floor(duration / 60)}:
                  {String(Math.floor(duration % 60)).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <button
              onClick={handleBackward}
              className="p-3 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <SkipBack size={24} />
            </button>

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>

            <button
              onClick={handleForward}
              className="p-3 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <SkipForward size={24} />
            </button>
          </div>

          {/* Quick Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <button
              onClick={handlePlay}
              className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Play
            </button>
            <button
              onClick={handlePause}
              className="bg-cyan-400 hover:bg-cyan-500 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Pause
            </button>
            <button
              onClick={handleForward}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-colors"
            >
              +10s
            </button>
            <button
              onClick={handleBackward}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-colors"
            >
              -10s
            </button>
            <button
              onClick={handleSync}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Sync
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            {/* <button className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors">
              Save
            </button> */}
            <button
              onClick={handleLeaveRoom}
              className="flex items-center justify-center gap-2 text-white border-white/30  bg-red-500 hover:bg-red-600  bg-transparent"
            >
              <LogOut size={18} />
              <span>Leave Room</span>
            </button>
          </div>
        </div>

        {/* Connected Users */}
        <div className="glass-effect rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-white font-bold text-lg mb-4">
            Connected Users ({participants.length})
          </h3>
          <div className="space-y-3 mb-4">
            {participants.map((participant) => (
              <div
                key={participant._id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/10"
              >
                {participant.profileImage ? (
                  <img
                    src={participant.profileImage}
                    alt={participant.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {participant.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="text-white font-semibold">
                  {participant.username}
                </p>
                {participant._id === user._id && (
                  <span className="ml-auto text-purple-300 text-xs">You</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
