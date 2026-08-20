import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { verifyAdminToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("cosless_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    await verifyAdminToken(token);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: "Faltan variables de Cloudinary en .env.local." }, { status: 500 });
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió una imagen." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "La imagen no puede superar 10 MB." }, { status: 400 });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHash("sha1").update(`folder=cosless/products&timestamp=${timestamp}${apiSecret}`).digest("hex");
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("api_key", apiKey);
    uploadData.append("timestamp", String(timestamp));
    uploadData.append("folder", "cosless/products");
    uploadData.append("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: uploadData });
    const result = await response.json();
    if (!response.ok) return NextResponse.json({ error: result?.error?.message || "No se pudo subir la imagen." }, { status: 502 });
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error subiendo imagen." }, { status: 500 });
  }
}
