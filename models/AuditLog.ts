import { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, default: "", trim: true },
    entityName: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    actor: { type: String, default: "Sistema", trim: true },
    details: { type: String, default: "", trim: true },
    searchText: { type: String, default: "", lowercase: true, trim: true },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ searchText: 1, createdAt: -1 });

const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);

export default AuditLog;
