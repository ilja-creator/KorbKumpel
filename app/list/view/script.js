import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    arrayUnion
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

const params = new URLSearchParams(window.location.search);
const listId = params.get("id");

const listDocRef = doc(db, "lists", listId);

async function render_list_title() {
    const listDocSnap = await getDoc(listDocRef);

    if (listDocSnap.exists()) {
        document.getElementById("name").textContent = listDocSnap.data().listName;
    }
    else {
        window.location.href = "../../errors/404/index.html";
    }
}

async function render_list() {
    const listDocSnap = await getDoc(listDocRef);
    const data = listDocSnap.data();

    const h2 = document.getElementById("list_title");
    h2.textContent = data.name;

    const itemCount = document.getElementById("item_count");
    const listCategory = document.getElementById("list_category");

    const count = data.content.filter((item) => item !== null).length;
    itemCount.textContent = count;
    listCategory.textContent = get_category_label(data.category);

    const container = document.getElementById("item_cont");
    container.querySelectorAll("li:not(.list-meta)").forEach((li) => li.remove());
    sort_list(data.content).forEach((item, index) => {
        if (item === null) return;

        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.classList.toggle("checked", item.checked)
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.addEventListener("change", (e) => {
            update_item(data.content, item.name);
        })

        const label = document.createElement("label");
        const button = document.createElement("button");
        button.textContent = "🗑";
        button.type = "button";
        button.classList.add("delete-btn")
        button.classList.add("hidden");
        button.id = "button-" + index;
        button.addEventListener("click", () => {
            const ask = confirm(`Sind Sie sich sicher, dass Sie ${item.name} irreversibel löschen?`);
            if (ask) {
                delete_item(item.name);
            }
        })
        const span = document.createElement("span");
        span.textContent = item.name;
        span.classList.toggle("checked", item.checked);

        label.appendChild(checkbox);
        label.appendChild(span);
        label.appendChild(button);

        li.appendChild(label);

        container.appendChild(li);
    });
}

async function add_item(name) {
    const listDocSnap = await getDoc(listDocRef);
    const data = listDocSnap.data();

    const newContent = data.content.filter((item) => item !== null);

    newContent.push({name: name, checked: false});

    await updateDoc(listDocRef, {
        content: newContent
    });
    await render_list();
}
async function delete_item(name) {
    const listDocSnap = await getDoc(listDocRef);
    const data = listDocSnap.data();

    const newContent1 = data.content.filter((item) => item !== null);
    let newContent = newContent1.filter((item) => item.name !== name);

    await updateDoc(listDocRef, {
        content: newContent
    });
    await render_list();
}
async function update_item(list, name) {
    const new_content = list.map((element) => {
        if (element.name === name) {
            return {...element, checked: !element.checked};
        }
        return element;
    });

    await updateDoc(listDocRef, {
        content: new_content
    });
    await render_list();
}
function sort_list(list) {
    list.sort((a, b) => a.name.localeCompare(b.name));

    const checked = list.filter((item) => item.checked)
    const unchecked = list.filter((item) => !item.checked);

    return [...unchecked, ...checked];
    console.log([...unchecked, ...checked]);
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


let edit_mode = false;
document.addEventListener("DOMContentLoaded", () => {
    const editButton = document.getElementById("edit_btn");
    const addItemButton = document.getElementById("add_btn");
    const addItemInput = document.getElementById("add_inp");
    const addItemForm = document.getElementById("added_item_form");
    render_list();

    editButton.addEventListener("click", () => {
        edit_mode = !edit_mode;
        editButton.classList.toggle("selected");
        addItemButton.classList.toggle("hidden");
        addItemInput.classList.add("hidden");
        addItemButton.classList.remove("selected");

        document.querySelectorAll(".delete-btn").forEach((item) => {
            item.classList.toggle("hidden");
        })
    });
    addItemButton.addEventListener("click", () => {
        addItemButton.classList.toggle("selected");
        addItemInput.classList.toggle("hidden");
    })

    addItemForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = addItemInput.value.trim();

        if (name !== "") {
            add_item(name);
            addItemInput.value = "";
        }
    })
});
