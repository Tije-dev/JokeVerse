
// Example jokes data (replace with real data from storage/backend)
let jokes = [
    {id:1, setup:'Why did the chicken cross the road?', punchline:'To get to the other side!', category:'general', date:'2026-03-25'},
    {id:2, setup:'Why do programmers prefer dark mode?', punchline:'Because light attracts bugs.', category:'programming', date:'2026-03-24'},
    {id:3, setup:'What do you call fake spaghetti?', punchline:'An impasta.', category:'food', date:'2026-03-23'}
];
function renderJokes() {
    const list = document.getElementById('jokeList');
    const noJokes = document.getElementById('noJokes');
    list.innerHTML = '';
    let filtered = jokes;
    // Filter
    const cat = document.getElementById('filterCategory').value;
    if (cat !== 'all') filtered = filtered.filter(j => j.category === cat);
    // Search
    const search = document.getElementById('searchJoke').value.toLowerCase();
    if (search) filtered = filtered.filter(j => (j.setup + ' ' + j.punchline).toLowerCase().includes(search));
    // Sort
    const sort = document.getElementById('sortJoke').value;
    if (sort === 'category') filtered.sort((a,b) => a.category.localeCompare(b.category));
    else if (sort === 'alpha') filtered.sort((a,b) => (a.setup + a.punchline).localeCompare(b.setup + b.punchline));
    else filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    // Render
    if (filtered.length === 0) {
    noJokes.style.display = '';
    return;
    } else {
    noJokes.style.display = 'none';
    }
    filtered.forEach(joke => {
    const card = document.createElement('div');
    card.className = 'joke-card position-relative';
    card.innerHTML = `
        <button class="delete-btn" title="Delete" onclick="deleteJoke(${joke.id})"><i class="fa-solid fa-trash"></i></button>
        <div class="mb-2"><span class="badge bg-secondary" style="background:var(--accent);color:var(--text-main);">${joke.category}</span></div>
        <div class="fw-bold mb-1">${joke.setup}</div>
        <div class="text-muted mb-2">${joke.punchline}</div>
        <div class="small text-end text-muted"><i class="fa-regular fa-calendar"></i> ${joke.date}</div>
    `;
    list.appendChild(card);
    });
}
function deleteJoke(id) {
    if (confirm('Delete this joke?')) {
    jokes = jokes.filter(j => j.id !== id);
    renderJokes();
    }
}
document.getElementById('filterCategory').addEventListener('change', renderJokes);
document.getElementById('searchJoke').addEventListener('input', renderJokes);
document.getElementById('sortJoke').addEventListener('change', renderJokes);
renderJokes();