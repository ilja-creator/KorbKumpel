import { with_user_request_declined, with_user_request_accepted } from "/assets/emails/email-templates.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteField
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

document.addEventListener("DOMContentLoaded", async () => {

});

onAuthStateChanged(auth, async (user) => {
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
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const new_user = params.get("username");

            const accountSnapshot = await getDoc(doc(db, "accounts", user.uid));
            const data = accountSnapshot.data();

            if (data.request === code) {
                const question = document.getElementById("ques");

                question.textContent = `User (${new_user}) möchte ein With-Konto mit Ihnen erstellen.`;

                const accept_btn = document.getElementById("accept");
                const decline_btn = document.getElementById("decline");

                for (const btn of [accept_btn, decline_btn]) {
                    btn.classList.remove("hidden");
                }

                accept_btn.addEventListener("click", async () => {
                    if (!confirm("Sind Sie sich sicher, dass Sie die With-User-Anfrage akzeptieren wollen?")) { return; }

                    const accountsSnapshot = await getDocs(collection(db, "accounts"));
                    const accountsDocs = accountsSnapshot.docs;

                    for (const account of accountsDocs) {
                        const data = account.data();
                        if (data.username === new_user && data.with === false) {
                            await updateDoc(doc(db, "accounts", user.uid), {
                                request: deleteField(),
                                with: account.id
                            });
                            await updateDoc(doc(db, "accounts", account.id), {
                                with: user.uid
                            });
                            await emailjs.send("service_oyluoai", "template_elanm6q", {
                                subject: "With-User Anfrage akzeptiert",
                                plus_name: "Hosting",
                                content: with_user_request_accepted,
                                email: data.email,
                                name: new_user
                            });
                        }
                    } window.location.href = "/app/";
                });
                decline_btn.addEventListener("click", async () => {
                    if (confirm("Sind Sie sich sicher, dass Sie die Anfrage ablehnen wollen?")) {
                        const accountsSnapshot = await getDocs(collection(db, "accounts"));
                        const accountsDocs = accountsSnapshot.docs;

                        for (const account of accountsDocs) {
                            const data = account.data();
                            if (data.username === new_user && data.with === false) {
                                await updateDoc(doc(db, "accounts", user.uid), {
                                    request: deleteField()
                                });
                                await emailjs.send("service_oyluoai", "template_elanm6q", {
                                    subject: "With-User-Anfrage abgelehnt",
                                    plus_name: "Hosting",
                                    content: with_user_request_declined,
                                    email: data.email,
                                    name: new_user
                                });
                            }
                        }
                    } window.location.href = "/app/";
                });
            } else {
                window.location.href = "/app/";
            }

            return;
        }
    }
    alert("Sie haben schon ein Konto! Bitte verifizieren Sie jedoch zuerst die E-Mail!");
});