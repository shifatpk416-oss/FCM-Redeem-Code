let allCodes = {};
let previousCodes = null;

/* Firebase থেকে LIVE data */
function listenForCodes() {

    const codesRef = firebase.database().ref("codes");

    codesRef.on("value", (snapshot) => {

        allCodes = snapshot.val() || {};

        displayCodes(allCodes);

        document.getElementById("lastUpdated").innerText =
            "🟢 Live • Updated: " + new Date().toLocaleTimeString();

    }, (error) => {

        console.error(error);

        document.getElementById("codesContainer").innerHTML =
            "<p>❌ Failed to load codes</p>";

        document.getElementById("lastUpdated").innerText =
            "🔴 Database connection failed";
    });
}


/* Codes দেখানো */
function displayCodes(codes) {

    const container =
        document.getElementById("codesContainer");

    const expiredContainer =
        document.getElementById("expiredContainer");

    container.innerHTML = "";
    expiredContainer.innerHTML = "";

    let activeCount = 0;
    let expiredCount = 0;

    Object.values(codes).forEach(item => {

        if (!item || !item.code) return;

        const status =
            String(item.status || "").toUpperCase();

        const card = document.createElement("div");

        card.className = "code-card";

        card.innerHTML = `
            <h3>${escapeHTML(item.code)}</h3>

            <p>
                🎁 Reward:
                ${escapeHTML(item.reward || "Unknown")}
            </p>

            <p>
                ${
                    status === "ACTIVE"
                    ? '<span class="active">🟢 ACTIVE</span>'
                    : '<span class="expired-text">🔴 EXPIRED</span>'
                }
            </p>

            <p>
                🌐 Source:
                ${escapeHTML(item.source || item.Source || "Unknown Source")}
            </p>

            <p>
                🕐 Published:
                ${escapeHTML(item.published || item.Published || item.Launched || "Unknown Date")}
            </p>

            ${
                status === "ACTIVE"
                ? `
                    <div class="buttons">

                        <button
                            onclick="copyCode('${escapeAttribute(item.code)}')">
                            📋 COPY
                        </button>

                        <a
                            href="https://redeem.fcm.ea.com/"
                            target="_blank"
                            class="redeem-button">
                            🔗 REDEEM
                        </a>

                    </div>
                `
                : ""
            }
        `;

        if (status === "ACTIVE") {

            container.appendChild(card);
            activeCount++;

        } else {

            expiredContainer.appendChild(card);
            expiredCount++;

        }
    });


    if (activeCount === 0) {

        container.innerHTML =
            "<p>😔 No active codes available.</p>";
    }

    if (expiredCount === 0) {

        expiredContainer.innerHTML =
            "<p>No expired codes.</p>";
    }
}


/* Copy Code */
function copyCode(code) {

    navigator.clipboard.writeText(code)

        .then(() => {

            alert("✅ Code copied!\n\n" + code);

        })

        .catch(() => {

            alert("❌ Code copy করা যায়নি");

        });
}


/* Search */
function searchCodes() {

    const search =
        document
            .getElementById("searchBox")
            .value
            .toLowerCase()
            .trim();

    const filtered = {};

    Object.keys(allCodes).forEach(key => {

        const item = allCodes[key];

        const text = `
            ${item.code || ""}
            ${item.reward || ""}
            ${item.status || ""}
            ${item.source || ""}
        `.toLowerCase();

        if (text.includes(search)) {

            filtered[key] = item;

        }
    });

    displayCodes(filtered);
}


/* Manual Refresh */
function loadCodes() {

    firebase.database()
        .ref("codes")
        .once("value")
        .then(snapshot => {

           const newCodes = snapshot.val() || {};

if (previousCodes !== null) {

    Object.keys(newCodes).forEach(key => {

        if (!previousCodes[key] && newCodes[key]) {

            showNewCodeNotification(
                newCodes[key].code || "New Code"
            );

        }

    });

}

allCodes = newCodes;
previousCodes = newCodes;

displayCodes(allCodes);

            document.getElementById("lastUpdated").innerText =
                "🔄 Refreshed: " +
                new Date().toLocaleTimeString();

        })
        .catch(error => {

            console.error(error);

            alert("❌ Failed to refresh codes");

        });
}


/* HTML নিরাপদ রাখা */
function escapeHTML(text) {

    return String(text)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* Button attribute নিরাপদ রাখা */
function escapeAttribute(text) {

    return String(text)

        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* 🔥 Start Live Listener */
listenForCodes();
function toggleTheme() {

    const root = document.documentElement;

    const isLight =
        root.getAttribute("data-theme") === "light";

    if (isLight) {

        root.removeAttribute("data-theme");

        document.getElementById("themeButton").innerText =
            "☀️";

        localStorage.setItem("theme", "dark");

    } else {

        root.setAttribute("data-theme", "light");

        document.getElementById("themeButton").innerText =
            "🌙";

        localStorage.setItem("theme", "light");
    }
}


function loadTheme() {

    if (localStorage.getItem("theme") === "light") {

        document.documentElement
            .setAttribute("data-theme", "light");

        const button =
            document.getElementById("themeButton");

        if (button) {
            button.innerText = "🌙";
        }
    }
}


loadTheme();
function showNewCodeNotification(code) {

    const notification =
        document.getElementById("notification");

    const codeText =
        document.getElementById("notificationCode");

    codeText.innerText = code;

    notification.style.display = "flex";

    setTimeout(() => {
        closeNotification();
    }, 6000);
}


function closeNotification() {

    const notification =
        document.getElementById("notification");

    notification.style.display = "none";
}
