const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function readImageFile(file) {
  if (!file?.type.startsWith('image/')) {
    return Promise.reject(new Error('Seleccioná un archivo de imagen válido.'));
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return Promise.reject(new Error('La imagen debe pesar menos de 2 MB.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}