import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    arrayUnion
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
const auth = getAuth();

const params = new URLSearchParams(window.location.search);
const listId = params.get("id");

const listDocRef = doc(db, "lists", listId);
let sort_mode = 1;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Bitte melden Sie sich zuerst an!");
        window.location.href = "/app/account/registration/";
        return;
    }

    const listDocSnap = await getDoc(listDocRef);
    const data = listDocSnap.data();

    if (user.uid !== data.createdBy) {
        alert("Sie haben keine Berechtigung, diese Liste einzusehen!");
        window.location.href = "/app/list/see/";
    }
});

async function render_list() {
    const listDocSnap = await getDoc(listDocRef);
    const data = listDocSnap.data();

    const labelsDocSnap = await getDoc(doc(db, "labels", auth.currentUser.uid));
    const labelData = labelsDocSnap.data().labels;

    const importanceMap = {};
    labelData.forEach(label => {
        importanceMap[label.label] = label.importance;
    })

    const h2 = document.getElementById("list_title");
    h2.textContent = data.name;

    const itemCount = document.getElementById("item_count");
    const listCategory = document.getElementById("list_category");

    const count = data.content.filter((item) => item !== null).length;
    itemCount.textContent = count;
    listCategory.textContent = get_category_label(data.category);

    const container = document.getElementById("item_cont");
    container.querySelectorAll("li:not(.list-meta)").forEach((li) => li.remove());
    sort_list(data.content.filter((item) => item !== null), sort_mode, importanceMap).forEach((item, index) => {
        if (item === null) return;

        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.classList.toggle("checked", item.checked)
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.addEventListener("change", (e) => {
            update_item(data.content, item.name);
        });
        const checkboxWrap = document.createElement("span");
        checkboxWrap.classList.add("checkbox-wrap");
        checkboxWrap.appendChild(checkbox);

        const label = document.createElement("label");
        const button = document.createElement("button");
        button.textContent = "🗑";
        button.type = "button";
        button.classList.add("delete-btn")
        button.classList.toggle("hidden", !edit_mode);
        button.id = "button-" + index;
        button.addEventListener("click", () => {
            const ask = confirm(`Sind Sie sich sicher, dass Sie ${item.name} irreversibel löschen?`);
            if (ask) {
                delete_item(item.name);
            }
        });
        const span = document.createElement("span");
        span.textContent = item.name + " [" + item.label + "] ";
        span.classList.toggle("checked", item.checked);

        label.appendChild(checkboxWrap);
        label.appendChild(span);
        label.appendChild(button);

        li.appendChild(label);

        container.appendChild(li);
    });
}
async function render_labels_list() {
    const user_uid = auth.currentUser.uid;
    const labelsDocSnap = await getDoc(doc(db, "labels", user_uid));
    const dropdown = document.getElementById("dropdown");

    const data = labelsDocSnap.data();
    const user_labels = data.labels;
    user_labels.sort((a, b) => a.importance - b.importance);

    dropdown.innerHTML = "";

    for (const label of user_labels) {
        const span = document.createElement("span");
        span.textContent = label.label;

        const div = document.createElement("div");
        const div_item = document.createElement("div");
        div_item.classList.add("item");

        const buttonUp = document.createElement("button");
        buttonUp.textContent = "⬆️";
        buttonUp.type = "button";
        buttonUp.addEventListener("click", () => moveUp(buttonUp));

        const buttonDown = document.createElement("button");
        buttonDown.textContent = "⬇️";
        buttonDown.type = "button";
        buttonDown.addEventListener("click", () => moveDown(buttonDown));
        div_item.appendChild(span);

        const controls = document.createElement("div");
        controls.classList.add("controls");

        controls.appendChild(buttonUp);
        controls.appendChild(buttonDown);

        div_item.appendChild(controls);

        dropdown.appendChild(div_item);
    }
}

