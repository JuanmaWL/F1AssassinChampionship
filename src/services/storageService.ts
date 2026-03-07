import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";

export const storageService = {
  /**
   * Uploads a file to Firebase Storage and returns the download URL.
   * @param file The file to upload
   * @param path The path in storage (e.g., 'teams/ferrari.png')
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!storage) {
      console.warn("Firebase Storage not configured. Returning fake URL.");
      return URL.createObjectURL(file);
    }

    try {
      console.log(`[Storage] Iniciando subida de ${file.name} a ${path}...`);
      const storageRef = ref(storage, path);
      
      // Add a timeout to prevent infinite spinners
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout: La subida tardó demasiado.")), 60000)
      );

      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      console.log("[Storage] Subida completada. Obteniendo URL de descarga...");
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("[Storage] URL obtenida:", downloadURL);
      
      return downloadURL;
    } catch (error: any) {
      console.error("[Storage] Error detallado:", error);
      
      if (error.code === 'storage/unauthorized') {
        throw new Error("Permiso denegado: Revisa las Reglas de Storage en Firebase (allow read, write: if true;)");
      } else if (error.code === 'storage/canceled') {
        throw new Error("Subida cancelada por el usuario.");
      } else if (error.code === 'storage/unknown') {
        throw new Error("Error desconocido de configuración en Storage.");
      }
      
      throw error;
    }
  }
};
