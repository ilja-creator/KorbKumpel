import {permissions} from "/assets/docs/permissions.js";
import {signs} from '/assets/docs/signs.js';

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
    onAuthStateChanged
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

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        return;
    }

    await user.reload();

    if(user.emailVerified) {
        await updateDoc(doc(db, "accounts", user.uid), { confirmed: true });

        const lastLogIn = new Date (user.metadata.lastSignInTime);
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
});

async function new_account(email, username, password, user_type) {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;
        const actionCodeSettings = {
            url: window.location.origin + "/app/account/registration/register/verified/",
            handleCodeInApp: false
        };

        await sendEmailVerification(user, actionCodeSettings);
        await setDoc(doc(db, "accounts", user.uid), {
            email: email,
            username: username,
            user_type: user_type,
            created_at: new Date(),
            confirmed: false
        });
        window.location.href = "/app/loading/?from=register&action=create&target=/app/account/registration/register/confirmation/";
    } catch (error) {
        console.error(error);
        if (error.code === "auth/email-already-in-use") { alert("Sie können nur einen Account haben!") }
        alert("Es ist ein unerwarteter Fehler aufgetreten! Bitte melden Sie sich bei den Entwicklern. Error-Info: " + error.message);
    }
}

async function check_pw(email, password) {
    const pw = password.toLowerCase();
    const email_1 = email.split("@")[0].toLowerCase();

    const all_categories = [signs.lowerCaseSigns, signs.upperCaseSigns, signs.numberSigns, signs.specialCharacters];
    if (pw.length < 8) {
        console.log("Error – Too short (" + pw.length + "/8)");
        return false;
    } for (const category of all_categories) {
        if (!category.some((sign) => password.includes(sign))) {
            console.log("Error – Missing letter type (" + category + ")");
            return false;
        }
    }

    let string = "";
    if (pw.includes(email_1)) {
        console.log("Error – Includes E-Mail-Name")
        return false;
    }
    for (const sign of email_1) {
        if (sign === ".") {
            if (pw.includes(string)) {
                console.log("Error – Includes E-Mail-Name")
                return false;
            }
            string = "";
        } else { string += sign;}
    }
    if (pw.includes(string)) {
        console.log("Error – Includes E-Mail-Name")
        return false;
    }
    console.log("Password check -> Positive")
    return true;
}
async function username_exists(new_username) {
    const accountsSnapshot = await getDocs(collection(db, "accounts"));

    for (const account of accountsSnapshot.docs) {
        const data = account.data();

        if (!data.username) {
            continue;
        }

        const username = data.username.toLowerCase();

        if (new_username.trim().toLowerCase() === username) {
            return true;
        }
    }
    return false;
}
async function email_exists(new_email, new_type) {
    const accountsSnapshot = await getDocs(collection(db, "accounts"));

    for (const account of accountsSnapshot.docs) {
        const data = account.data();
        const email = data.email.trim().toLowerCase();
        const type = data.user_type.trim();

        if (new_email.trim().toLowerCase() === email && new_type === type) {
            return true;
        }
    }
    return false;
}

document.addEventListener("DOMContentLoaded", async () => {
    const emailInput = document.getElementById("email");
    const usernameInput = document.getElementById("username");
    const typeInput = document.getElementById("type");
    const passwordInput = document.getElementById("password");
    const sec_passwordInput = document.getElementById("check_password");
    const registerButton = document.getElementById("login");

    registerButton.addEventListener("click", async () => {
        const email = emailInput.value.trim().toLowerCase();
        const username = usernameInput.value.trim();
        const type = typeInput.value;
        const pw = passwordInput.value;
        const s_pw = sec_passwordInput.value;
        const pwInfo = document.getElementById("password-info");
        if (!email.includes("@") || !email.includes(".")) {
            alert("Bitte geben Sie eine gültige E-Mail-Adresse ein!");
        } else if (await username_exists(username)) {
            alert("Dieser Benutzername existiert schon. Bitte wählen Sie einen anderen!");
        } else if (await email_exists(email, type)) {
            alert("Sie können nur ein Konto erstellen!")
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
        } else if (pw !== s_pw) {
            alert("Die Passwörter stimmen nicht überein!");
        }
        else {
            new_account(email, username, pw, type);
        }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const accountsSnapshot = await getDocs(collection(db, "accounts"));
    const now = new Date();

    for (const account of accountsSnapshot.docs) {
        const data = account.data();

        if (!data.confirmed) {
            const createdAt = data.created_at.toDate();
            const difference = (now - createdAt) / (1000 * 60 * 60 * 24);

            if (difference > 1) { await deleteDoc(doc(db, "accounts", account.id)); }
        }
    }
    console.log(window.location.origin);
});