async function add_item(name, label) {
    const listDocSnap = await getDoc(listDocRef);
    const data = listDocSnap.data();
    const labelDocSnap = await getDoc(doc(db, "labels", auth.currentUser.uid));
    const label_data = labelDocSnap.data();
    const label_user_data = label_data.labels;

    const user_uid = auth.currentUser.uid;

    const newContent = data.content.filter((item) => item !== null);
    const newContent_labels = label_user_data.filter((label) => label !== null);

    for (const article of data.content) {
        if (article !== null && article.name === name) {
            alert("Dieser Artikel existiert bereits. Der neue Eintrag wird gelöscht.");
            return;
        }
    }

    if (label.trim() === "" || label === "undefined") { label = null; }
    if (!newContent_labels.some((l) => l.label === label)) {
        newContent_labels.push({label: label, importance: newContent_labels.length});
        await updateDoc(doc(db, "labels", user_uid), {
            labels: newContent_labels
        });
    }

    newContent.push({name: name, label: label, checked: false});

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
function sort_list(list, mode, importanceMap = {}) {
    /**
     * modes:   1: only checked at the end
     *          2: alphabetical and checked at the end
     *          3: sorted by labels, alphabetical and checked at the end
     */
    const checked = list.filter((item) => item.checked)
    const unchecked = list.filter((item) => !item.checked);

    if (mode === 2 || mode === 3) {
        unchecked.sort((a, b) => a.name.localeCompare(b.name));
        checked.sort((a, b) => a.name.localeCompare(b.name));

        if (mode === 3) {
            unchecked.sort((a, b) => {
                return (importanceMap[a.label] ?? 999) -
                    (importanceMap[b.label] ?? 999);
            });
        } return [...unchecked, ...checked];
    } return list;
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
    const editMenu = document.getElementById("edit_menu");
    const addItemButton = document.getElementById("add_btn");
    const sort = document.getElementById("sort_select");
    const addItemInput = document.getElementById("add_inp");
    const labelInput = document.getElementById("label_inp");
    const addItemForm = document.getElementById("added_item_form");
    const labelMenu = document.getElementById("label-menu");
    render_list();

    editButton.addEventListener("click", () => {
        edit_mode = !edit_mode;
        editButton.classList.toggle("selected");
        editMenu.classList.toggle("visible");
        addItemButton.classList.toggle("hidden");
        sort.classList.toggle("hidden");
        document.querySelector(".new_article").classList.add("hidden");
        addItemButton.classList.remove("selected");
        document.querySelectorAll(".delete-btn").forEach((item) => {
            item.classList.toggle("hidden", !edit_mode);
        });
    });
    addItemButton.addEventListener("click", () => {
        addItemButton.classList.toggle("selected");
        document.querySelector(".new_article").classList.toggle("hidden");
    });
    sort.addEventListener("change", () => {
        const labelMenu = document.getElementById("select-like");
        const selected = Number(sort.value);
        sort_mode = selected;
        render_list();
        if (sort_mode === 3) {
            labelMenu.classList.remove("hidden");
            render_labels_list();
        } else {
            labelMenu.classList.toggle("hidden", true);
        }
        if (![0, 1].includes(selected)) {
            sort.classList.toggle("selected", true);
        } else { sort.classList.toggle("selected", false); }
    });

    addItemForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = addItemInput.value.trim();
        const label = labelInput.value.trim();

        if (name !== "") {
            add_item(name, label);
            addItemInput.value = "";
            labelInput.value = "";
        }
    });

    const toggleMenuButton = document.getElementById("toggle-menu-button");
    const dropdown = document.getElementById("dropdown");

    toggleMenuButton.addEventListener("click", () => {
        dropdown.classList.toggle("open");
    });

    window.moveUp = function moveUp(btn) {
        const item = btn.closest(".item");
        const prev = item.previousElementSibling;

        if (prev) {
            item.parentNode.insertBefore(item, prev);
            updateLabelsSequence();
        }
    }
    window.moveDown = function moveDown(btn) {
        const item = btn.closest(".item");
        const next = item.nextElementSibling;

        if (next) {
            item.parentNode.insertBefore(item, next.nextElementSibling);
            updateLabelsSequence();
        }
    }

    async function updateLabelsSequence() {
        const dropdown = document.getElementById("dropdown");
        const items = [...dropdown.children];
        const newOrder = items.map((item, index) => ({
            label: item.querySelector("span").textContent,
            importance: index
        }));

        const user_uid = auth.currentUser.uid;
        await updateDoc(doc(db, "labels", user_uid), {
            labels: newOrder
        });
        render_labels_list();
        render_list();
    }

    const toggleBtn = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    toggleBtn.addEventListener("click", () => {
        menu.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });
});

const h1 = document.querySelector("h1");
const editMenu = document.querySelector(".edit-menu");
const h1Width = h1.getBoundingClientRect().width;
editMenu.style.minWidth = h1Width + "px";