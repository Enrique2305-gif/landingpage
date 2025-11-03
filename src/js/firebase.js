import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// Configuración HARDCODEADA para testing
const firebaseConfig = {
  apiKey: "AIzaSyDoYGmy4yK1s8_oKk8YczZkoT9uYEw_Fpk",
  authDomain: "landingpage-bb433.firebaseapp.com",
  databaseURL: "https://landingpage-bb433-default-rtdb.firebaseio.com",
  projectId: "landingpage-bb433",
  storageBucket: "landingpage-bb433.firebasestorage.app",
  messagingSenderId: "126317700959",
  appId: "1:126317700959:web:451f68ceacab2cf8bf78ea"
};

console.log("Firebase configurado con URL:", firebaseConfig.databaseURL);

// Inicializar Firebase
let database;
try {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log(" Firebase inicializado correctamente");
} catch (error) {
  console.error(" Error inicializando Firebase:", error);
}

const saveVote = async (productID) => {
  try {
    console.log(" Guardando voto para producto:", productID);

    const votesRef = ref(database, "votes");
    const newVoteRef = push(votesRef);

    await set(newVoteRef, {
      productID: productID,
      timestamp: new Date().toISOString(),
    });

    console.log(" Voto guardado exitosamente");

    return {
      status: "success",
      message: "¡Voto guardado correctamente!",
    };
  } catch (error) {
    console.error(" Error en saveVote:", error);
    return {
      status: "error",
      message: `Error al guardar el voto: ${error.message}`,
    };
  }
};

const getVotes = async () => {
  try {
    console.log(" Obteniendo votos...");

    const votesRef = ref(database, 'votes');
    const snapshot = await get(votesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(" Votos obtenidos:", data);

      return {
        success: true,
        data: data
      };
    } else {
      console.log("ℹ No hay votos en la base de datos");
      return {
        success: true,
        data: {}
      };
    }
  } catch (error) {
    console.error(" Error en getVotes:", error);
    return {
      success: false,
      message: `Error al obtener los votos: ${error.message}`
    };
  }
};

export { saveVote, getVotes };