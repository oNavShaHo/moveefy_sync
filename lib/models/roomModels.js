import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: [true, "Room ID is required"],
    unique: [true, "Room ID already exists"],
  },
  roomName: {
    type: String,
    default: "My Room",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;