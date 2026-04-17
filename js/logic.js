// 1. JS gets user input
// 2. JS sends request to Node API
// 3. Node fetches and processes data
// 4. Node sends response to JS
// 5. JS displays result




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
