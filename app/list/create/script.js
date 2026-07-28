import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs
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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const name_list = document.getElementById("list")
    const acception = document.getElementById("acception");
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
        }
        if (!acception.checked) {
            alert("Stimmen Sie zuerst zu, um eine neue Liste zu erstellen!")
            return;
        }
        const docRef = doc(db, "lists", String(nextId));
        await setDoc(docRef, {
            category: category.value,
            createdAt: new Date(),
            content: [null],
            listNumber: nextId,
            name: listName
        });

        window.location.href = `../../loading.html?from=list&action=create&target=/app/list/view?id=${docRef.id}`;
    }

    createListButton.addEventListener("click", () => {
        save_list();
    })
})