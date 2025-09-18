import fs from "fs";
import axios from "axios";
import supabase from "../utils/supabaseClient.js";

const ASSEMBLY_KEY = process.env.ASSEMBLYAI_API_KEY;
const BUCKET = process.env.SUPABASE_BUCKET;

async function uploadFileToSupabase(file) {
  const fileBuffer = fs.readFileSync(file.path);
  const key = `${Date.now()}_${file.originalname}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, fileBuffer, { contentType: file.mimetype, upsert: false });

  if (error) throw error;

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(key);

  return { path: key, publicURL: publicData.publicUrl };
}

async function createAssemblyTranscript(audioUrl) {
  const createResp = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    { audio_url: audioUrl },
    { headers: { authorization: ASSEMBLY_KEY } }
  );

  const id = createResp.data.id;

  let result;
  for (let i = 0; i < 60; i++) {
    const resp = await axios.get(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { authorization: ASSEMBLY_KEY },
    });

    if (resp.data.status === "completed") {
      result = resp.data;
      break;
    }
    if (resp.data.status === "error") {
      throw new Error("Transcription error: " + resp.data.error);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  if (!result) throw new Error("Transcription timed out");
  return result;
}

export async function handleUploadAndTranscribe(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const uploadRes = await uploadFileToSupabase(req.file);
    const assemblyResult = await createAssemblyTranscript(uploadRes.publicURL);

    const { data, error } = await supabase
      .from("transcriptions")
      .insert([
        {
          user_id: req.user.id,
          filename: req.file.originalname,
          audio_path: uploadRes.path,
          audio_public_url: uploadRes.publicURL,
          transcription: assemblyResult.text || null,
          status: assemblyResult.status,
          provider: "assemblyai",
          provider_id: assemblyResult.id,
        },
      ])
      .select();

    if (error) throw error;

    fs.unlinkSync(req.file.path);

    res.json({ success: true, transcription: assemblyResult.text, record: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTranscriptions(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}