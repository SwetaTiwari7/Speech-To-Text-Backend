import mongoose from "mongoose";

const transcriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    transcription: { type: String, required: true },
    provider: { type: String, default: "deepgram" },
  },
  { timestamps: true }
);

export const Transcription = mongoose.model("Transcription", transcriptionSchema);