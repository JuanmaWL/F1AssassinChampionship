import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ChampionshipData, SeasonId } from "../types";
import { mockData, mockData2024 } from "../mockData";

const COLLECTION_NAME = "seasons";

export const dataService = {
  /**
   * Loads championship data from Firebase Firestore for a specific season.
   * Falls back to mockData if Firebase is not configured or data doesn't exist.
   */
  async getData(seasonId: SeasonId): Promise<ChampionshipData> {
    if (!db) {
      return seasonId === '2024' ? mockData2024 : mockData;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, seasonId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as ChampionshipData;
      } else {
        if (seasonId === '2024') {
            return mockData2024;
        }
        return mockData;
      }
    } catch (error: any) {
      console.error("Error fetching data from Firebase:", error);
      if (error.code === 'permission-denied') {
        console.warn("Firestore: permiso denegado. Revisa las Rules en Firebase Console.");
      }
      return seasonId === '2024' ? mockData2024 : mockData;
    }
  },

  /**
   * Saves championship data to Firebase Firestore for a specific season.
   */
  async saveData(data: ChampionshipData, seasonId: SeasonId): Promise<void> {
    if (!db) {
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, seasonId);
      await setDoc(docRef, data);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      throw error;
    }
  }
};
