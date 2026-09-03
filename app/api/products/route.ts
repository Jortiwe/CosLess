import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "../../../lib/mongodb";
import { writeAudit } from "../../../lib/audit";
import Product from "../../../models/Product";

function cleanImage(value: unknown) {
  const image = String(value || "").trim();

  if (!image) {
    return "/placeholder-product.png";
  }

  return image;
}

function cleanCategory(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function cleanCategories(
  value: unknown,
  fallbackCategory: string
) {
  const receivedCategories =
    Array.isArray(value) ? value : [];

  const categories = receivedCategories
    .map((item) => cleanCategory(item))
    .filter(Boolean);

  if (fallbackCategory) {
    categories.unshift(fallbackCategory);
  }

  return Array.from(new Set(categories));
}

function cleanNumber(value: unknown) {
  const number = Number(value || 0);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.max(0, number);
}

function cleanRentalDays(value: unknown) {
  const number = Number(value || 1);

  if (Number.isNaN(number)) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(number)
  );
}

function cleanPairedProducts(value: unknown, maxProducts = 4) {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids = value
    .map((item) =>
      String(item || "").trim()
    )
    .filter(
      (item) =>
        item &&
        Types.ObjectId.isValid(item)
    );

  return Array.from(
    new Set(ids)
  ).slice(0, maxProducts);
}

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      products: JSON.parse(
        JSON.stringify(products)
      ),
    });
  } catch (error) {
    console.error(
      "Error obteniendo productos:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudieron obtener los productos.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    await connectDB();

    const category =
      cleanCategory(
        body.category || "cosplays"
      );

    const categories =
      cleanCategories(
        body.categories,
        category
      );

    const isRentable =
      Boolean(body.isRentable);

    const pairedProducts =
      cleanPairedProducts(
        body.pairedProducts
      );
    const groupProducts = cleanPairedProducts(body.groupProducts, 20);

    const initialStock = cleanNumber(body.stock);
    const initialCostPrice = cleanNumber(body.costPrice);

    const product =
      await Product.create({
        title: String(
          body.title || ""
        ).trim(),

        slug: String(
          body.slug || ""
        )
          .trim()
          .toLowerCase(),

        category,
        categories,

        status:
          body.status === "preventa"
            ? "preventa"
            : "stock",

        // =========================
        // VENTA
        // =========================

        price: cleanNumber(
          body.price
        ),

        costPrice: initialCostPrice,

        oldPrice:
          cleanNumber(
            body.oldPrice
          ),

        stock: initialStock,

        inventoryLots:
          initialStock > 0
            ? [{
                quantity: initialStock,
                remaining: initialStock,
                costPrice: initialCostPrice,
                receivedAt: new Date(),
              }]
            : [],

        // =========================
        // ALQUILER
        // =========================

        isRentable,
        rentalOnly: isRentable && Boolean(body.rentalOnly),

        rentalPrice:
          isRentable
            ? cleanNumber(
                body.rentalPrice
              )
            : 0,

        rentalDeposit:
          isRentable
            ? cleanNumber(
                body.rentalDeposit
              )
            : 0,

        rentalDays:
          isRentable
            ? cleanRentalDays(
                body.rentalDays
              )
            : 1,

        rentalAvailable:
          isRentable
            ? body.rentalAvailable !==
              false
            : false,

        // =========================
        // EMPAREJADOS
        // =========================

        pairedProducts,
        groupProducts,

        // =========================
        // IMÁGENES
        // =========================

        mainImage:
          cleanImage(
            body.mainImage
          ),

        images:
          Array.isArray(
            body.images
          )
            ? body.images
                .map(
                  (
                    image: unknown
                  ) =>
                    cleanImage(
                      image
                    )
                )
                .filter(
                  (
                    image: string
                  ) =>
                    image !==
                    "/placeholder-product.png"
                )
                .slice(0, 5)
            : [],

        description: String(
          body.description || ""
        ),

        // =========================
        // SECCIONES
        // =========================

        isFeatured:
          Boolean(
            body.isFeatured
          ),

        isOffer:
          Boolean(
            body.isOffer
          ),

        isWeeklyNew:
          Boolean(
            body.isWeeklyNew
          ),

        isActive:
          body.isActive !==
          false,
      });

    await writeAudit({
      action: "Producto creado",
      entityType: "producto",
      entityId: String(product._id),
      entityName: product.title,
      category: product.category,
      actor: "Administrador",
      details: `Stock inicial: ${product.stock}. Costo: Bs${product.costPrice}.`,
    });

    return NextResponse.json(
      {
        success: true,

        product:
          JSON.parse(
            JSON.stringify(
              product
            )
          ),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Error creando producto:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo crear el producto.",

        detail:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      },
      {
        status: 500,
      }
    );
  }
}
