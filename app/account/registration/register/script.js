import {permissions} from "/assets/docs/permissions.js";
import {signs} from '/assets/docs/signs.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification
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

async function new_account(email, password, user_type) {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;
        await sendEmailVerification(user);
        await setDoc(doc(db, "accounts", user.uid), {
            email: email,
            user_type: user_type,
            created_at: new Date(),
            confirmed: false
        });
        alert("Es wurde eine E-Mail an " + email + " geschickt. Bitte bestätigen Sie die Registreirung!")
        if (email.ensWith("@gmail.com")) {
            window.open("https://www.gmail.com", "_blank");
        }
    } catch (error) {
        console.error(error);
        if (error.code === "auth/email-already-in-use") { alert("Sie können nur einen Account haben!") }
        alert("Es ist ein unerwarteter Fehler aufgetreten! Bitte melden Sie sich bei den Entwicklern" + error.message);
    }
}

async function check_pw(email, password) {
    const pw = password.toLowerCase();
    const email_1 = email.split("@")[0].toLowerCase();

    const all_categories = [signs.lowerCaseSigns, signs.upperCaseSigns, signs.numberSigns, signs.specialCharacters];
    if (pw.length < 8) {
        return false;
    } for (const category of all_categories) {
        if (!category.some((sign) => password.includes(sign))) {
            return false;
        }
    }

    let string = "";
    if (pw.includes(email_1)) {
        return false;
    }
    for (const sign of email_1) {
        if (sign === ".") {
            if (pw.includes(string)) {
                return false;
            }
            string = "";
        } else { string += sign;}
    }
    if (pw.includes(string)) {
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", async () => {
    const emailInput = document.getElementById("email");
    const typeInput = document.getElementById("type");
    const passwordInput = document.getElementById("password");
    const registerButton = document.getElementById("login");

    registerButton.addEventListener("click", async () => {
        const email = emailInput.value.trim().toLowerCase();
        const type = typeInput.value;
        const pw = passwordInput.value;
        const pwInfo = document.getElementById("password-info");
        if (!email.includes("@") || !email.includes(".")) {
            alert("Bitte geben Sie eine gültige E-Mail-Adresse ein!");
        } else if (type === "admin" && !permissions.admin.includes(email)) {
            alert("Sie haben leider keine Berechtigung auf ein AdministratorInnenkonto!");
        } else if (type === "dev" && !permissions.dev.includes(email)) {
            alert("Sie haben leider keine Berechtigung auf ein EntwicklerInnenkonto!");
        } else if (type === "special" && !permissions.special.includes(email)) {
            alert("Sie haben leider keine Berechtigung auf ein Spezialkonto!");
        } else if (type === "with") {
            alert("Diese Funktion ist leider noch nicht verfügbar!");
        } else if (!await check_pw(email, pw)) {
            alert("Dieses Passwort ist zu unsicher! Um die Passwortanforderungen zu lesen, klicken Sie auf den Link unten!");
            pwInfo.classList.toggle("hidden", false);
        }
        else {
            new_account(email, pw, type);
        }
    });
});