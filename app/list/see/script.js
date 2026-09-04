import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    getAuth,
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

let selected = null;
let selectedButton = null;

async function get_content_count(listId) {
    const listDocSnap = await getDoc(doc(db, "lists", listId));
    const data = listDocSnap.data();
    return data.content.filter((item) => item !== null).length;
}
function get_category_label(category) {
    let label;
    switch (category) {
        case "weekly": label = "Wocheneinkauf"; break;
        case "special": label = "Sondereinkauf"; break;
        case "party": label = "Partyeinkauf"; break;
        case "holiday": label = "Urlaubseinkauf"; break;
        case "else": label = "Sonstiges"; break;
        case "": label = "–"; break;
        default: label = "400 – Bad Request"; break;
    }
    return label;
}

async function render_list_buttons() {
    const container = document.getElementById("list_cont");
    const listsSnapshot = await getDocs(collection(db, "lists"));

    for (const docSnap of listsSnapshot.docs) {
        const data = docSnap.data();
        if (auth.currentUser.uid === data.createdBy) {
            const count = await get_content_count(docSnap.id);
            const category = get_category_label(data.category);

            const button_group = document.createElement("div");

            const button = document.createElement("button");
            button.textContent = data.name + "(" + count + ")" + " [" + category + "]";
            button.dataset.id = docSnap.id;

            const dlt_button = document.createElement("button");
            dlt_button.textContent = "🗑";

            dlt_button.addEventListener("click", async () => {
                if (confirm(`Wollen Sie die Liste ${data.name} wirklich irreversibel löschen?`)) {
                    await deleteDoc(doc(db, "lists", docSnap.id));
                    button_group.remove();
                }
            });

            button_group.appendChild(button);
            button_group.appendChild(dlt_button);
            button_group.classList.add("button-row", "button-group");

            button.addEventListener("click", () => {
                if (button.classList.contains("selected")) {
                    button.classList.remove("selected");
                    selected = null;
                    selectedButton = null;
                } else {
                    if (selectedButton !== null) {
                        selectedButton.classList.remove("selected");
                    }
                    button.classList.add("selected");
                    selected = docSnap.id;
                    selectedButton = button;
                }
            });
            container.appendChild(button_group);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const selectListButton = document.getElementById("select_list");

    selectListButton.addEventListener("click", () => {
        if (selected !== null) {
            window.location.href = "/app/list/view?id=" + selected;
        }
    });

    const toggleBtn = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    toggleBtn.addEventListener("click", () => {
        menu.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        render_list_buttons();
    }
});