/**
 * Convierte un archivo a base64
 * @param file - Archivo a convertir
 * @returns Promise con el string base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Valida si un archivo es una imagen válida
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
export const isValidImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

/**
 * Valida el tamaño de un archivo
 * @param file - Archivo a validar
 * @param maxSize - Tamaño máximo en bytes
 * @returns true si el tamaño es válido
 */
export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

