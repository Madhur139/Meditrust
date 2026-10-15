import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import connectDb from "./config/dbConfig.js";

import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import pathologistRoutes from "./routes/pathologistRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// DB CONNECTION
connectDb();

// Body-Parser
app.use(express.json());
app.use(express.urlencoded());

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// A.I ROUTES
app.use("/api/ai", aiRoutes);

// Product Routes
app.use("/api/products", productRoutes);

// PathoLogist Routes
app.use("/api/pathologist", pathologistRoutes);

// Doctor Routes
app.use("/api/doctor", doctorRoutes);

// Order Routes
app.use("/api/order", orderRoutes);

// error Handle
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING AT PORT: ${PORT}`.bgBlue);
});
