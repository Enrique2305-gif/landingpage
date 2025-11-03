import { initializeApp } from "https://www.gstatic.com/firebasejs/x.y.z/firebase-app.js";
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/x.y.z/firebase-database.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export const saveVote = async (productID) => {
  try {
    const votesRef = ref(database, "votes");
    const newVoteRef = push(votesRef);
    await set(newVoteRef, {
      productID: productID,
      date: new Date().toISOString()
    });
    return {
      status: "success",
      message: "Voto guardado correctamente ✅"
    };
  } catch (error) {
    return {
      status: "error",
      message: `Error al guardar el voto: ${error.message}`
    };
  }
};

export const getVotes = async () => {
  try {
    const dbRef = ref(database, "votes");
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      return { status: true, data: snapshot.val() };
    } else {
      return { status: false, message: "No hay votos registrados aún." };
    }
  } catch (error) {
    return { status: false, message: "Error al obtener los votos: " + error };
  }
};


