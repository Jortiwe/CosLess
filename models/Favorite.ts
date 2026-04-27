import { Schema, model, models } from "mongoose";

const FavoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = models.Favorite || model("Favorite", FavoriteSchema);

export default Favorite;