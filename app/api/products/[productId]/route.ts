import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "../../../../lib/mongodb";
import { writeAudit } from "../../../../lib/audit";
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

function cleanInventoryLots(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((lot) => {
      const data = lot as { quantity?: unknown; remaining?: unknown; costPrice?: unknown };
      const quantity = Math.floor(cleanNumber(data?.quantity));
      const remaining = Math.floor(cleanNumber(data?.remaining ?? data?.quantity));
      return { quantity, remaining: Math.min(remaining, quantity), costPrice: cleanNumber(data?.costPrice) };
    })
    .filter((lot) => lot.quantity > 0);
}
function cleanPairedProducts(
  value: unknown,
  currentProductId?: string,
  maxProducts = 4
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
  ).slice(0, maxProducts);
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
    const groupProducts = cleanPairedProducts(body.groupProducts, productId, 20);

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

    const newLotCost = cleanNumber(body.costPrice);
    const stockToAdd = Math.floor(cleanNumber(body.stockToAdd));
    const currentStock = Number(product.stock || 0);
    const manualLots = cleanInventoryLots(body.inventoryLots);

    if (Array.isArray(body.inventoryLots)) {
      const manualLotsTotal = manualLots.reduce((total, lot) => total + lot.remaining, 0);
      if (manualLotsTotal !== currentStock) {
        return NextResponse.json(
          { error: "La suma de los lotes debe coincidir con el stock actual." },
          { status: 400 }
        );
      }
      product.inventoryLots = manualLots.map((lot) => ({ ...lot, receivedAt: new Date() }));
    }

    const previousPrice = Number(product.price || 0);
    const previousStock = Number(product.stock || 0);
    const currentLots = Array.isArray(product.inventoryLots)
      ? product.inventoryLots
      : [];

    // Productos creados antes de los lotes: su stock actual se convierte en
    // un lote inicial al primer guardado, sin cambiar el inventario.
    if (currentLots.length === 0 && manualLots.length === 0 && currentStock > 0) {
      product.inventoryLots = [
        {
          quantity: currentStock,
          remaining: currentStock,
          costPrice: Number(product.costPrice || newLotCost || 0),
          receivedAt: product.createdAt || new Date(),
        },
      ];
    }

    if (stockToAdd > 0) {
      product.inventoryLots = [
        ...(Array.isArray(product.inventoryLots) ? product.inventoryLots : []),
        {
          quantity: stockToAdd,
          remaining: stockToAdd,
          costPrice: newLotCost,
          receivedAt: new Date(),
        },
      ];
      product.stock = currentStock + stockToAdd;
      product.costPrice = newLotCost;
    } else if (currentLots.length === 0 && currentStock === 0) {
      // Solo sirve como valor sugerido para la próxima reposición.
      product.costPrice = newLotCost;
    }

    product.oldPrice =
      cleanNumber(
        body.oldPrice
      );

    // =========================
    // ALQUILER
    // =========================

    product.isRentable =
      isRentable;
    product.rentalOnly = isRentable && Boolean(body.rentalOnly);

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
    product.groupProducts = groupProducts;

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
    const addedStock = Math.max(0, Number(product.stock || 0) - previousStock);
    const changes = [
      previousPrice !== Number(product.price || 0)
        ? `Precio: Bs${previousPrice} → Bs${product.price}.`
        : "",
      addedStock > 0 ? `Se añadieron ${addedStock} unidades a Bs${newLotCost}.` : "",
      addedStock === 0 && Array.isArray(body.inventoryLots) ? "Lotes de stock corregidos." : "",
    ]
      .filter(Boolean)
      .join(" ");

    await writeAudit({
      action: addedStock > 0 ? "Stock añadido" : "Producto actualizado",
      entityType: "producto",
      entityId: String(product._id),
      entityName: product.title,
      category: product.category,
      actor: "Administrador",
      details: changes || "Información del producto actualizada.",
    });
    await Product.updateMany(
      { _id: { $ne: productId }, pairedProducts: productId },
      { $pull: { pairedProducts: productId } }
    );

    for (const pairedId of pairedProducts) {
      const pairedProduct = await Product.findById(pairedId);
      if (!pairedProduct) continue;
      const currentPairs = Array.isArray(pairedProduct.pairedProducts)
        ? pairedProduct.pairedProducts.map((id: unknown) => String(id))
        : [];
      if (!currentPairs.includes(String(productId)) && currentPairs.length < 4) {
        pairedProduct.pairedProducts = [...currentPairs, String(productId)];
        await pairedProduct.save();
      }
    }

    await Product.updateMany(
      { _id: { $ne: productId }, groupProducts: productId },
      { $pull: { groupProducts: productId } }
    );
    for (const groupId of groupProducts) {
      const groupProduct = await Product.findById(groupId);
      if (!groupProduct) continue;
      const groups = Array.isArray(groupProduct.groupProducts)
        ? groupProduct.groupProducts.map((id: unknown) => String(id))
        : [];
      const completeGroup = Array.from(new Set([
        ...groupProducts.map((id) => String(id)),
        String(productId),
        ...groups,
      ])).slice(0, 20);
      if (completeGroup.length !== groups.length || !groups.includes(String(productId))) {
        groupProduct.groupProducts = completeGroup;
        await groupProduct.save();
      }
    }

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
