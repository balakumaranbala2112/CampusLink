import "dotenv/config";
import mongoose from "mongoose";
import College from "../models/college.model.js";

const colleges = [
  { name: "IIT Madras", city: "Chennai", state: "Tamil Nadu" },
  { name: "Anna University", city: "Chennai", state: "Tamil Nadu" },
  { name: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu" },
  {
    name: "PSG College of Technology",
    city: "Coimbatore",
    state: "Tamil Nadu",
  },
  { name: "VIT Vellore", city: "Vellore", state: "Tamil Nadu" },
  { name: "SRM Institute of Science", city: "Chennai", state: "Tamil Nadu" },
  {
    name: "Coimbatore Institute of Technology",
    city: "Coimbatore",
    state: "Tamil Nadu",
  },
  { name: "IIT Bombay", city: "Mumbai", state: "Maharashtra" },
  { name: "IIT Delhi", city: "New Delhi", state: "Delhi" },
  { name: "BITS Pilani", city: "Pilani", state: "Rajasthan" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    await College.deleteMany({});
    console.log("Cleared existing colleges");

    await College.insertMany(colleges);
    console.log("10 colleges seeded successfully!");

    colleges.forEach((c) => console.log(`   → ${c.name}`));

    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedDB();
