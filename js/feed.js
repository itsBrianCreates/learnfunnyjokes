const dadJokes = [
    {setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!"},
    {setup: "I told my wife she was drawing her eyebrows too high.", punchline: "She looked surprised."},
    {setup: "What do you call a fake noodle?", punchline: "An impasta!"},
    {setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!"},
    {setup: "I'm reading a book about anti-gravity.", punchline: "It's impossible to put down!"},
    {setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!"},
    {setup: "What do you call a sleeping bull?", punchline: "A bulldozer!"},
    {setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!"},
    {setup: "What's the best thing about Switzerland?", punchline: "I don't know, but the flag is a big plus!"},
    {setup: "Why did the math book look so sad?", punchline: "Because it had too many problems!"},
    {setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!"},
    {setup: "Why can't your nose be 12 inches long?", punchline: "Because then it would be a foot!"},
    {setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved!"},
    {setup: "Why don't programmers like nature?", punchline: "It has too many bugs!"},
    {setup: "What do you call a dinosaur that crashes his car?", punchline: "Tyrannosaurus Wrecks!"},
    {setup: "Why did the cookie go to the doctor?", punchline: "Because it felt crumbly!"},
    {setup: "What's orange and sounds like a parrot?", punchline: "A carrot!"},
    {setup: "Why don't scientists trust stairs?", punchline: "Because they're always up to something!"},
    {setup: "What do you call a fish wearing a crown?", punchline: "A king fish!"},
    {setup: "Why did the bicycle fall over?", punchline: "It was two-tired!"}
];

let currentJokeIndex = 0;
let isLoading = false;
let isSearchPage = false;
let currentSearchTerm = '';
let searchPageNum = 1;
let sentinel; // element used for detecting when to load more jokes
let currentJokeType = 'all'; // all | dad | knock | pickup
// Track knock-knock jokes we've already shown to avoid repeats
const seenKnockKnockJokes = new Set();
const seenPickupLines = new Set();

const pickupLines = [
    "Do you have a name, or can I call you mine?",
    "Are you a magician? Whenever I look at you, everyone else disappears.",
    "Is your name Wi-Fi? Because I'm feeling a connection.",
    "Do you believe in love at first sight, or should I walk by again?",
    "Are you French? Because Eiffel for you.",
    "If you were a vegetable, you'd be a cute-cumber!",
    "Your hand looks heavy—can I hold it for you?",
    "Are you a bank loan? Because you have my interest.",
    "Are you made of copper and tellurium? Because you're Cu-Te.",
    "If you were a Transformer, you'd be Optimus Fine.",
];

let cachedPickupCatalog = null;

// Helper to generate a random pastel background color
function getRandomPastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 95%)`;
}

// Fetch a random knock-knock joke from the API
// Avoid repeating jokes that have already been shown
async function fetchKnockKnockJoke() {
    let attempts = 0;
    const maxAttempts = 5;
    let jokeText = '';

    while (attempts < maxAttempts) {
        const response = await fetch('https://official-joke-api.appspot.com/jokes/knock-knock/random');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const jokeObj = Array.isArray(data) ? data[0] : data;
        jokeText = `${jokeObj.setup} ${jokeObj.punchline}`;

        if (!seenKnockKnockJokes.has(jokeText)) {
            seenKnockKnockJokes.add(jokeText);
            break;
        }

        attempts++;
    }

    return jokeText;
}

// Fetch a random dad joke from the API
async function fetchDadJoke() {
    const response = await fetch('https://icanhazdadjoke.com/', {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.joke;
}

// Pull a curated pickup line list from the bundled JSON file for richer local content
async function loadPickupCatalog() {
    if (cachedPickupCatalog) return cachedPickupCatalog;

    try {
        const response = await fetch('data/pickup-lines.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length) {
            cachedPickupCatalog = data;
        }
    } catch (error) {
        console.warn('Local pickup line catalog not available:', error);
        cachedPickupCatalog = [];
    }

    return cachedPickupCatalog;
}

// Choose a pickup line from any locally available source
function getLocalPickupLine() {
    const combinedLines = [...pickupLines, ...(cachedPickupCatalog || [])];
    if (combinedLines.length === 0) return 'No pickup lines available right now, but you look amazing!';

    const freshLines = combinedLines.filter(line => !seenPickupLines.has(line));
    const pool = freshLines.length > 0 ? freshLines : combinedLines;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    seenPickupLines.add(choice);
    return choice;
}

// Fetch pickup lines from the public RizzAPI
async function fetchPickupLineFromRizz() {
    const response = await fetch('https://rizzapi.vercel.app/random');

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const line = (data?.rizz || data?.pickup || data?.line || '').trim();
    return line || null;
}

// Use the bundled catalog file as a pseudo-API source
async function fetchPickupLineFromCatalog() {
    const catalog = await loadPickupCatalog();
    if (!catalog.length) return null;

    const available = catalog.filter(line => !seenPickupLines.has(line));
    const pool = available.length ? available : catalog;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    seenPickupLines.add(choice);
    return choice;
}

// Fetch a cheesy pickup line from multiple sources with graceful fallback
async function fetchPickupLine() {
    const sources = [fetchPickupLineFromRizz, fetchPickupLineFromCatalog];

    for (const source of sources) {
        try {
            const line = await source();
            if (line && (!seenPickupLines.has(line) || seenPickupLines.size > 20)) {
                seenPickupLines.add(line);
                return line;
            }
        } catch (error) {
            console.warn('Pickup line source unavailable, trying next option:', error);
        }
    }

    await loadPickupCatalog();
    return getLocalPickupLine();
}

// Function to fetch a random dad joke or knock-knock joke
async function getRandomJoke() {
    if (isLoading) return;

    setLoadingState(true);
    clearError();

    try {
        let jokeText;
        if (currentJokeType === 'dad') {
            jokeText = await fetchDadJoke();
        } else if (currentJokeType === 'knock') {
            jokeText = await fetchKnockKnockJoke();
        } else if (currentJokeType === 'pickup') {
            jokeText = await fetchPickupLine();
        } else {
            const jokeTypes = ['dad', 'knock', 'pickup'];
            const randomType = jokeTypes[Math.floor(Math.random() * jokeTypes.length)];

            if (randomType === 'dad') {
                jokeText = await fetchDadJoke();
            } else if (randomType === 'knock') {
                jokeText = await fetchKnockKnockJoke();
            } else {
                jokeText = await fetchPickupLine();
            }
        }

        displayJoke(jokeText);

    } catch (error) {
        console.error('Error fetching joke:', error);
        showError('Failed to fetch joke. Please check your internet connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

// Function to search for jokes with specific terms
async function searchJokes(newSearch = true) {
    const inputEl = document.getElementById('search-input');
    if (!inputEl) return;

    if (newSearch) {
        currentSearchTerm = inputEl.value.trim();
        searchPageNum = 1;
        const feed = document.getElementById('jokes-feed');
        if (feed) {
            feed.innerHTML = '';
            if (sentinel) feed.appendChild(sentinel);
        }
    }

    const searchTerm = currentSearchTerm;

    if (!searchTerm) {
        showError('Please enter a search term.');
        return;
    }

    if (isLoading) return;

    setLoadingState(true);
    clearError();

    try {
        const response = await fetch(`https://icanhazdadjoke.com/search?term=${encodeURIComponent(searchTerm)}&page=${searchPageNum}&limit=5`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            data.results.forEach(result => displayJoke(result.joke));
            searchPageNum++;
        } else if (newSearch) {
            showError(`No jokes found for "${searchTerm}". Try a different search term.`);
        }

    } catch (error) {
        console.error('Error searching jokes:', error);
        showError('Failed to search for jokes. Please check your internet connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

// Function to get a local joke (from the predefined array)
function getLocalJoke() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * dadJokes.length);
    } while (newIndex === currentJokeIndex && dadJokes.length > 1);
    
    currentJokeIndex = newIndex;
    const joke = dadJokes[currentJokeIndex];
    displayJoke(joke.setup + ' ' + joke.punchline);
}

// Function to display a joke with smooth animation
function displayJoke(jokeText) {
    const feed = document.getElementById('jokes-feed');
    if (!feed) return;

    // Remove any empty state message once a joke is displayed
    removeEmptyState();

    const card = document.createElement('div');
    card.className = 'joke-container fade-in';
    card.style.background = getRandomPastelColor();

    // Split into setup and punchline
    const questionMarkers = ['?', '!'];
    let setup = jokeText;
    let punchline = '';
    for (let marker of questionMarkers) {
        const markerIndex = jokeText.indexOf(marker);
        if (markerIndex !== -1 && markerIndex < jokeText.length - 1) {
            setup = jokeText.substring(0, markerIndex + 1).trim();
            punchline = jokeText.substring(markerIndex + 1).trim();
            break;
        }
    }

    const textDiv = document.createElement('div');
    textDiv.className = 'joke-text';
    if (!punchline) {
        textDiv.innerHTML = jokeText;
    } else {
        textDiv.innerHTML = setup + '<br><span class="punchline">' + punchline + '</span>';
    }

    const footer = document.createElement('div');
    footer.className = 'joke-footer';
    const actions = document.createElement('div');
    actions.className = 'joke-actions';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn btn-primary';
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => copyJoke(jokeText, copyButton));

    const shareButton = document.createElement('button');
    shareButton.className = 'share-btn btn-primary';
    shareButton.textContent = 'Share';
    shareButton.addEventListener('click', () => shareJoke(jokeText));

    actions.appendChild(copyButton);
    actions.appendChild(shareButton);
    footer.appendChild(actions);

    card.appendChild(textDiv);
    card.appendChild(footer);

    feed.appendChild(card);
}

// Function to set loading state
function setLoadingState(loading) {
    isLoading = loading;
}

// Function to show error messages
function showError(message) {
    clearError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.id = 'error-message';
    
    const container = document.querySelector('.container');
    const jokeContainer = document.querySelector('.joke-container');
    container.insertBefore(errorDiv, jokeContainer.nextSibling);
}

// Function to clear error messages
function clearError() {
    const existingError = document.getElementById('error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Remove the search empty state message if it exists
function removeEmptyState() {
    const empty = document.getElementById('empty-state');
    if (empty) {
        empty.remove();
    }
}

// Show a playful message prompting the user to search for jokes
function showSearchEmptyState() {
    const feed = document.getElementById('jokes-feed');
    if (!feed) return;

    const empty = document.createElement('div');
    empty.id = 'empty-state';
    empty.className = 'empty-state';
    empty.textContent = 'Search for a topic and we\u2019ll deliver the jokes—hot and fresh, like comedy toast.';
    feed.appendChild(empty);
}

// Function to copy the current joke to clipboard
async function copyJoke(text, btn) {
    try {
        // Copy to clipboard using the modern Clipboard API
        await navigator.clipboard.writeText(text);

        if (btn) {
            const original = btn.textContent;
            btn.textContent = 'Copied';
            setTimeout(() => {
                btn.textContent = original;
            }, 2000);
        }

    } catch (error) {
        console.error('Failed to copy joke:', error);

        // Fallback for older browsers or if clipboard access fails
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            if (btn) {
                const original = btn.textContent;
                btn.textContent = 'Copied';
                setTimeout(() => {
                    btn.textContent = original;
                }, 2000);
            }
        } catch (fallbackError) {
            console.error('Fallback copy also failed:', fallbackError);
            showError('Failed to copy joke. Your browser may not support this feature.');
        }
    }
}

// Function to share the current joke using the Web Share API
async function shareJoke(text) {
    try {
        const shareText = `${text}\n\nFind more jokes at https://itsbriancreates.github.io/learnfunnyjokes/`;

        if (navigator.share) {
            await navigator.share({ text: shareText });
            showConfirmation('Shared!');
        } else {
            await navigator.clipboard.writeText(shareText);
            showConfirmation('Copied!');
        }
    } catch (error) {
        console.error('Failed to share joke:', error);
        showError('Share not supported on this browser.');
    }
}

// Function to show confirmation message
function showConfirmation(message = 'Copied!') {
    const confirmationElement = document.createElement('div');
    confirmationElement.className = 'confirmation-message show';
    confirmationElement.textContent = message;
    document.body.appendChild(confirmationElement);

    // Hide it after 2 seconds
    setTimeout(() => {
        confirmationElement.classList.remove('show');
        confirmationElement.remove();
    }, 2000);
}


// Helper to load multiple jokes
async function loadMoreJokes(count = 1) {
    for (let i = 0; i < count; i++) {
        await getRandomJoke();
    }
}

// Switch the current joke type and refresh the feed
function switchJokeType(type) {
    currentJokeType = type;
    const feed = document.getElementById('jokes-feed');
    if (feed) {
        feed.innerHTML = '';
        if (sentinel) feed.appendChild(sentinel);
    }
    loadMoreJokes(5);
}

// Add event listeners for keyboard support
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    sentinel = document.getElementById('jokes-sentinel');
    const pills = document.querySelectorAll('.joke-pill');

    pills.forEach(btn => {
        btn.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            switchJokeType(btn.dataset.type);
        });
    });

    if (searchInput) {
        isSearchPage = true;
        showSearchEmptyState();

        if (sentinel) {
            const feed = document.getElementById('jokes-feed');
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting && currentSearchTerm) {
                        searchJokes(false);
                    }
                }, { root: feed });
                observer.observe(sentinel);
            } else {
                const onScroll = () => {
                    if (feed.scrollHeight - feed.scrollTop - feed.clientHeight < 50 && currentSearchTerm) {
                        searchJokes(false);
                    }
                };
                feed.addEventListener('scroll', onScroll, { passive: true });
            }
        }

        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                searchJokes(true);
            }
        });

    } else if (sentinel) {
        // Index page: load jokes immediately and set up infinite scroll
        loadMoreJokes(5);

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    loadMoreJokes(1);
                }
            }, { rootMargin: '0px' });
            observer.observe(sentinel);
        } else {
            const onScroll = () => {
                const rect = sentinel.getBoundingClientRect();
                if (rect.top - window.innerHeight < 0) {
                    loadMoreJokes(1);
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && document.activeElement !== searchInput && !isSearchPage) {
            getRandomJoke();
        }
    });
});
