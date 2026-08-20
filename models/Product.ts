import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    categories: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      required: true,
      enum: ["stock", "preventa"],
      default: "stock",
    },

    // =========================
    // VENTA
    // =========================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // ALQUILER
    // =========================

    isRentable: {
      type: Boolean,
      default: false,
    },

    rentalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    rentalDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    rentalDays: {
      type: Number,
      default: 1,
      min: 1,
    },

    rentalAvailable: {
      type: Boolean,
      default: true,
    },

    // =========================
    // PRODUCTOS EMPAREJADOS
    // =========================

    pairedProducts: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],

      default: [],

      validate: {
        validator: function (arr: unknown[]) {
          return arr.length <= 4;
        },

        message:
          "Puedes emparejar como máximo 4 productos.",
      },
    },

    // =========================
    // IMÁGENES
    // =========================

    mainImage: {
      type: String,
      default: "/placeholder-product.png",
      trim: true,
    },

    images: {
      type: [String],
      default: [],

      validate: {
        validator: function (arr: string[]) {
          return arr.length <= 5;
        },

        message:
          "Máximo 5 imágenes adicionales por producto.",
      },
    },

    description: {
      type: String,
      default: "",
    },

    // =========================
    // SECCIONES
    // =========================

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isOffer: {
      type: Boolean,
      default: false,
    },

    isWeeklyNew: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  models.Product ||
  model("Product", ProductSchema);

export default Product;