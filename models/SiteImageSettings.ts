import { Schema, model, models } from "mongoose";

const SiteImageSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "home" },
    heroImages: { type: [String], default: [] },
    categoryImages: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

const SiteImageSettings =
  models.SiteImageSettings ||
  model("SiteImageSettings", SiteImageSettingsSchema);

export default SiteImageSettings;
