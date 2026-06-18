import mongoose from "mongoose";

import { connectDB } from "../src/lib/mongodb";
import User from "../src/models/user";
import {
  extractCloudinaryPublicId,
  type DocumentKind,
} from "../src/lib/documentAccess";

const DRY_RUN = process.argv.includes("--dry-run");

function getLegacyFieldMap(kind: DocumentKind) {
  switch (kind) {
    case "photo":
      return { urlField: "photo", publicIdField: "photoPublicId" };
    case "idProof":
      return { urlField: "idProof", publicIdField: "idProofPublicId" };
    case "addressProof":
      return {
        urlField: "addressProof",
        publicIdField: "addressProofPublicId",
      };
  }
}

async function main() {
  await connectDB();

  const cursor = User.find({
    role: { $ne: "admin" },
    $or: [
      { photo: { $regex: "^https?://", $options: "i" } },
      { idProof: { $regex: "^https?://", $options: "i" } },
      { addressProof: { $regex: "^https?://", $options: "i" } },
    ],
  }).cursor();

  let scanned = 0;
  let updated = 0;

  for await (const user of cursor) {
    scanned += 1;
    let changed = false;

    for (const kind of ["photo", "idProof", "addressProof"] as DocumentKind[]) {
      const { urlField, publicIdField } = getLegacyFieldMap(kind);
      const currentPublicId = String((user as any)[publicIdField] || "");
      const currentUrl = String((user as any)[urlField] || "");

      if (!currentPublicId && currentUrl) {
        const extracted = extractCloudinaryPublicId(currentUrl);
        if (extracted) {
          (user as any)[publicIdField] = extracted;
          changed = true;
        }
      }
    }

    if (changed) {
      updated += 1;
      if (!DRY_RUN) {
        await user.save();
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        scanned,
        updated,
      },
      null,
      2,
    ),
  );

  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error("Document migration failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
