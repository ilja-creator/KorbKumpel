import {initializeApp} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let check = true;

onAuthStateChanged(auth, async (user) => {
    if (check) {
        if (!user) {
            return;
        }
        await user.reload();

        if (user.emailVerified) {
            await updateDoc(doc(db, "accounts", user.uid), {confirmed: true});

            const lastLogIn = new Date(user.metadata.lastSignInTime);
            const missing_days = (Date.now() - lastLogIn) / (1000 * 60 * 60 * 24);
            if (missing_days > 5) {
                await signOut(auth)
                return;
            } else {
                alert("Sie sind bereits angemeldet!");
                window.location.href = "/app/";
                return;
            }
        }
        alert("Sie haben schon ein Konto! Bitte verifizieren Sie jedoch zuerst die E-Mail!");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    loginButton.addEventListener("click", async() => {
        check = false;
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const user = credential.user;
            await user.reload();

            if (!user.emailVerified) {
                alert("Bitte verifizieren Sie zuerst Ihre E-Mail-Adresse!");
                return;
            }
            await updateDoc(doc(db, "accounts", user.uid), { confirmed: true });

            window.location.href = "/app/";

        } catch (error) {
            check = true;

            console.log(error);

            if (error.code === "auth/invalid-credential") {
                alert("Eine Anmeldung mit dieser E-Mail-Passwort-Kombination ist nicht möglich!");
            } else if (error.code === "auth/invalid-email") {
                alert("Bittte überprüfen Sie Ihre E-Mail-Adresse!");
            } else if (error.code === "auth/invalid-password") {
                alert("Bitte überprüfen Sie Ihr Passwort!");
            } else if (error.code === "auth/too-many-requests") {
                alert("Zu viele Versuche. Bitte versuchen Sie es später erneut!");
            } else {
                alert("Login fehlgeschlagen! Wenn dieser Fehler häufiger auftreten sollte, melden Sie sich bitte bei den Entwicklern. Error-Code: " + error.message);
            }
        }
    })
});