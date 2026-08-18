import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    getAuth,
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

async function get_list_count() {
    const listsSnapshot = await getDocs(collection(db, "lists"));
    return listsSnapshot.size;
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const con = params.get("con");

    if (con === null) {
        window.location.href = `/app/loading/?from=hp&action=load_app&target=/app/?con=true`;
    }

    const newListButton = document.getElementById("new_list");
    const seeListsButton = document.getElementById("open_lists");
    const n_lists = await get_list_count();

    seeListsButton.textContent = "See lists (" + n_lists + ")"

    newListButton.addEventListener("click", () => {
        window.location.href = "/app/list/create/";
    });
    
    seeListsButton.addEventListener("click", () => {
        window.location.href = "/app/list/see/";
    });

    const toggleBtn = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    toggleBtn.addEventListener("click", () => {
        menu.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });
});

onAuthStateChanged(auth, async (user) => {
    const createButton = document.getElementById("new_list");
    const seeListsButton = document.getElementById("open_lists");

    if (!user) {
        alert("Bitte melden Sie sich zuerst an!");
        window.location.href = "/app/account/registration/";
        return;
    }

    await user.reload();

    if(user.emailVerified) {
        await updateDoc(doc(db, "accounts", user.uid), { confirmed: true });

        const lastLogIn = new Date (user.metadata.lastSignInTime);
        const missing_days = (new Date() - lastLogIn) / (1000 * 60 * 60 * 24);
        if (missing_days > 5) {
            await signOut(auth);
            alert("Sie wurde aufgrund eines Timeouts abgemeldet. Bitte melden Sie sich erneut an!");
            window.location.href = "/app/account/registration/login/";
            return;
        } else {
            createButton.classList.toggle("selected", false);
            seeListsButton.classList.toggle("selected", false);
            return;
        }
    }

    alert("Sie haben schon ein Konto! Bitte verifizieren Sie jedoch zuerst die E-Mail!");
});