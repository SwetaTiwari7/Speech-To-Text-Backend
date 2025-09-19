import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);