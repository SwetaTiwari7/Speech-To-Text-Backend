import { User } from "../model/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    const user = new User({ email, password });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ user: { id: user._id, email }, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ user: { id: user._id, email }, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Missing refresh token" });

    const decoded = verifyRefreshToken(token);
    const accessToken = generateAccessToken(decoded);

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};