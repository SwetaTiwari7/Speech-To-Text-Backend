import dotenv from "dotenv";
dotenv.config(); // Load env variables ASAP

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import transcribeRoutes from "./routes/transcribe.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Define routes
app.use("/auth", authRoutes);
app.use("/api", transcribeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));