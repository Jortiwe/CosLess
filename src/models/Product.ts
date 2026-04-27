import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["cosplay", "peluca", "lentes", "mallas", "accesorio"],
    },
    status: {
      type: String,
      required: true,
      enum: ["stock", "preventa"],
      default: "stock",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    mainImage: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    shortDescription: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    sizes: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;