import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./server/models/userModel.js";
import Product from "./server/models/productModel.js";
import Pathologist from "./server/models/pathologistModel.js";

dotenv.config();

// =====================================================
// MOCK USERS
// =====================================================

const users = [
  // ================= USER =================

  {
    name: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul.sharma@example.com",
    password: "Password@123",
    age: 28,
    gender: "Male",
    address: "Bhopal, Madhya Pradesh",
    userType: "USER",
    isActive: true,
  },

  {
    name: "Priya Verma",
    phone: "9876543211",
    email: "priya.verma@example.com",
    password: "Password@123",
    age: 25,
    gender: "Female",
    address: "Indore, Madhya Pradesh",
    userType: "USER",
    isActive: true,
  },

  {
    name: "Amit Patel",
    phone: "9876543212",
    email: "amit.patel@example.com",
    password: "Password@123",
    age: 32,
    gender: "Male",
    address: "Ahmedabad, Gujarat",
    userType: "USER",
    isActive: true,
  },

  // ================= DOCTORS =================

  {
    name: "Dr. Ankit Mehta",
    phone: "9876543220",
    email: "ankit.mehta@example.com",
    password: "Doctor@123",
    age: 42,
    gender: "Male",
    address: "Bhopal, Madhya Pradesh",
    userType: "DOCTOR",
    isActive: true,
  },

  {
    name: "Dr. Neha Singh",
    phone: "9876543221",
    email: "neha.singh@example.com",
    password: "Doctor@123",
    age: 38,
    gender: "Female",
    address: "Indore, Madhya Pradesh",
    userType: "DOCTOR",
    isActive: true,
  },

  {
    name: "Dr. Rajesh Kumar",
    phone: "9876543222",
    email: "rajesh.kumar@example.com",
    password: "Doctor@123",
    age: 45,
    gender: "Male",
    address: "New Delhi, Delhi",
    userType: "DOCTOR",
    isActive: true,
  },

  // ================= PATHOLOGISTS =================

  {
    name: "Dr. Sneha Kapoor",
    phone: "9876543230",
    email: "sneha.kapoor@example.com",
    password: "Pathologist@123",
    age: 40,
    gender: "Female",
    address: "Bhopal, Madhya Pradesh",
    userType: "PATHOLOGIST",
    isActive: true,
  },

  {
    name: "Dr. Vikram Joshi",
    phone: "9876543231",
    email: "vikram.joshi@example.com",
    password: "Pathologist@123",
    age: 44,
    gender: "Male",
    address: "Pune, Maharashtra",
    userType: "PATHOLOGIST",
    isActive: true,
  },

  {
    name: "Dr. Pooja Malhotra",
    phone: "9876543232",
    email: "pooja.malhotra@example.com",
    password: "Pathologist@123",
    age: 37,
    gender: "Female",
    address: "Indore, Madhya Pradesh",
    userType: "PATHOLOGIST",
    isActive: true,
  },

  // ================= ADMIN =================

  {
    name: "System Admin",
    phone: "9876543240",
    email: "admin@example.com",
    password: "Admin@123",
    age: 35,
    gender: "Male",
    address: "Bhopal, Madhya Pradesh",
    userType: "ADMIN",
    isActive: true,
  },
];

// =====================================================
// MOCK PRODUCTS
// =====================================================

const products = [
  {
    name: "Digital Blood Pressure Monitor",
    description:
      "Automatic digital blood pressure monitor with LCD display and irregular heartbeat detection.",
    price: 1499,
    stock: 50,
    expiresOn: "2030-12-31",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063",
    isActive: true,
  },

  {
    name: "Digital Thermometer",
    description:
      "Fast and accurate digital thermometer suitable for adults and children.",
    price: 299,
    stock: 100,
    expiresOn: "2030-12-31",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
    isActive: true,
  },

  {
    name: "Pulse Oximeter",
    description:
      "Portable fingertip pulse oximeter for measuring blood oxygen saturation and pulse rate.",
    price: 799,
    stock: 75,
    expiresOn: "2030-12-31",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309",
    isActive: true,
  },

  {
    name: "First Aid Kit",
    description:
      "Complete first aid kit containing essential medical supplies for emergencies.",
    price: 999,
    stock: 40,
    expiresOn: "2029-06-30",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde",
    isActive: true,
  },

  {
    name: "Surgical Face Masks",
    description: "Pack of 50 disposable three-layer surgical face masks.",
    price: 399,
    stock: 200,
    expiresOn: "2028-12-31",
    image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5",
    isActive: true,
  },

  {
    name: "Hand Sanitizer",
    description:
      "Alcohol-based hand sanitizer for effective hand hygiene and protection.",
    price: 199,
    stock: 150,
    expiresOn: "2028-08-31",
    image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57",
    isActive: true,
  },

  {
    name: "Medical Gloves",
    description: "Disposable latex-free medical examination gloves.",
    price: 499,
    stock: 120,
    expiresOn: "2029-10-31",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf",
    isActive: true,
  },

  {
    name: "Heating Pad",
    description:
      "Electric heating pad designed to provide soothing heat therapy for muscle pain.",
    price: 1299,
    stock: 35,
    expiresOn: "2030-05-31",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    isActive: true,
  },
];

