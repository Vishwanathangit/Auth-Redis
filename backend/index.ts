import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import authRoutes from "./routes/authRoutes";
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { options } from "./swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
const swaggerSpecs = swaggerJsdoc(options)
app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Authentication API Server is running" });
});

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();