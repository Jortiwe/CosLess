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

  const updates = [
    {
      currentEmail: "admin1@cosless.local",
      newEmail: "jorge3421310@gmail.com",
      newNickname: "jorge3421310",
      newFullName: "Jorge",
      newPassword: "Mario.64",
    },
    {
      currentEmail: "admin2@cosless.local",
      newEmail: "konekochan606@gmail.com",
      newNickname: "konekochan606",
      newFullName: "Konekochan",
      newPassword: "Tartaglia707Saeran",
    },
  ];

  for (const item of updates) {
    const user = await User.findOne({ email: item.currentEmail });

    if (!user) {
      console.log(`No se encontró: ${item.currentEmail}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(item.newPassword, 10);

    user.email = item.newEmail;
    user.nickname = item.newNickname;
    user.fullName = item.newFullName;
    user.passwordHash = passwordHash;
    user.provider = "credentials";
    user.providerId = null;
    user.isActive = true;

    await user.save();

    console.log(`Actualizado: ${item.newEmail}`);
  }

  await mongoose.disconnect();
  console.log("Actualización terminada");
}

run().catch((error) => {
  console.error("Error actualizando usuarios:", error);
  process.exit(1);
});