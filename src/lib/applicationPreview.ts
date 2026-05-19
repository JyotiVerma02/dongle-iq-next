export const APPLICATION_CONFIG_KEY = "dongle-iq-application-config";
export const PREVIEW_DRAFT_KEY = "dongle-iq-preview-draft";
export const FORM_STATE_KEY = "dongle-iq-form-state";

let memoryFiles: PreviewDraft["files"] | null = null;

export type StoredFile = {
  name: string;
  type: string;
  preview: string;
  file?: File;
  isExisting?: boolean;
};

export type FormStateStorage = Record<string, string>;

export function saveFormState(state: FormStateStorage) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    FORM_STATE_KEY,
    JSON.stringify(state),
  );
}

export function readFormState(): FormStateStorage | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(FORM_STATE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as FormStateStorage;
  } catch {
    return null;
  }
}

export function clearFormState() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(FORM_STATE_KEY);
}

export type PreviewDraft = {
  formData: Record<string, string>;
  files: {
    photo: StoredFile;
    idProof: StoredFile;
    addressProof: StoredFile;
  };
};

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.82
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function fileToStoredFile(
  file: File,
): Promise<StoredFile> {
  const optimizedFile = await compressImage(file);
  return {
    name: optimizedFile.name,
    type: optimizedFile.type,
    preview: URL.createObjectURL(optimizedFile),
    file: optimizedFile,
  };
}

export async function storedFileToFile(
  storedFile: StoredFile,
): Promise<File> {
  if (storedFile.file) {
    return storedFile.file;
  }

  const response = await fetch(storedFile.preview);

  const blob = await response.blob();

  return new File(
    [blob],
    storedFile.name,
    {
      type: storedFile.type,
    },
  );
}

export function savePreviewDraft(
  draft: PreviewDraft,
) {
  memoryFiles = draft.files;

  const lightweightDraft = {
    ...draft,
    files: {
      photo: {
        name: draft.files.photo.name,
        type: draft.files.photo.type,
        preview: draft.files.photo.preview,
      },
      idProof: {
        name: draft.files.idProof.name,
        type: draft.files.idProof.type,
        preview: draft.files.idProof.preview,
      },
      addressProof: {
        name: draft.files.addressProof.name,
        type: draft.files.addressProof.type,
        preview: draft.files.addressProof.preview,
      },
    },
  };

  window.sessionStorage.setItem(
    PREVIEW_DRAFT_KEY,
    JSON.stringify(lightweightDraft),
  );
}

export function getMemoryFiles() {
  return memoryFiles;
}

export function readPreviewDraft(): PreviewDraft | null {
  const raw =
    window.sessionStorage.getItem(
      PREVIEW_DRAFT_KEY,
    );

  if (!raw) return null;

  try {
    const parsed =
      JSON.parse(raw) as PreviewDraft;

    if (memoryFiles) {
      parsed.files = memoryFiles;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPreviewDraft() {
  window.sessionStorage.removeItem(
    PREVIEW_DRAFT_KEY,
  );

  memoryFiles = null;
}