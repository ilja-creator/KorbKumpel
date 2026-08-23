import {emailLinks} from '/assets/docs/email-links.js';

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

async function forwarding(email) {
    let link = null;
    for (const emailLink of emailLinks) {
        if (email.endsWith(emailLink[0])) {
            link = emailLink[1]
            break;
        }
    }
    if (link !== null) {
        window.open("https://" + link, "_blank");
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Sie sind noch nicht angemeldet!");
        window.location.href = "/login/";
        return;
    }
    const forwardButton = document.getElementById("forward");
    const message = document.getElementById("message");

    message.innerHTML = `Es wurde eine E-Mail an <i>${user.email}</i> geschickt.`;

    for (const email_add of emailLinks) {
        if (user.email.includes(email_add[0])) {
            forwardButton.classList.toggle("hidden", false);
        }
    }

    forwardButton.addEventListener("click", () => {
        forwarding(user.email);
    });
});

const toggleBtn = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("open");
    document.body.classList.toggle("menu-open");
});