import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    updateDoc,
    setDoc,
    getDocs
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

document.addEventListener("DOMContentLoaded", () => {
    const name_list = document.getElementById("list")
    const acceptance = document.getElementById("acceptance");
    const category = document.getElementById("category");
    const createListButton = document.getElementById("create_list");

    async function save_list() {
        console.log("save_list wurde aufgerufen");
        const listsSnapshot = await getDocs(collection(db, "lists"));
        let maxId = 0;
        listsSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.listNumber > maxId) {
                maxId = data.listNumber;
            }
        });
        const nextId = maxId + 1;
        const listName = name_list.value.trim()

        if (listName === "") {
            alert("Geben Sie einen Namen für die Liste ein!")
            return;
        } if (!acceptance.checked) {
            alert("Stimmen Sie zuerst zu, um eine neue Liste zu erstellen!")
            return;
        }

        const docRef = doc(db, "lists", String(nextId));
        await setDoc(docRef, {
            category: category.value,
            createdAt: new Date(),
            content: [null],
            listNumber: nextId,
            name: listName,
            createdBy: auth.currentUser.uid
        });

        window.location.href = `/app/loading/?from=list&action=create&target=/app/list/view?id=${docRef.id}`;
    }

    createListButton.addEventListener("click", () => {
        save_list();
    });
});

onAuthStateChanged(auth, async (user) => {
    const createListButton = document.getElementById("create_list");

    if (!user) {
        alert("Sie sind nicht angemeldet!");
        window.location.href="/app/account/registration/";
        return;
    } if(user.emailVerified) {
        await updateDoc(doc(db, "accounts", user.uid), { confirmed: true });

        const lastLogIn = new Date (user.metadata.lastSignInTime);
        const missing_days = (new Date() - lastLogIn) / (1000 * 60 * 60 * 24);
        if (missing_days > 5) {
            await signOut(auth);
            alert("Sie wurde aufgrund eines Timeouts abgemeldet. Bitte melden Sie sich erneut an!");
            window.location.href = "/app/account/registration/login/";
            return;
        } else {
            createListButton.classList.toggle("selected", false);
            return;
        }
    }

    alert("Sie haben schon ein Konto! Bitte verifizieren Sie jedoch zuerst die E-Mail!");
});