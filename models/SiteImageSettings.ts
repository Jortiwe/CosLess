import { Schema, model, models } from "mongoose";

const SiteImageSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "home" },
    heroImages: { type: [String], default: [] },
    heroSlides: { type: [{ image: String, tag: String, title: String, href: String }], default: [] },
    categoryImages: { type: Map, of: String, default: {} },
    categoryHeroImages: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

const SiteImageSettings =
  models.SiteImageSettings ||
  model("SiteImageSettings", SiteImageSettingsSchema);

export default SiteImageSettings;
