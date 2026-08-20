import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";

function cleanImage(value: unknown) {
  const image = String(
    value || ""
  ).trim();

  if (!image) {
    return "/placeholder-product.png";
  }

  return image;
}

function cleanCategory(
  value: unknown
) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function cleanCategories(
  value: unknown,
  fallbackCategory: string
) {
  const receivedCategories =
    Array.isArray(value)
      ? value
      : [];

  const categories =
    receivedCategories
      .map((item) =>
        cleanCategory(item)
      )
      .filter(Boolean);

  if (fallbackCategory) {
    categories.unshift(
      fallbackCategory
    );
  }

  return Array.from(
    new Set(categories)
  );
}

function cleanNumber(
  value: unknown
) {
  const number = Number(
    value || 0
  );

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.max(
    0,
    number
  );
}

function cleanRentalDays(
  value: unknown
) {
  const number = Number(
    value || 1
  );

  if (Number.isNaN(number)) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(number)
  );
}

function cleanPairedProducts(
  value: unknown,
  currentProductId?: string
) {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids = value
    .map((item) =>
      String(
        item || ""
      ).trim()
    )
    .filter(
      (item) =>
        item &&
        Types.ObjectId.isValid(
          item
        ) &&
        item !==
          currentProductId
    );

  return Array.from(
    new Set(ids)
  ).slice(0, 4);
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      productId: string;
    }>;
  }
) {
  try {
    const { productId } =
      await params;

    await connectDB();

    const product =
      await Product.findById(
        productId
      ).lean();

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Producto no encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      product: JSON.parse(
        JSON.stringify(product)
      ),
    });
  } catch (error) {
    console.error(
      "Error obteniendo producto:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo obtener el producto.",

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

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      productId: string;
    }>;
  }
) {
  try {
    const { productId } =
      await params;

    const body =
      await request.json();

    await connectDB();

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Producto no encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    const category =
      cleanCategory(
        body.category ||
          "cosplays"
      );

    const categories =
      cleanCategories(
        body.categories,
        category
      );

    const isRentable =
      Boolean(
        body.isRentable
      );

    const pairedProducts =
      cleanPairedProducts(
        body.pairedProducts,
        productId
      );

    product.title =
      String(
        body.title || ""
      ).trim();

    product.slug =
      String(
        body.slug || ""
      )
        .trim()
        .toLowerCase();

    product.category =
      category;

    product.categories =
      categories;

    product.status =
      body.status ===
      "preventa"
        ? "preventa"
        : "stock";

    // =========================
    // VENTA
    // =========================

    product.price =
      cleanNumber(
        body.price
      );

    product.costPrice =
      cleanNumber(
        body.costPrice
      );

    product.oldPrice =
      cleanNumber(
        body.oldPrice
      );

    product.stock =
      cleanNumber(
        body.stock
      );

    // =========================
    // ALQUILER
    // =========================

    product.isRentable =
      isRentable;

    product.rentalPrice =
      isRentable
        ? cleanNumber(
            body.rentalPrice
          )
        : 0;

    product.rentalDeposit =
      isRentable
        ? cleanNumber(
            body.rentalDeposit
          )
        : 0;

    product.rentalDays =
      isRentable
        ? cleanRentalDays(
            body.rentalDays
          )
        : 1;

    product.rentalAvailable =
      isRentable
        ? body.rentalAvailable !==
          false
        : false;

    // =========================
    // PRODUCTOS EMPAREJADOS
    // =========================

    product.pairedProducts =
      pairedProducts;

    // =========================
    // IMÁGENES
    // =========================

    product.mainImage =
      cleanImage(
        body.mainImage
      );

    product.images =
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
        : [];

    product.description =
      String(
        body.description || ""
      );

    // =========================
    // SECCIONES
    // =========================

    product.isFeatured =
      Boolean(
        body.isFeatured
      );

    product.isOffer =
      Boolean(
        body.isOffer
      );

    product.isWeeklyNew =
      Boolean(
        body.isWeeklyNew
      );

    if (Number(product.stock || 0) <= 0) {
      product.isOffer = false;
      product.isWeeklyNew = false;
    }

    product.isActive =
      body.isActive !==
      false;

    await product.save();

    return NextResponse.json({
      success: true,

      product: JSON.parse(
        JSON.stringify(
          product
        )
      ),
    });
  } catch (error) {
    console.error(
      "Error actualizando producto:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo actualizar el producto.",

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

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      productId: string;
    }>;
  }
) {
  try {
    const { productId } =
      await params;

    await connectDB();

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Producto no encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      Antes de eliminarlo,
      quitamos este producto
      de los emparejamientos
      de otros productos.
    */

    await Product.updateMany(
      {
        pairedProducts:
          productId,
      },
      {
        $pull: {
          pairedProducts:
            productId,
        },
      }
    );

    await Product.findByIdAndDelete(
      productId
    );

    return NextResponse.json({
      success: true,

      message:
        "Producto eliminado correctamente.",
    });
  } catch (error) {
    console.error(
      "Error eliminando producto:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el producto.",

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
