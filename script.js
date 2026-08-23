let allCodes = {};
let previousCodes = null;


/* ================================
   EXPIRY CHECK
================================ */

function isCodeExpired(item) {

    // expiresAt না থাকলে status অনুযায়ী কাজ করবে
    if (!item.expiresAt) {
        return String(item.status || "").toUpperCase() !== "ACTIVE";
    }

    return Date.now() >= Number(item.expiresAt);
}


/* ================================
   FIREBASE থেকে LIVE DATA
================================ */

function listenForCodes() {

    const codesRef = firebase.database().ref("codes");

    codesRef.on("value", (snapshot) => {

        allCodes = snapshot.val() || {};

        displayCodes(allCodes);

        document.getElementById("lastUpdated").innerText =
            "🟢 Live • Updated: " +
            new Date().toLocaleTimeString();

    }, (error) => {

        console.error(error);

        document.getElementById("codesContainer").innerHTML =
            "<p>❌ Failed to load codes</p>";

        document.getElementById("lastUpdated").innerText =
            "🔴 Database connection failed";
    });
}


/* ================================
   CODES দেখানো
================================ */

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


        /* EXPIRY CHECK */

        const expired = isCodeExpired(item);

        const status =
            expired ? "EXPIRED" : "ACTIVE";


        /* CARD */

        const card =
            document.createElement("div");

        card.className = "code-card";


        card.innerHTML = `

            <h3>
                ${escapeHTML(item.code)}
            </h3>


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
                ${escapeHTML(
                    item.source ||
                    item.Source ||
                    "Unknown Source"
                )}

            </p>


            <p>

                🕐 Published:
                ${escapeHTML(
                    item.published ||
                    item.Published ||
                    item.Launched ||
                    "Unknown Date"
                )}

            </p>


            ${
                status === "ACTIVE"

                ? `

                    <div class="buttons">

                        <button
                            class="copy-code-btn"
                            type="button">

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


        /* ================================
           COPY BUTTON EVENT
        ================================ */

        if (status === "ACTIVE") {

            const copyButton =
                card.querySelector(".copy-code-btn");

            if (copyButton) {

                copyButton.addEventListener(
                    "click",
                    () => {

                        copyCode(item.code);

                    }
                );

            }

        }


        /* ================================
           ACTIVE
        ================================ */

        if (status === "ACTIVE") {

            container.appendChild(card);

            activeCount++;

        }


        /* ================================
           EXPIRED
        ================================ */

        else {

            expiredContainer.appendChild(card);

            expiredCount++;

        }

    });


    /* NO ACTIVE CODE */

    if (activeCount === 0) {

        container.innerHTML =
            "<p>😔 No active codes available.</p>";
    }


    /* NO EXPIRED CODE */

    if (expiredCount === 0) {

        expiredContainer.innerHTML =
            "<p>No expired codes.</p>";
    }

}


/* ================================
   COPY CODE
================================ */

function copyCode(code) {

    const text = String(code);


    /* MODERN COPY */

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(text)

            .then(() => {

                alert(
                    "✅ Code copied!\n\n" +
                    text
                );

            })

            .catch(() => {

                fallbackCopy(text);

            });

    }

    /* FALLBACK COPY */

    else {

        fallbackCopy(text);

    }

}


/* ================================
   FALLBACK COPY
================================ */

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");


    textarea.value = text;

    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    try {

        document.execCommand(
            "copy"
        );

        alert(
            "✅ Code copied!\n\n" +
            text
        );

    }

    catch (error) {

        alert(
            "❌ Code copy করা যায়নি"
        );

    }


    document.body.removeChild(
        textarea
    );

}


/* ================================
   SEARCH
================================ */

function searchCodes() {

    const search =
        document
            .getElementById("searchBox")
            .value
            .toLowerCase()
            .trim();


    const filtered = {};


    Object.keys(allCodes).forEach(key => {

        const item =
            allCodes[key];


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


/* ================================
   MANUAL REFRESH
================================ */

function loadCodes() {

    firebase.database()
        .ref("codes")
        .once("value")

        .then(snapshot => {

            const newCodes =
                snapshot.val() || {};


            if (previousCodes !== null) {

                Object.keys(newCodes).forEach(key => {

                    if (
                        !previousCodes[key] &&
                        newCodes[key]
                    ) {

                        showNewCodeNotification(
                            newCodes[key].code ||
                            "New Code"
                        );

                    }

                });

            }


            allCodes = newCodes;

            previousCodes = newCodes;


            displayCodes(allCodes);


            document
                .getElementById("lastUpdated")
                .innerText =
                    "🔄 Refreshed: " +
                    new Date()
                        .toLocaleTimeString();

        })

        .catch(error => {

            console.error(error);

            alert(
                "❌ Failed to refresh codes"
            );

        });

}


/* ================================
   HTML নিরাপদ রাখা
================================ */

function escapeHTML(text) {

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* ================================
   LIVE LISTENER
================================ */

listenForCodes();


/* ================================
   প্রতি ১ সেকেন্ডে EXPIRY CHECK
================================ */

setInterval(() => {

    displayCodes(allCodes);

}, 1000);


/* ================================
   THEME
================================ */

function toggleTheme() {

    const root =
        document.documentElement;


    const isLight =
        root.getAttribute("data-theme") === "light";


    if (isLight) {

        root.removeAttribute(
            "data-theme"
        );


        const button =
            document.getElementById(
                "themeButton"
            );


        if (button) {

            button.innerText =
                "☀️";

        }


        localStorage.setItem(
            "theme",
            "dark"
        );

    }

    else {

        root.setAttribute(
            "data-theme",
            "light"
        );


        const button =
            document.getElementById(
                "themeButton"
            );


        if (button) {

            button.innerText =
                "🌙";

        }


        localStorage.setItem(
            "theme",
            "light"
        );

    }

}


/* ================================
   LOAD THEME
================================ */

function loadTheme() {

    if (
        localStorage.getItem(
            "theme"
        ) === "light"
    ) {

        document.documentElement
            .setAttribute(
                "data-theme",
                "light"
            );


        const button =
            document.getElementById(
                "themeButton"
            );


        if (button) {

            button.innerText =
                "🌙";

        }

    }

}


loadTheme();


/* ================================
   NEW CODE NOTIFICATION
================================ */

function showNewCodeNotification(code) {

    const notification =
        document.getElementById(
            "notification"
        );


    const codeText =
        document.getElementById(
            "notificationCode"
        );


    if (!notification || !codeText) {
        return;
    }


    codeText.innerText =
        code;


    notification.style.display =
        "flex";


    setTimeout(() => {

        closeNotification();

    }, 6000);

}


/* ================================
   CLOSE NOTIFICATION
================================ */

function closeNotification() {

    const notification =
        document.getElementById(
            "notification"
        );


    if (notification) {

        notification.style.display =
            "none";

    }

}