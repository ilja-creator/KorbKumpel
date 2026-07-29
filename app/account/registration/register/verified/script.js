import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
getFirestore,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDVyeXu7qx6ESApel4Ew8CaQyi0tmLiHc",
    authDomain: "korbkumpel.firebaseapp.com",
    projectId: "korbkumpel",
    storageBucket: "korbkumpel.firebasestorage.app",
    messagingSenderId: "961303507171",
    appId: "1:961303507171:web:f7c8e17cc351ad8e0455d6",
    measurementId: "G-0PWQC24N08"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    const message = document.getElementById("message");
    const url = document.getElementById("login");

    if (!user) {
        message.textContent = "Es tut uns leid, aber Sie sind leider nicht angemeldet!";
        url.classList.toggle("hidden", false);

        return;
    }

    await user.reload();

    if (user.emailVerified) {
        await updateDoc(doc(db, "accounts", user.uid), {
            confirmed: true
        });
         message.textContent = "Ihre E-Mail-Adresse wurde erfolgreich bestätigt! Vielen Dank!";
         url.classList.toggle("hidden", true);
    } else {
        message.textContent = "Ihre E-Mail-Adresse konnte leider nicht bestätigt werden.";
        alert("Probieren Sie den Link erneut zu öffnen oder die Seite neuzuladen. Falls dieses Problem häufiger auftritt und Sie sich nicht mehr anmelden können, melden Sie sich bitte bei den Entwicklern!");
    }
});