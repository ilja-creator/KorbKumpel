import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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
    const newListButton = document.getElementById("new_list");

    function create_new_list() {
        window.location.href = "list/index.html";
    }

    newListButton.addEventListener("click", () => {
        console.log("Button 'Create new list' clicked!");
        create_new_list();
    });
});
