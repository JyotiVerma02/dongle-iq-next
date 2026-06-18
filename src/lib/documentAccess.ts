export type DocumentKind = "photo" | "idProof" | "addressProof";

const DOCUMENT_KIND_FIELD_MAP: Record<
  DocumentKind,
  { publicIdField: string; urlField: string; resourceType: "image" | "raw" | "auto" }
> = {
  photo: {
    publicIdField: "photoPublicId",
    urlField: "photo",
    resourceType: "image",
  },
  idProof: {
    publicIdField: "idProofPublicId",
    urlField: "idProof",
    resourceType: "auto",
  },
  addressProof: {
    publicIdField: "addressProofPublicId",
    urlField: "addressProof",
    resourceType: "auto",
  },
};

export function getDocumentFieldNames(kind: DocumentKind) {
  return DOCUMENT_KIND_FIELD_MAP[kind];
}

export function getDocumentRouteHref(userId: string, kind: DocumentKind) {
  return `/api/documents/${encodeURIComponent(userId)}/${kind}`;
}

export function extractCloudinaryPublicId(value?: string | null) {
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes("cloudinary.com")) {
      return "";
    }

    const uploadMarker = "/upload/";
    const uploadIndex = parsed.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) {
      return "";
    }

    const afterUpload = parsed.pathname.slice(uploadIndex + uploadMarker.length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const withoutExtension = withoutVersion.replace(/\.[^.]+$/, "");
    return withoutExtension;
  } catch {
    return "";
  }
}

