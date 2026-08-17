import { Schema, model, models } from "mongoose";

const LiquidationSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },

    productTitle: {
      type: String,
      required: true,
      trim: true,
    },

    productSlug: {
      type: String,
      default: "",
      trim: true,
    },

    publishedPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalSalePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    productCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    capitalProvider: {
      type: String,
      enum: ["admin1", "admin2"],
      default: "admin1",
    },

    admin1Percentage: {
      type: Number,
      default: 70,
    },

    admin2Percentage: {
      type: Number,
      default: 30,
    },

    netProfit: {
      type: Number,
      default: 0,
    },

    admin1Amount: {
      type: Number,
      default: 0,
    },

    admin2Amount: {
      type: Number,
      default: 0,
    },

    paidToAdmin1: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidToAdmin2: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAdmin1: {
      type: Number,
      default: 0,
    },

    balanceAdmin2: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pendiente", "parcial", "liquidado"],
      default: "pendiente",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Liquidation =
  models.Liquidation || model("Liquidation", LiquidationSchema);

export default Liquidation;