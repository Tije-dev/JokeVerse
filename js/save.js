let jokes = [];

function formatJokeDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString();
}

async function loadJokes() {
  const list = document.getElementById("jokeList");
  const noJokes = document.getElementById("noJokes");
  try {
    const response = await fetch("/api/save-joke", { credentials: "include" });
    const data = await response.json();
    if (!response.ok || !data.success) {
      jokes = [];
      if (response.status === 401) {
        window.location.href = "/pages/login.html";
        return;
      }
    } else {
      jokes = (data.jokes || []).map((j) => ({
        id: j.saveId,
        setup: j.setup,
        punchline: j.punchline || "",
        category: j.category || "",
        date: j.date,
      }));
    }
  } catch {
    jokes = [];
  }
  renderJokes();
}

function renderJokes() {
  const list = document.getElementById("jokeList");
  const noJokes = document.getElementById("noJokes");
  if (!list || !noJokes) {
    return;
  }
  list.innerHTML = "";
  let filtered = jokes;
  const cat = document.getElementById("filterCategory").value;
  if (cat !== "all") {
    filtered = filtered.filter((j) => (j.category || "") === cat);
  }
  const search = document.getElementById("searchJoke").value.toLowerCase();
  if (search) {
    filtered = filtered.filter((j) =>
      `${j.setup} ${j.punchline}`.toLowerCase().includes(search)
    );
  }
  const sort = document.getElementById("sortJoke").value;
  if (sort === "category") {
    filtered.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
  } else if (sort === "alpha") {
    filtered.sort((a, b) =>
      `${a.setup}${a.punchline}`.localeCompare(`${b.setup}${b.punchline}`)
    );
  } else {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  if (filtered.length === 0) {
    noJokes.style.display = "";
    return;
  }
  noJokes.style.display = "none";
  filtered.forEach((joke) => {
    const card = document.createElement("div");
    card.className = "joke-card position-relative";

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.title = "Delete";
    del.setAttribute("aria-label", "Delete joke");
    del.innerHTML = '<i class="fa-solid fa-trash"></i>';
    del.addEventListener("click", () => deleteJoke(joke.id));

    const badgeWrap = document.createElement("div");
    badgeWrap.className = "mb-2";
    const badge = document.createElement("span");
    badge.className = "badge bg-secondary";
    badge.style.background = "var(--accent)";
    badge.style.color = "var(--text-main)";
    badge.textContent = joke.category || "—";

    const setupEl = document.createElement("div");
    setupEl.className = "fw-bold mb-1";
    setupEl.textContent = joke.setup;

    const punchEl = document.createElement("div");
    punchEl.className = "text-muted mb-2";
    punchEl.textContent = joke.punchline;

    const dateRow = document.createElement("div");
    dateRow.className = "small text-end text-muted";
    const cal = document.createElement("i");
    cal.className = "fa-regular fa-calendar";
    cal.setAttribute("aria-hidden", "true");
    dateRow.appendChild(cal);
    dateRow.appendChild(document.createTextNode(` ${formatJokeDate(joke.date)}`));

    card.appendChild(del);
    card.appendChild(badgeWrap);
    badgeWrap.appendChild(badge);
    card.appendChild(setupEl);
    card.appendChild(punchEl);
    card.appendChild(dateRow);
    list.appendChild(card);
  });
}

async function deleteJoke(id) {
  if (!confirm("Delete this joke?")) {
    return;
  }
  try {
    const response = await fetch(`/api/save-joke/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      alert(data.message || "Delete failed.");
      return;
    }
    jokes = jokes.filter((j) => j.id !== id);
    renderJokes();
  } catch {
    alert("Delete failed.");
  }
}

document.getElementById("filterCategory").addEventListener("change", renderJokes);
document.getElementById("searchJoke").addEventListener("input", renderJokes);
document.getElementById("sortJoke").addEventListener("change", renderJokes);

loadJokes();
