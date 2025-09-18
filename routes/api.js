import express from "express";
import multer from "multer";

import { authMiddleware } from "../middleware/auth.js";
import { signup, login } from "../controllers/auth.js";
import { handleUploadAndTranscribe, getTranscriptions } from "../controllers/transcribe.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/signup", signup);
router.post("/login", login);

router.post("/upload", authMiddleware, upload.single("file"), handleUploadAndTranscribe);
router.get("/transcriptions", authMiddleware, getTranscriptions);

export default router;