import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthUser } from "../middleware/auth.js";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!validateEmail(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    if (!validatePassword(password)) {
      res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: typeof name === "string" ? name : null,
        phoneNumber: typeof req.body.phoneNumber === "string" ? req.body.phoneNumber.trim() || null : null,
      },
      select: { id: true, email: true, name: true, phoneNumber: true },
    });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set - cannot create token");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email } satisfies AuthUser,
      secret,
      { expiresIn: "7d" }
    );
    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(500).json({
      error: "Registration failed",
      details: process.env.NODE_ENV !== "production" ? message : undefined,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    if (typeof password !== "string" || !password) {
      res.status(400).json({ error: "Password required" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, phoneNumber: true, passwordHash: true },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set - cannot create token");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email } satisfies AuthUser,
      secret,
      { expiresIn: "7d" }
    );
    const { passwordHash: _, ...userWithoutHash } = user;
    res.json({
      user: userWithoutHash,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(500).json({
      error: "Login failed",
      details: process.env.NODE_ENV !== "production" ? message : undefined,
    });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { id } = (req as { user: AuthUser }).user;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phoneNumber: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const { id } = (req as { user: AuthUser }).user;
    const { name, phoneNumber } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof name === "string" && { name: name.trim() || null }),
        ...(typeof phoneNumber === "string" && { phoneNumber: phoneNumber.trim() || null }),
      },
      select: { id: true, email: true, name: true, phoneNumber: true },
    });
    res.json(user);
  } catch (err) {
    console.error("Update me error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

export function createAuthRouter(): Router {
  return router;
}
