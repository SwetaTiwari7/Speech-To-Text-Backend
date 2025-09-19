import fs from "fs";
import { createClient } from "@deepgram/sdk";
import { Transcription } from "../model/transcription.js";

export const transcribe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    const filePath = req.file.path;
    const mimetype = req.file.mimetype || "audio/webm";

    const buffer = fs.readFileSync(filePath);

    const result = await deepgram.listen.prerecorded.transcribeFile(
      { buffer, mimetype },
      { model: "nova-2", smart_format: true }
    );

    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    const record = await Transcription.create({
      userId: req.user.id,
      filename: req.file.originalname,
      transcription: transcript,
      provider: "deepgram",
    });

    fs.unlinkSync(filePath);

    return res.json({ transcription: transcript, id: record._id });
  } catch (err) {
    console.error("Error in transcribe:", err);
    return res.status(500).json({ error: "Transcription failed", details: err.message });
  }
};

export const history = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const records = await Transcription.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ records });
  } catch (err) {
    console.error("Error fetching history:", err);
    return res.status(500).json({ error: "Could not fetch history", details: err.message });
  }
};