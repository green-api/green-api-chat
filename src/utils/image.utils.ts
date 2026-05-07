const IMAGE_DATA_URI_PREFIX = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;
const EXTERNAL_IMAGE_SRC_PREFIX = /^(https?:\/\/|\/\/|blob:|data:|\/)/i;

const BASE64_IMAGE_SIGNATURES: Record<string, string> = {
  '/9j/': 'image/jpeg',
  iVBOR: 'image/png',
  R0lGOD: 'image/gif',
  UklGR: 'image/webp',
  Qk0: 'image/bmp',
  PHN2Zy: 'image/svg+xml',
};

const BASE64_CONTENT = /^[A-Za-z0-9+/]+={0,2}$/;

function getMimeTypeBySignature(value: string): string | null {
  const signature = Object.keys(BASE64_IMAGE_SIGNATURES).find((item) => value.startsWith(item));
  return signature ? BASE64_IMAGE_SIGNATURES[signature] : null;
}

function isLikelyRawBase64Image(value: string): boolean {
  if (getMimeTypeBySignature(value)) {
    return true;
  }

  return BASE64_CONTENT.test(value) && value.length > 200;
}

export function normalizeAvatarSrc(value?: string | null): string {
  if (!value) return '';

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  const lowerCasedValue = trimmedValue.toLowerCase();
  if (lowerCasedValue === 'undefined' || lowerCasedValue === 'null') {
    return '';
  }

  if (IMAGE_DATA_URI_PREFIX.test(trimmedValue)) {
    return trimmedValue;
  }

  if (isLikelyRawBase64Image(trimmedValue)) {
    const mimeType = getMimeTypeBySignature(trimmedValue) ?? 'image/jpeg';

    return `data:${mimeType};base64,${trimmedValue}`;
  }

  if (EXTERNAL_IMAGE_SRC_PREFIX.test(trimmedValue)) {
    return trimmedValue;
  }

  return trimmedValue;
}
