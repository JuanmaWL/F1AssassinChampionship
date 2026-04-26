import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ChampionshipData, SeasonId } from "../types";
import { DEFAULT_DATA, DEFAULT_DATA_2024 } from "../data/defaultData";

const COLLECTION_NAME = "seasons";
const VISITS_COLLECTION = "visits";

export interface VisitData {
  hashedIp: string;
  os: string;
  browser: string;
  language: string;
  screenResolution: string;
  deviceType: string;
  referrer: string;
  pathname: string;
  timezone: string;
  touchSupport: boolean;
  memory?: number;
  cores?: number;
  timestamp: number;
}

const requireDb = () => {
  if (!db) throw new Error('Firebase not configured');
  return db;
};

export const dataService = {
  /**
   * Loads championship data from Firebase Firestore for a specific season.
   * Falls back to mockData if Firebase is not configured or data doesn't exist.
   */
  async getData(seasonId: SeasonId): Promise<ChampionshipData> {
    if (!db) {
      return seasonId === '2024' ? DEFAULT_DATA_2024 : DEFAULT_DATA;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, seasonId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as ChampionshipData;
      } else {
        if (seasonId === '2024') {
            return DEFAULT_DATA_2024;
        }
        return DEFAULT_DATA;
      }
    } catch (error: any) {
      console.error("Error fetching data from Firebase:", error);
      if (error.code === 'permission-denied') {
        console.warn("Firestore: permiso denegado. Revisa las Rules en Firebase Console.");
      }
      return seasonId === '2024' ? DEFAULT_DATA_2024 : DEFAULT_DATA;
    }
  },

  /**
   * Saves championship data to Firebase Firestore for a specific season.
   */
  async saveData(data: ChampionshipData, seasonId: SeasonId): Promise<void> {
    try {
      const database = requireDb();
      const docRef = doc(database, COLLECTION_NAME, seasonId);
      await setDoc(docRef, data);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      throw error;
    }
  },

  /**
   * Saves a visit record to Firestore.
   */
  async saveVisit(visit: VisitData): Promise<void> {
    try {
      const database = requireDb();
      await addDoc(collection(database, VISITS_COLLECTION), visit);
    } catch (error) {
      console.error("Error saving visit to Firebase:", error);
    }
  },

  /**
   * Retrieves all visit records from Firestore.
   */
  async getVisits(): Promise<VisitData[]> {
    try {
      const database = requireDb();
      const q = query(collection(database, VISITS_COLLECTION), orderBy("timestamp", "desc"), limit(500));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as VisitData);
    } catch (error) {
      console.error("Error fetching visits from Firebase:", error);
      return [];
    }
  }
};
