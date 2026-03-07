import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ChampionshipData } from "../types";
import { mockData } from "../mockData";

const COLLECTION_NAME = "championships";
const DOC_ID = "season_2025"; // Single document for this app instance

export const dataService = {
  /**
   * Loads championship data from Firebase Firestore.
   * Falls back to mockData if Firebase is not configured or data doesn't exist.
   */
  async getData(): Promise<ChampionshipData> {
    if (!db) {
      console.log("Firebase not configured, using mock data.");
      return mockData;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as ChampionshipData;
      } else {
        console.log("No data found in Firebase, initializing with mock data...");
        // Optionally initialize the database with mock data
        await this.saveData(mockData);
        return mockData;
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      return mockData;
    }
  },

  /**
   * Saves championship data to Firebase Firestore.
   */
  async saveData(data: ChampionshipData): Promise<void> {
    if (!db) {
      console.warn("Firebase not configured, changes will not persist.");
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      await setDoc(docRef, data);
      console.log("Data successfully saved to Firebase!");
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      throw error;
    }
  }
};
