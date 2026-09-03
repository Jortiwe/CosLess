import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    mainImage: {
      type: String,
      default: "",
    },
    inventoryCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    inventoryAllocations: {
      type: [
        {
          lotId: { type: String, default: "" },
          quantity: { type: Number, required: true, min: 0 },
          costPrice: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    accountEmail: {
  type: String,
  default: "",
  trim: true,
  lowercase: true,
},

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    shippingDepartment: {
      type: String,
      required: true,
      enum: [
        "La Paz",
        "Cochabamba",
        "Santa Cruz",
        "Oruro",
        "Potosí",
        "Chuquisaca",
        "Tarija",
        "Beni",
        "Pando",
      ],
    },

    shippingCity: {
      type: String,
      default: "",
      trim: true,
    },

    shippingZone: {
      type: String,
      default: "",
      trim: true,
    },

    shippingType: {
      type: String,
      enum: ["delivery", "pickup", "por_coordinar"],
      default: "por_coordinar",
    },

    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["whatsapp", "bank_transfer", "por_coordinar"],
      default: "whatsapp",
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      default: [],
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "contacted",
        "paid",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    inventoryDeducted: {
      type: Boolean,
      default: false,
    },

    whatsappMessage: {
      type: String,
      default: "",
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

const Order = models.Order || model("Order", OrderSchema);

export default Order;
