import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { transcribe, history } from "../controllers/transcribe.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/upload", authMiddleware, upload.single("audio"), transcribe);
router.get("/history", authMiddleware, history);

export default router;