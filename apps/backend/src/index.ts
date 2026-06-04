import express from "express";
import authRoute from "./routes/auth.js";
import "dotenv/config";
import { pool } from "./config/db.js";
import cookieParser from "cookie-parser";

const app = express();

const PORT = 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);

app.get("/", async (_, res) => {
  const result = await pool.query("SELECT * from users");

  res.json(result.rows);
});

app.listen(PORT, () => {
  console.log(`Server listening at port: ${PORT}`);
});
