import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  projectId: "expert-system-3",
  appId: "1:137723142708:web:5e31bf5648fb8fb13da061",
  apiKey: "AIzaSyBOxcdupn6Vn3Fhj3Drjk4WXvRSavSuuWM",
  authDomain: "expert-system-3.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "expert-system-3.firebasestorage.app",
  messagingSenderId: "137723142708",
  measurementId: "G-3P5ZHJ1S2R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  console.log("Checking Firestore collections for expert-system-3...");
  try {
    const revs = await getDocs(collection(db, "revenues"));
    console.log(`Revenues Count: ${revs.size}`);
    revs.forEach(doc => {
      console.log(`- Revenue ID:`, doc.id, `aliphiaInvoiceId:`, doc.data().aliphiaInvoiceId, `customerName:`, doc.data().customerName, `amount:`, doc.data().amount);
    });

    const quotes = await getDocs(collection(db, "quotations"));
    console.log(`Quotations Count: ${quotes.size}`);
    quotes.forEach(doc => {
      console.log(`- Quotation ID:`, doc.id, doc.data());
    });

    const invs = await getDocs(collection(db, "invoices"));
    console.log(`Invoices Count: ${invs.size}`);
    invs.forEach(doc => {
      console.log(`- Invoice ID:`, doc.id, doc.data());
    });

  } catch (e) {
    console.error("Firestore Inspect Error:", e);
  }
}

inspect().then(() => process.exit(0));
