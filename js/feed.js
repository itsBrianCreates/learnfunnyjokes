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

// Function to fetch a random dad joke from the API
async function getRandomJoke() {
    if (isLoading) return;
    
    setLoadingState(true);
    clearError();
    
    try {
        // Fetch joke from icanhazdadjoke.com API
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Display the joke
        displayJoke(data.joke);
        
    } catch (error) {
        console.error('Error fetching joke:', error);
        showError('Failed to fetch joke. Please check your internet connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

// Function to search for jokes with specific terms
async function searchJokes() {
    const searchTerm = document.getElementById('search-input').value.trim();
    
    if (!searchTerm) {
        showError('Please enter a search term.');
        return;
    }
    
    if (isLoading) return;
    
    setLoadingState(true);
    clearError();
    
    try {
        // Fetch jokes from the search endpoint
        const response = await fetch(`https://icanhazdadjoke.com/search?term=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if any jokes were found
        if (data.results && data.results.length > 0) {
            // Get a random joke from the search results
            const randomJoke = data.results[Math.floor(Math.random() * data.results.length)];
            displayJoke(randomJoke.joke);
        } else {
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

    const card = document.createElement('div');
    card.className = 'joke-container fade-in';
    const lightBackgrounds = [
        '#fffbe6', // light cream
        '#e6f7ff', // soft blue
        '#fff0f6', // pale pink
        '#f0fff4', // mint
        '#f5f5dc', // beige
        '#fdf5e6', // old lace
        '#e8f5e9', // light green
        '#fef9e7'  // soft wheat
    ];
    const randomBg = lightBackgrounds[Math.floor(Math.random() * lightBackgrounds.length)];
    card.style.background = randomBg;

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
    copyButton.className = 'copy-btn';
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => copyJoke(jokeText, copyButton));

    const shareButton = document.createElement('button');
    shareButton.className = 'share-btn';
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

// Add event listeners for keyboard support
document.addEventListener('DOMContentLoaded', function() {
    // Load initial jokes
    loadMoreJokes(5);

    const sentinel = document.getElementById('jokes-sentinel');
    if (sentinel) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    loadMoreJokes(1);
                }
            }, { rootMargin: '0px' });
            observer.observe(sentinel);
        } else {
            // Fallback for older browsers without IntersectionObserver
            const onScroll = () => {
                const rect = sentinel.getBoundingClientRect();
                if (rect.top - window.innerHeight < 0) {
                    loadMoreJokes(1);
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    }

    const searchInput = document.getElementById('search-input');

    // Enter key in search input triggers search
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchJokes();
            }
        });
    }
    
    // Global Enter key listener for getting next joke (when not in search input)
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && document.activeElement !== searchInput) {
            getRandomJoke();
        }
    });
});
