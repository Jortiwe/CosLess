// @ts-nocheck

require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Falta MONGODB_URI en .env.local");
}

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["cosplays", "pelucas", "lentes", "mallas", "accesorios", "preventa"],
    },
    status: {
      type: String,
      required: true,
      enum: ["stock", "preventa"],
      default: "stock",
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    mainImage: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

const demoProducts = [
  {
    title: "Peluca blanca larga premium",
    slug: "peluca-blanca-larga-premium",
    category: "pelucas",
    status: "stock",
    price: 180,
    stock: 6,
    mainImage: "https://placehold.co/800x1000?text=Peluca+Blanca",
    images: [
      "https://placehold.co/800x1000?text=Peluca+1",
      "https://placehold.co/800x1000?text=Peluca+2",
    ],
    description: "Peluca blanca larga de fibra resistente al calor.",
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Cosplay edición especial azul",
    slug: "cosplay-edicion-especial-azul",
    category: "cosplays",
    status: "preventa",
    price: 420,
    stock: 0,
    mainImage: "https://placehold.co/800x1000?text=Cosplay+Azul",
    images: [
      "https://placehold.co/800x1000?text=Cosplay+1",
      "https://placehold.co/800x1000?text=Cosplay+2",
    ],
    description: "Cosplay edición especial en preventa.",
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Lentes rojos cosplay soft",
    slug: "lentes-rojos-cosplay-soft",
    category: "lentes",
    status: "stock",
    price: 60,
    stock: 12,
    mainImage: "https://placehold.co/800x1000?text=Lentes+Rojos",
    images: [],
    description: "Lentes rojos para cosplay de uso estético.",
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Mallas blancas elásticas",
    slug: "mallas-blancas-elasticas",
    category: "mallas",
    status: "stock",
    price: 55,
    stock: 10,
    mainImage: "https://placehold.co/800x1000?text=Mallas+Blancas",
    images: [],
    description: "Mallas blancas elásticas para cosplay.",
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Set de accesorios fantasy",
    slug: "set-de-accesorios-fantasy",
    category: "accesorios",
    status: "stock",
    price: 95,
    stock: 8,
    mainImage: "https://placehold.co/800x1000?text=Accesorios",
    images: [],
    description: "Set de accesorios decorativos para cosplay.",
    isFeatured: false,
    isActive: true,
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI, {
    dbName: "cosless_store",
    serverSelectionTimeoutMS: 10000,
  });

  for (const product of demoProducts) {
    const exists = await Product.findOne({ slug: product.slug });

    if (exists) {
      console.log(`Ya existe: ${product.slug}`);
      continue;
    }

    await Product.create(product);
    console.log(`Creado: ${product.slug}`);
  }

  await mongoose.disconnect();
  console.log("Seed de productos terminado");
}

run().catch((error) => {
  console.error("Error ejecutando seedProducts:", error);
  process.exit(1);
});