import AuditLog from "../models/AuditLog";

type AuditEntry = {
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  category?: string;
  actor?: string;
  details?: string;
};

export async function writeAudit(entry: AuditEntry) {
  try {
    const searchText = [
      entry.action,
      entry.entityType,
      entry.entityName,
      entry.category,
      entry.actor,
      entry.details,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    await AuditLog.create({ ...entry, searchText });
  } catch (error) {
    // El historial nunca debe impedir que se guarde la acción principal.
    console.error("No se pudo guardar en el historial:", error);
  }
}
