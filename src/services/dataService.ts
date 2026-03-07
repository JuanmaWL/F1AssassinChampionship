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
      console.log("Firebase not configured, using mock data.");
      return seasonId === '2024' ? mockData2024 : mockData;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, seasonId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as ChampionshipData;
      } else {
        console.log(`No data found for season ${seasonId} in Firebase.`);
        // Return appropriate mock data based on season
        if (seasonId === '2024') {
            return mockData2024;
        }
        return mockData;
      }
    } catch (error: any) {
      console.error("Error fetching data from Firebase:", error);
      if (error.code === 'permission-denied') {
        alert("Error de Permisos en Firestore: Ve a Firebase Console -> Firestore Database -> Rules y cambia 'allow read, write: if false;' por 'allow read, write: if true;'");
      }
      return seasonId === '2024' ? mockData2024 : mockData;
    }
  },

  /**
   * Saves championship data to Firebase Firestore for a specific season.
   */
  async saveData(data: ChampionshipData, seasonId: SeasonId): Promise<void> {
    if (!db) {
      console.info("Firebase not configured, changes will not persist (Local Mode).");
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, seasonId);
      await setDoc(docRef, data);
      console.log(`Data successfully saved to Firebase for season ${seasonId}!`);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      throw error;
    }
  }
};
