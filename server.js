// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

console.log("✅ MongoDB URI from .env:", process.env.MONGO_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds timeout
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// Define Schema & Models
const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
const Admin = mongoose.model("Admin", AdminSchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }
});
const Product = mongoose.model("Product", ProductSchema);

// ✅ **Fix: Add `/api/` to route paths**
app.get("/", (req, res) => {
    res.send("Coco Bubble Tea Admin API Running");
});

// **Admin Login**
app.post("/api/admin", async (req, res) => {
  try {
      const { username, password } = req.body;

      if (!username || !password) {
          return res.status(400).json({ error: "Username and password required" });
      }

      // Check if an admin with the same username already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
          return res.status(409).json({ error: "Admin already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ username, password: hashedPassword });
      await newAdmin.save();

      res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// **Get All Products**
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Add a Product**
app.post("/api/products", async (req, res) => {
    try {
        const { name, price, category } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ error: "Name, price, and category are required" });
        }
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
