export const APPLICATION_CONFIG_KEY = "dongle-iq-application-config";
export const PREVIEW_DRAFT_KEY = "dongle-iq-preview-draft";

export type StoredFile = {
  name: string;
  type: string;
  dataUrl: string;
};

export type PreviewDraft = {
  formData: Record<string, string>;
  files: {
    photo: StoredFile;
    idProof: StoredFile;
    addressProof: StoredFile;
  };
};

export async function fileToStoredFile(file: File): Promise<StoredFile> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    type: file.type,
    dataUrl,
  };
}

export async function storedFileToFile(storedFile: StoredFile): Promise<File> {
  const response = await fetch(storedFile.dataUrl);
  const blob = await response.blob();
  return new File([blob], storedFile.name, { type: storedFile.type });
}

export function savePreviewDraft(draft: PreviewDraft) {
  window.sessionStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(draft));
}

export function readPreviewDraft(): PreviewDraft | null {
  const raw = window.sessionStorage.getItem(PREVIEW_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PreviewDraft;
  } catch {
    return null;
  }
}

export function clearPreviewDraft() {
  window.sessionStorage.removeItem(PREVIEW_DRAFT_KEY);
}
