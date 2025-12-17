"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/lib/models/userModels";
import Room from "@/lib/models/roomModels";
import { connect } from "@/lib/db/dbConfig";

connect();

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return { success: true };
}

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.log("NO TOKEN");
      return null;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("DECODED:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    return JSON.parse(JSON.stringify(user));
  } catch (err) {
    console.log("ERROR:", err);
    return null;
  }
}

function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomId = "";
  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
}

export async function createRoom(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const roomName = formData.get("roomName") as string || "My Room";

    // Generate unique room ID
    let roomId = generateRoomId();
    let exists = await Room.findOne({ roomId });
    while (exists) {
      roomId = generateRoomId();
      exists = await Room.findOne({ roomId });
    }

    // Create room
    const room = await Room.create({
      roomId,
      roomName,
      createdBy: decoded.id,
      participants: [decoded.id],
    });

    return { success: true, roomId: room.roomId, message: "Room created successfully" };
  } catch (err: any) {
    console.error("CREATE ROOM ERROR:", err);
    return { success: false, message: "Failed to create room" };
  }
}

export async function joinRoom(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const roomId = formData.get("roomId") as string;

    if (!roomId) {
      return { success: false, message: "Room ID is required" };
    }

    // Find room
    const room = await Room.findOne({ roomId });
    if (!room) {
      return { success: false, message: "Room not found" };
    }

    // Add user to participants if not already in
    if (!room.participants.includes(decoded.id)) {
      room.participants.push(decoded.id);
      await room.save();
    }

    return { success: true, roomId: room.roomId, message: "Joined room successfully" };
  } catch (err: any) {
    console.error("JOIN ROOM ERROR:", err);
    return { success: false, message: "Failed to join room" };
  }
}

export async function getRoom(roomId: string) {
  try {
    const room = await Room.findOne({ roomId }).populate("createdBy", "username email profileImage").populate("participants", "username email profileImage");
    if (!room) {
      return null;
    }
    return JSON.parse(JSON.stringify(room));
  } catch (err) {
    console.error("GET ROOM ERROR:", err);
    return null;
  }
}

export async function leaveRoom(roomId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const room = await Room.findOne({ roomId });

    if (!room) {
      return { success: false, message: "Room not found" };
    }

    // Remove user from participants
    room.participants = room.participants.filter((p: any) => p.toString() !== decoded.id);
    await room.save();

    // If no participants left, delete room
    if (room.participants.length === 0) {
      await Room.deleteOne({ roomId });
    }

    return { success: true, message: "Left room successfully" };
  } catch (err: any) {
    console.error("LEAVE ROOM ERROR:", err);
    return { success: false, message: "Failed to leave room" };
  }
}

export async function updateProfileImage(imageData: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    await User.findByIdAndUpdate(decoded.id, {
      profileImage: imageData,
    });

    return { success: true, message: "Profile image updated successfully" };
  } catch (err: any) {
    console.error("UPDATE PROFILE IMAGE ERROR:", err);
    return { success: false, message: "Failed to update profile image" };
  }
}
