import { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    mainImage: { type: String, default: "" },
    slug: { type: String, default: "" },
  },
  { _id: false }
);

const FavoriteItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    mainImage: { type: String, default: "" },
    slug: { type: String, default: "" },
    category: { type: String, default: "" },
    status: { type: String, default: "stock" },
  },
  { _id: false }
);

const AccountStoreSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    cart: {
      type: [CartItemSchema],
      default: [],
    },
    favorites: {
      type: [FavoriteItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const AccountStore =
  models.AccountStore || model("AccountStore", AccountStoreSchema);

export default AccountStore;