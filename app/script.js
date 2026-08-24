import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm';

emailjs.init({
    publicKey: "qQjyms3EOPdybsHRJ"
});

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

async function load_updates() {
    const response = await fetch("/information/updates/update-information.json");
    return (await response.json()).updates;
}

async function get_latest_version(updates) {
    const validUpdates = updates.filter((u) => u.version && u.features_list);

    validUpdates.sort((a, b) => {
        const partsA = a.version.replace("v", "").split("-").map(Number);
        const partsB = b.version.replace("v", "").split("-").map(Number);

        if (partsA[0] !== partsB[0]) return partsB[0] - partsA[0];
        if (partsA[1] !== partsB[1]) return partsB[1] - partsA[1];
        return partsB[2] - partsA[2];
    });
    return validUpdates[0];
}

async function get_list_count() {
    const listsSnapshot = await getDocs(collection(db, "lists"));
    const user = auth.currentUser;
    let n_lists = 0;

    for (const listDoc of listsSnapshot.docs) {
        if (listDoc.data().createdBy === user.uid) { n_lists++; }
    }
    return n_lists;
}

async function check_user_type() {
    const user = auth.currentUser;
    const accountDoc = await getDoc(doc(db, "accounts", user.uid));
    const accountData = accountDoc.data();

    if (accountData.user_type === "admin") {
        document.getElementById("admin-menu").classList.remove("hidden");
    }
}

function build_html(features) {
    let html = "<ul>";
    let subListOpen = false;

    for (const feature of features) {
        if (feature.trim().startsWith("§")) {
            if (!subListOpen) {
                html += "<ul>";
                subListOpen = true;
            }
            const cleanText = feature.trim().slice(1).trim();
            html += `<li>${cleanText}</li>`;
        } else {
            if (subListOpen) {
                html += "</ul>";
                subListOpen = false;
            }
            html += `<li>${feature}</li>`;
        }
    }

    if (subListOpen) {
        html += "</ul>";
    } html += "</ul>";
    return html;
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const con = params.get("con");

    if (con === null) {
        window.location.href = `/app/loading/?from=hp&action=load_app&target=/app/?con=true`;
    }

    const newListButton = document.getElementById("new_list");
    const seeListsButton = document.getElementById("open_lists");

    const toggleBtn = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    toggleBtn.addEventListener("click", () => {
        menu.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });

    newListButton.addEventListener("click", () => {
        window.location.href = "/app/list/create/";
    });
    seeListsButton.addEventListener("click", () => {
        window.location.href = "/app/list/see/";
    });

    try {
        const n_lists = await get_list_count();
        seeListsButton.textContent = "See lists (" + n_lists + ")";
    } catch (err) {
        console.error("Konnte Listenanzahl nicht laden:", err);
    }

    document.getElementById("send_email").addEventListener("click", async () => {
        const emailSelect = document.getElementById("email");

        if (emailSelect.value === "update-mail") {
            const update_information = await get_latest_version(await load_updates());
            const confirmed = confirm(`Do you really want to send an update information email (${update_information.version}) to all users?`);
            if (!confirmed) return;

            const accountsSnapshot = await getDocs(collection(db, "accounts"));
            const activeAccounts = accountsSnapshot.docs.filter((account) => account.data().wantsUpdates !== false);
            const bccList = activeAccounts.map((account) => account.data().email).join(",");

            await emailjs.send("service_oyluoai", "template_31w6lau", {
                update_version: update_information.version,
                bcc_list: bccList,
                features_list: build_html(update_information.features_list)
            });
            alert("Update emails were sent successfully.")
        } else if (emailSelect.value === "welcome") {
            const email = prompt("Please enter your email: ");
            const confirmed = confirm(`Do You really want to send an welcome information to ${email}?`);
            if (!confirmed) return;

            let name = null;

            const accountsSnapshot = await getDocs(collection(db, "accounts"));
            for (const accountDoc of accountsSnapshot.docs) {
                const account = accountDoc.data();

                if (account.email === email) {
                    name = account.username;
                    break;
                }
            }
            if (!name) {
                alert("ERROR");
                return;
            }
            await emailjs.send("service_oyluoai", "template_elanm6q", {
                email: email,
                name: name
            });
            alert(`Email sent to ${email} at ${name}.`)
        }
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

    check_user_type();

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