// =====================================================
// PATHOLOGIST PROFILES
// =====================================================

const pathologistProfiles = [
  {
    email: "sneha.kapoor@example.com",
    phone: "9876543230",
    laboratoryName: "Bhopal Diagnostic Center",
    laboratoryAddress: "MP Nagar, Bhopal, Madhya Pradesh",
    experience: "8 Years",
    qualification: "MD Pathology",
    specialization: ["Clinical Pathology", "Hematology", "Histopathology"],
    consultationFee: 800,
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    workingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    isVerified: true,
    isAvailable: true,
  },

  {
    email: "vikram.joshi@example.com",
    phone: "9876543231",
    laboratoryName: "Joshi Advanced Diagnostics",
    laboratoryAddress: "Kothrud, Pune, Maharashtra",
    experience: "12 Years",
    qualification: "MD Pathology",
    specialization: ["Clinical Pathology", "Microbiology", "Cytopathology"],
    consultationFee: 1000,
    workingHours: {
      start: "10:00",
      end: "18:00",
    },
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    isVerified: true,
    isAvailable: true,
  },

  {
    email: "pooja.malhotra@example.com",
    phone: "9876543232",
    laboratoryName: "Malhotra Pathology Lab",
    laboratoryAddress: "Vijay Nagar, Indore, Madhya Pradesh",
    experience: "7 Years",
    qualification: "MD Pathology",
    specialization: ["Hematology", "Clinical Biochemistry", "Immunology"],
    consultationFee: 750,
    workingHours: {
      start: "08:30",
      end: "16:30",
    },
    workingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    isVerified: true,
    isAvailable: true,
  },
];

// =====================================================
// SEED DATABASE
// =====================================================

const seedDatabase = async () => {
  try {
    // ---------------------------------------------
    // CONNECT
    // ---------------------------------------------

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // ---------------------------------------------
    // DELETE EXISTING DATA
    // ---------------------------------------------

    await Pathologist.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log("🗑️ Existing pathologists deleted");
    console.log("🗑️ Existing products deleted");
    console.log("🗑️ Existing users deleted");

    // ---------------------------------------------
    // HASH USER PASSWORDS
    // ---------------------------------------------

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,

        password: await bcrypt.hash(user.password, 10),
      })),
    );

    // ---------------------------------------------
    // CREATE USERS
    // ---------------------------------------------

    const createdUsers = await User.insertMany(usersWithHashedPasswords);

    console.log(`✅ ${createdUsers.length} users created`);

    // ---------------------------------------------
    // CREATE PRODUCTS
    // ---------------------------------------------

    const createdProducts = await Product.insertMany(products);

    console.log(`✅ ${createdProducts.length} products created`);

    // ---------------------------------------------
    // CREATE PATHOLOGISTS
    // ---------------------------------------------

    const createdPathologists = [];

    for (const profile of pathologistProfiles) {
      // Find corresponding User
      const user = createdUsers.find((user) => user.email === profile.email);

      if (!user) {
        console.log(`⚠️ User not found for ${profile.email}`);

        continue;
      }

      // Create Pathologist
      const pathologist = await Pathologist.create({
        user: user._id,
        laboratoryName: profile.laboratoryName,
        laboratoryAddress: profile.laboratoryAddress,
        experience: profile.experience,
        qualification: profile.qualification,
        specialization: profile.specialization,
        phone: profile.phone,
        email: profile.email,
        consultationFee: profile.consultationFee,
        workingHours: profile.workingHours,
        workingDays: profile.workingDays,
        isVerified: profile.isVerified,
        isAvailable: profile.isAvailable,
      });

      createdPathologists.push(pathologist);
    }

    console.log(`✅ ${createdPathologists.length} pathologists created`);

    // =================================================
    // DISPLAY USERS
    // =================================================

    console.log("\n=================================");
    console.log("           USERS");
    console.log("=================================");

    createdUsers.forEach((user) => {
      console.log(`${user.userType.padEnd(12)} | ${user.name} | ${user.email}`);
    });

    // =================================================
    // DISPLAY PRODUCTS
    // =================================================

    console.log("\n=================================");
    console.log("          PRODUCTS");
    console.log("=================================");

    createdProducts.forEach((product) => {
      console.log(
        `${product.name} | ₹${product.price} | Stock: ${product.stock}`,
      );
    });

    // =================================================
    // DISPLAY PATHOLOGISTS
    // =================================================

    console.log("\n=================================");
    console.log("        PATHOLOGISTS");
    console.log("=================================");

    for (const pathologist of createdPathologists) {
      const user = createdUsers.find(
        (user) => user._id.toString() === pathologist.user.toString(),
      );

      console.log(
        `${user?.name} | ${pathologist.laboratoryName} | ${pathologist.qualification}`,
      );
    }

    // ---------------------------------------------
    // CLOSE CONNECTION
    // ---------------------------------------------

    await mongoose.connection.close();

    console.log("\n=================================");
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY");
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error while seeding database:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

// Run seeder
seedDatabase();
