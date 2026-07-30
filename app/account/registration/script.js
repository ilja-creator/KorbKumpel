import {permissions} from "/assets/docs/permissions.js";
import {signs} from '/assets/docs/signs.js';
import {emailLinks} from '/assets/docs/email-links.js';

import {initializeApp} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    signOut
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

document.addEventListener("DOMContentLoaded", async () => {
    const registerButton = document.getElementById("register");
    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");

    registerButton.addEventListener("click", () => {
        window.location.href = "/app/account/registration/register/";
    });

    loginButton.addEventListener("click", () => {
        window.location.href = "/app/account/registration/login/";
    });

    logoutButton.addEventListener("click", async() => {
        const user = auth.currentUser;
        if (user) {
            await signOut(auth);

           window.close();
           setTimeout(() => {
               window.location.href = "/";
           }, 500);
        } else {
            alert("Diese Funktion ist nur verfügbar, wenn Sie angemeldet sind!");
        }
    });
});

onAuthStateChanged(auth, async (user) => {
    const signOutButton = document.getElementById("logout");

    if (!user) {
        return;
    }

    await user.reload();

    if(user.emailVerified) {
        await updateDoc(doc(db, "accounts", user.uid), { confirmed: true });

        const lastLogIn = new Date (user.metadata.lastSignInTime);
        const missing_days = (new Date() - lastLogIn) / (1000 * 60 * 60 * 24);
        if (missing_days > 5) {
            await signOut(auth)
            return;
        } else {
            alert("Sie sind bereits angemeldet!");
            signOutButton.classList.toggle("selected", false);
            return;
        }
    }

    alert("Sie haben schon ein Konto! Bitte verifizieren Sie jedoch zuerst die E-Mail!");
});