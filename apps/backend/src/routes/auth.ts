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

const authRoute: Router = Router();
// const SALT_ROUNDS = 12;

authRoute.post("/register", async (req: Request, res: Response) => {
  // 1. Validation
  const validationResult = UserRegisterSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      errors: validationResult.error.flatten(),
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

    return res.status(201).json({ message: "Registered successfully" });
  } catch (error: any) {
    await pool.query("ROLLBACK");

    // 4. Handle unique constraint violations (e.g., email already exists)
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already registered" });
    }

    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRoute.post("/login", async (req, res) => {
  try {
    const validationResult = UserLoginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.flatten(),
      });
    }

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
      });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const loggedInUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return res.status(200).json({
      message: "Logged In Succuess",
      data: {
        user: loggedInUser,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default authRoute;
