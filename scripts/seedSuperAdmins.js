// @ts-nocheck

require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Falta MONGODB_URI en .env.local");
}

const UserSchema = new mongoose.Schema(
  {
    nickname: String,
    fullName: String,
    email: { type: String, unique: true },
    passwordHash: String,
    provider: {
      type: String,
      enum: ["credentials", "google", "facebook", "instagram"],
      default: "credentials",
    },
    providerId: String,
    role: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  await mongoose.connect(MONGODB_URI, {
    dbName: "cosless_store",
    serverSelectionTimeoutMS: 10000,
  });

  const superUsers = [
    {
      nickname: "admin1",
      fullName: "Super Usuario 1",
      email: "admin1@cosless.local",
      password: "Cambiar123!",
      role: "superadmin",
    },
    {
      nickname: "admin2",
      fullName: "Super Usuario 2",
      email: "admin2@cosless.local",
      password: "Cambiar123!",
      role: "superadmin",
    },
  ];

  for (const user of superUsers) {
    const exists = await User.findOne({ email: user.email });

    if (exists) {
      console.log(`Ya existe: ${user.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);

    await User.create({
      nickname: user.nickname,
      fullName: user.fullName,
      email: user.email,
      passwordHash,
      provider: "credentials",
      providerId: null,
      role: user.role,
      isActive: true,
    });

    console.log(`Creado: ${user.email}`);
  }

  await mongoose.disconnect();
  console.log("Seed terminado");
}

run().catch((error) => {
  console.error("Error ejecutando seed:", error);
  process.exit(1);
});