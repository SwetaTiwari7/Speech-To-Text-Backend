import jwt from "jsonwebtoken";
import supabase from "../utils/supabaseClient.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .limit(1);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = users[0];
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}