import bcrypt from "bcrypt";
import { Router } from "express";
import {
  UserRegisterSchema,
  UserLoginSchema,
  type User,
} from "@credit-store/shared";
import { pool } from "../config/db.js";
import type { Request, Response } from "express";
import "dotenv/config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authRoute: Router = Router();
// const SALT_ROUNDS = 12;

authRoute.post("/register", async (req: Request, res: Response) => {
  // 1. Validation
  const validationResult = UserRegisterSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      errors: validationResult.error.flatten(),
      success: false,
      message: "Invalid Credentials",
    });
  }

  const { name, email, password } = validationResult.data;

  try {
    // 2. Hash the password before database interaction
    const saltRounds = parseInt(process.env.SALT_ROUNDS ?? "5", 5);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Use a transaction to ensure integrity
    await pool.query("BEGIN");

    await pool.query(
      `INSERT INTO users(name, email, password) VALUES ($1, $2, $3)`,
      [name, email, hashedPassword],
    );

    await pool.query("COMMIT");

    return res
      .status(201)
      .json({ success: true, message: "Registered successfully" });
  } catch (error: any) {
    await pool.query("ROLLBACK");

    // 4. Handle unique constraint violations (e.g., email already exists)
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

authRoute.post("/login", async (req, res) => {
  try {
    const validationResult = UserLoginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.flatten(),
        success: false,
        message: "Invalid Credentials",
      });
    }

    console.warn("Login Request Received");

    const { email, password } = validationResult.data;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password
      FROM users
      WHERE email = $1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const loggedInUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    dotenv.config();

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(loggedInUser, JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged In Succuessfully",
      success: true,
      data: {
        loggedInUser,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
});

authRoute.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  return res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
});

authRoute.get("/getUser", async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const result = await pool.query(
      `
          SELECT
            id,
            name,
            email
          FROM users
          WHERE id = $1
          `,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      message: "Fetched User",
      success: true,
      data: {
        user,
      },
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

export default authRoute;
