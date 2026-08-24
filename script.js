let allCodes = {};
let previousCodes = null;


/* ================================
   EXPIRY CHECK
================================ */

function isCodeExpired(item) {

    if (!item || !item.expiresAt) {

        return String(item?.status || "")
            .toUpperCase() !== "ACTIVE";

    }

    return Date.now() >= Number(item.expiresAt);
}


/* ================================
   FIREBASE LIVE DATA
================================ */

function listenForCodes() {

    firebase.database()
        .ref("codes")
        .on("value", (snapshot) => {

            allCodes = snapshot.val() || {};

            displayCodes(allCodes);

            const lastUpdated =
                document.getElementById("lastUpdated");

            if (lastUpdated) {

                lastUpdated.textContent =
                    "🟢 Live • Updated: " +
                    new Date().toLocaleTimeString();

            }

        }, (error) => {

            console.error(error);

            const container =
                document.getElementById("codesContainer");

            if (container) {

                container.innerHTML =
                    "<p>❌ Failed to load codes</p>";

            }

        });

}


/* ================================
   DISPLAY CODES
================================ */

function displayCodes(codes) {

    const container =
        document.getElementById("codesContainer");

    const expiredContainer =
        document.getElementById("expiredContainer");

    if (!container || !expiredContainer) {
        return;
    }

    container.innerHTML = "";
    expiredContainer.innerHTML = "";

    let activeCount = 0;
    let expiredCount = 0;


    Object.values(codes || {}).forEach(item => {

        if (!item || !item.code) {
            return;
        }


        const status =
            isCodeExpired(item)
                ? "EXPIRED"
                : "ACTIVE";


        const card =
            document.createElement("div");

        card.className = "code-card";


        /* CODE */

        const title =
            document.createElement("h3");

        title.textContent =
            item.code;

        card.appendChild(title);


        /* REWARD */

        const reward =
            document.createElement("p");

        reward.textContent =
            "🎁 Reward: " +
            (item.reward || "Unknown");

        card.appendChild(reward);


        /* STATUS */

        const statusP =
            document.createElement("p");


        if (status === "ACTIVE") {

            const active =
                document.createElement("span");

            active.className =
                "active";

            active.textContent =
                "🟢 ACTIVE";

            statusP.appendChild(active);

        } else {

            const expired =
                document.createElement("span");

            expired.className =
                "expired-text";

            expired.textContent =
                "🔴 EXPIRED";

            statusP.appendChild(expired);

        }


        card.appendChild(statusP);


        /* SOURCE */

        const source =
            document.createElement("p");

        source.textContent =
            "🌐 Source: " +
            (
                item.source ||
                item.Source ||
                "Unknown Source"
            );

        card.appendChild(source);


        /* PUBLISHED */

        const published =
            document.createElement("p");

        published.textContent =
            "🕐 Published: " +
            (
                item.published ||
                item.Published ||
                item.Launched ||
                "Unknown Date"
            );

        card.appendChild(published);


        /* ================================
           ACTIVE BUTTONS
        ================================ */

        if (status === "ACTIVE") {

            const buttons =
                document.createElement("div");

            buttons.className =
                "buttons";


            /* COPY BUTTON */

            const copyButton =
                document.createElement("button");

            copyButton.type =
                "button";

            copyButton.className =
                "copy-code-btn";

            copyButton.textContent =
                "📋 COPY";


            copyButton.onclick =
                function(event) {

                    event.preventDefault();
                    event.stopPropagation();

                    copyCode(
                        item.code,
                        copyButton
                    );

                };


            /* REDEEM BUTTON */

            const redeemButton =
                document.createElement("a");

            redeemButton.href =
                "https://redeem.fcm.ea.com/";

            redeemButton.target =
                "_blank";

            redeemButton.rel =
                "noopener noreferrer";

            redeemButton.className =
                "redeem-button";

            redeemButton.textContent =
                "🔗 REDEEM";


            buttons.appendChild(
                copyButton
            );

            buttons.appendChild(
                redeemButton
            );

            card.appendChild(
                buttons
            );

        }


        /* ================================
           ADD CARD
        ================================ */

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


/* ================================
   COPY CODE
   Android + Chrome
================================ */

function copyCode(code, button) {

    const text =
        String(code || "").trim();


    if (!text) {

        showCopyFailed(
            button,
            "NO CODE"
        );

        return;

    }


    let copied =
        false;


    /* ================================
       METHOD 1
       execCommand
    ================================ */

    try {

        const textarea =
            document.createElement("textarea");


        textarea.value =
            text;


        textarea.setAttribute(
            "readonly",
            ""
        );


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-10000px";

        textarea.style.top =
            "0";

        textarea.style.width =
            "1px";

        textarea.style.height =
            "1px";

        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.focus();
        textarea.select();


        textarea.setSelectionRange(
            0,
            text.length
        );


        copied =
            document.execCommand(
                "copy"
            );


        document.body.removeChild(
            textarea
        );

    }

    catch (error) {

        console.error(
            "Copy error:",
            error
        );

    }


    /* ================================
       METHOD 2
       Clipboard API
    ================================ */

    if (
        !copied &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
        "function"
    ) {

        navigator.clipboard
            .writeText(text)

            .then(() => {

                showCopySuccess(
                    button
                );

            })

            .catch(error => {

                console.error(
                    error
                );

                showCopyFailed(
                    button,
                    "FAILED"
                );

            });

        return;

    }


    if (copied) {

        showCopySuccess(
            button
        );

    } else {

        showCopyFailed(
            button,
            "FAILED"
        );

    }

}


/* ================================
   COPY SUCCESS
================================ */

function showCopySuccess(button) {

    if (!button) {
        return;
    }


    const oldText =
        button.textContent;


    button.textContent =
        "✅ COPIED!";


    button.disabled =
        true;


    setTimeout(() => {

        button.textContent =
            oldText;

        button.disabled =
            false;

    }, 1500);

}


/* ================================
   COPY FAILED
================================ */

function showCopyFailed(
    button,
    text
) {

    if (!button) {

        alert(
            "❌ Copy failed"
        );

        return;

    }


    const oldText =
        button.textContent;


    button.textContent =
        "❌ " + text;


    setTimeout(() => {

        button.textContent =
            oldText;

    }, 1500);

}


/* ================================
   SEARCH
================================ */

function searchCodes() {

    const searchBox =
        document.getElementById(
            "searchBox"
        );

    if (!searchBox) {
        return;
    }


    const search =
        searchBox.value
            .toLowerCase()
            .trim();


    const filtered = {};


    Object.keys(allCodes || {})
        .forEach(key => {

            const item =
                allCodes[key];

            if (!item) {
                return;
            }


            const text = `

                ${item.code || ""}

                ${item.reward || ""}

                ${item.status || ""}

                ${item.source || ""}

                ${item.published || ""}

            `.toLowerCase();


            if (
                text.includes(search)
            ) {

                filtered[key] =
                    item;

            }

        });


    displayCodes(
        filtered
    );

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


            if (
                previousCodes !== null
            ) {

                Object.keys(newCodes)
                    .forEach(key => {

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


            allCodes =
                newCodes;


            previousCodes =
                newCodes;


            displayCodes(
                allCodes
            );


            const lastUpdated =
                document.getElementById(
                    "lastUpdated"
                );


            if (lastUpdated) {

                lastUpdated.textContent =
                    "🔄 Refreshed: " +
                    new Date()
                        .toLocaleTimeString();

            }

        })

        .catch(error => {

            console.error(
                error
            );

            alert(
                "❌ Failed to refresh codes"
            );

        });

}


/* ================================
   START FIREBASE
================================ */

listenForCodes();


/* ================================
   EXPIRY CHECK
   প্রতি ১ সেকেন্ডে
================================ */

setInterval(() => {

    displayCodes(
        allCodes
    );

}, 1000);


/* ================================
   THEME
================================ */

function toggleTheme() {

    const root =
        document.documentElement;


    const isLight =
        root.getAttribute(
            "data-theme"
        ) === "light";


    const button =
        document.getElementById(
            "themeButton"
        );


    if (isLight) {

        root.removeAttribute(
            "data-theme"
        );


        if (button) {

            button.textContent =
                "☀️";

        }


        localStorage.setItem(
            "theme",
            "dark"
        );

    } else {

        root.setAttribute(
            "data-theme",
            "light"
        );


        if (button) {

            button.textContent =
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

            button.textContent =
                "🌙";

        }

    }

}


loadTheme();


/* ================================
   NEW CODE NOTIFICATION
================================ */

function showNewCodeNotification(
    code
) {

    const notification =
        document.getElementById(
            "notification"
        );

    const codeText =
        document.getElementById(
            "notificationCode"
        );


    if (
        !notification ||
        !codeText
    ) {

        return;

    }


    codeText.textContent =
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
