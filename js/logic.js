// 1. JS gets user input
// 2. JS sends request to Node API
// 3. Node fetches and processes data
// 4. Node sends response to JS
// 5. JS displays result

// export default function test() {
//     alert('test hi');
//     console.log('test hi');
    
// }




let currentJoke = "";
// JS gets user topic
function getJoke() {
    //loading animation
    document.getElementById("loading").classList.remove("d-none");


    let category = document.getElementById("category").value;
    let url = "/api/jokes/random";

    if (category !== "random") {
        url += "?topic=" + encodeURIComponent(category);
    }

    // Send request to Node backend
    fetch(url)
        .then(response => response.json()) // convert to JSON
        .then(data => {
            // Update UI with result
            // loading animation
            document.getElementById("loading").classList.add("d-none");
            if (Array.isArray(data) && data.length > 0) {
                document.getElementById("setup").innerText = data[0].setup;
                document.getElementById("punchline").innerText = data[0].punchline;
                currentJoke = data[0].setup + " " + data[0].punchline;
            } else {
                document.getElementById("setup").innerText = "No jokes found for this topic. Try another one!";
                document.getElementById("punchline").innerText = "";
                currentJoke = "";
            }
        })
        .catch(error => {
            // console.error("Error:", error);
        });
}

// Translate Joke
function translateJoke() {
    let lang = document.getElementById("language").value;

    // Get the current setup and punchline from the UI
    const setup = document.getElementById("setup").innerText;
    const punchline = document.getElementById("punchline").innerText;

    // Prevent translation if both are empty
    if (!setup && !punchline) {
        alert("No joke to translate! Please get a joke first.");
        return;
    }

    // Translate setup if not empty
    if (setup) {
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(setup)}&langpair=en|${lang}`)
            .then(res => res.json())
            .then(setupData => {
                document.getElementById("setup").innerText = setupData.responseData.translatedText;
            });
    }
    // Translate punchline if not empty
    if (punchline) {
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(punchline)}&langpair=en|${lang}`)
            .then(res => res.json())
            .then(punchlineData => {
                document.getElementById("punchline").innerText = punchlineData.responseData.translatedText;
            });
    }
}

// Copy Joke
function copyJoke() {
    navigator.clipboard.writeText(currentJoke);
    // alert("Copied!");
    //small tooltip instead of alert
    const tooltip = document.getElementById("copyTooltip");
    tooltip.classList.remove("d-none"); //aftter copying, show tooltip
    setTimeout(() => {
        tooltip.classList.add("d-none"); //after 2 seconds, hide tooltip
    }, 2000);
}


// Speak Joke
function speakJoke() {
    let speech = new SpeechSynthesisUtterance(currentJoke);
    speech.lang = "en-US";
    speechSynthesis.speak(speech);
}

function showSaveFeedbackModal(options) {
    const modalEl = document.getElementById("saveFeedbackModal");
    const titleEl = document.getElementById("saveFeedbackModalTitle");
    const bodyEl = document.getElementById("saveFeedbackModalBody");
    const savedBtn = document.getElementById("saveFeedbackModalSavedBtn");
    if (!modalEl || !titleEl || !bodyEl || !savedBtn) {
        return;
    }

    titleEl.textContent = options.title || "";
    bodyEl.textContent = options.bodyText || "";

    if (options.showSavedLink) {
        savedBtn.classList.remove("d-none");
    } else {
        savedBtn.classList.add("d-none");
    }

    if (typeof bootstrap === "undefined" || !bootstrap.Modal) {
        window.alert(options.bodyText || options.title || "");
        return;
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function saveJoke() {
    const setup = document.getElementById("setup").innerText.trim();
    const punchline = document.getElementById("punchline").innerText.trim();
    const category = document.getElementById("category").value;

    if (!setup || setup.startsWith("No jokes found")) {
        showSaveFeedbackModal({
            title: "Nothing to save",
            bodyText: "Get a joke first, then tap Save.",
            showSavedLink: false,
        });
        return;
    }

    fetch("/api/save-joke", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, setup, punchline }),
    })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
            if (!ok || !data.success) {
                showSaveFeedbackModal({
                    title: "Save failed",
                    bodyText: data.message || "We could not save your joke. Try again.",
                    showSavedLink: false,
                });
                return;
            }
            showSaveFeedbackModal({
                title: "Joke saved",
                bodyText:
                    "Your joke was saved. Open the Saved page to view it, filter, or delete it anytime. You can use the Saved link above or the button below.",
                showSavedLink: true,
            });
        })
        .catch(() => {
            showSaveFeedbackModal({
                title: "Save failed",
                bodyText: "Network error. Check your connection and try again.",
                showSavedLink: false,
            });
        });
}
