export const APPLICATION_CONFIG_KEY = "dongle-iq-application-config";
export const PREVIEW_DRAFT_KEY = "dongle-iq-preview-draft";
export const FORM_STATE_KEY = "dongle-iq-form-state";

let memoryFiles: PreviewDraft["files"] | null = null;

export type StoredFile = {
  name: string;
  type: string;
  preview: string;
  file?: File;
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

export async function fileToStoredFile(
  file: File,
): Promise<StoredFile> {
  return {
    name: file.name,
    type: file.type,
    preview: URL.createObjectURL(file),
    file,
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