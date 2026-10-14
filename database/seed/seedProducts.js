import dotenv from "dotenv";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Product from "../../backend/models/Product.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(here, "../../backend/.env");
dotenv.config({ path: envPath });

const seedPath = path.join(here, "product.json");

async function seedProducts() {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      `MONGODB_URI is missing. Add it to ${envPath} and try again.`
    );
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error(
      "MONGODB_URI must start with mongodb:// or mongodb+srv://. Copy the full connection string from MongoDB Atlas."
    );
  }

  const products = JSON.parse(await readFile(seedPath, "utf8"));
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Product seed file is empty or invalid.");
  }

  const seen = new Set();
  for (const product of products) {
    const sku = typeof product.sku === "string" ? product.sku.trim().toUpperCase() : "";
    if (!sku || seen.has(sku)) {
      throw new Error(`Missing or duplicate SKU in seed file: ${sku || "(missing)"}`);
    }
    seen.add(sku);
  }

  try {
    await mongoose.connect(mongoUri);
    await Product.syncIndexes();

    const operations = products.map((product) => ({
      updateOne: {
        filter: { sku: product.sku.trim().toUpperCase() },
        update: { $set: { ...product, sku: product.sku.trim().toUpperCase() } },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(operations, { ordered: false });
    console.log(
      `Product seed complete. Source records: ${products.length}. Inserted: ${result.upsertedCount}. Updated: ${result.modifiedCount}.`
    );
    console.log("Existing products with other SKUs were not deleted.");
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedProducts().catch((error) => {
  console.error("Product seeding failed:", error.message);
  process.exitCode = 1;
});
