import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsFepvv7MuyCPWs4v-qTSIMnBCb3Xqbc0",
  authDomain: "display-adds-ee8f3.firebaseapp.com",
  projectId: "display-adds-ee8f3",
  storageBucket: "display-adds-ee8f3.firebasestorage.app",
  messagingSenderId: "64879918792",
  appId: "1:64879918792:web:0e54a6e94357c46e68447d",
  measurementId: "G-HPBBM8KTSB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Upload file to Firebase Storage
export const uploadFileToStorage = async (file) => {
  const uniqueName = `assets/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, uniqueName);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Sync portfolio data in real-time
export const syncPortfolioData = (onUpdate) => {
  const docRef = doc(db, "app", "portfolioData");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data());
    } else {
      onUpdate(null);
    }
  });
};

// Save portfolio data
export const savePortfolioData = async (newData) => {
  const docRef = doc(db, "app", "portfolioData");
  await setDoc(docRef, newData);
};

export { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  storage
};

// --- Analytics Functions ---
export const logVisit = async () => {
  try {
    const visitsRef = collection(db, 'analytics_visits');
    await addDoc(visitsRef, {
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      userAgent: navigator.userAgent
    });
  } catch (err) {
    console.error('Error logging visit', err);
  }
};

export const saveLead = async (leadData) => {
  try {
    const leadsRef = collection(db, 'analytics_leads');
    await addDoc(leadsRef, {
      ...leadData,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    });
    return true;
  } catch (err) {
    console.error('Error saving lead', err);
    return false;
  }
};

export const syncAnalyticsVisits = (onUpdate) => {
  const q = query(collection(db, 'analytics_visits'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const visits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(visits);
  });
};

export const syncAnalyticsLeads = (onUpdate) => {
  const q = query(collection(db, 'analytics_leads'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(leads);
  });
};
