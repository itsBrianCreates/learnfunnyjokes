/**
 * Main application file for Dad Jokes App
 * Coordinates all modules and handles UI interactions
 */

// Application state
let currentJoke = '';
let currentView = 'main';
let isLoading = false;

/**
 * Initialize the application
 */
function initializeApp() {
    // Set up event listeners
    setupEventListeners();

    // Load a random joke on startup so the first joke isn't always the same
    getRandomJoke();
}

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    
    // Enter key in search input triggers search
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchJokes();
            }
        });
    }
    
    // No arrow key navigation
}

/**
 * Display a joke with smooth animation
 * @param {string} jokeText - The joke text to display
 * @param {boolean} addToHistory - Whether to add to history
 */
function displayJoke(jokeText, addToHistory = true) {
    const jokeElement = document.getElementById('joke-text');
    if (!jokeElement) return;
    
    currentJoke = jokeText;
    
    // Add fade-out effect
    jokeElement.classList.add('fade-out');
    
    setTimeout(() => {
        // No history tracking
        
        // Split joke into setup and punchline
        const { setup, punchline } = splitJoke(jokeText);
        
        // Display the joke
        if (!punchline) {
            jokeElement.innerHTML = sanitizeHTML(jokeText);
        } else {
            jokeElement.innerHTML = `${sanitizeHTML(setup)}<br><span class="punchline">${sanitizeHTML(punchline)}</span>`;
        }
        
        // Remove fade-out and add fade-in effect
        jokeElement.classList.remove('fade-out');
        jokeElement.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
            jokeElement.classList.remove('fade-in');
        }, 400);
        
        // Update UI state
        favoritesManager.updateFavoriteButton(currentJoke);
    }, 200);
}

/**
 * Set loading state for buttons
 * @param {boolean} loading - Whether app is loading
 */
function setLoadingState(loading) {
    isLoading = loading;
    const btn = document.getElementById('random-btn');
    if (!btn) return;

    btn.disabled = loading;
    if (loading) {
        btn.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
    } else {
        btn.innerHTML = 'Next Joke';
    }
}

/**
 * Fetch and display a random joke from the API
 */
async function getRandomJoke() {
    if (isLoading) return;
    
    setLoadingState(true);
    clearError();
    
    try {
        const joke = await jokeService.fetchRandomJoke();
        displayJoke(joke);
    } catch (error) {
        console.error('Error fetching joke:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Search for jokes with specific terms
 */
async function searchJokes() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showError('Please enter a search term.');
        return;
    }
    
    if (isLoading) return;
    
    setLoadingState(true);
    clearError();
    
    try {
        const joke = await jokeService.searchJokes(searchTerm);
        displayJoke(joke);
    } catch (error) {
        console.error('Error searching jokes:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Toggle favorite status of current joke
 */
function toggleFavorite() {
    if (!currentJoke) return;
    
    const wasAdded = favoritesManager.toggleFavorite(currentJoke);
    
    if (wasAdded) {
        showConfirmation('Added to favorites! ❤️');
    } else {
        showConfirmation('Removed from favorites');
    }
    
    favoritesManager.updateFavoriteButton(currentJoke);
    
    // Refresh favorites view if currently viewing
    if (currentView === 'favorites') {
        favoritesManager.displayFavorites();
    }
}

/**
 * Copy current joke to clipboard
 */
async function copyJoke() {
    if (!currentJoke) return;
    
    const jokeElement = document.getElementById('joke-text');
    if (!jokeElement) return;
    
    const jokeText = getPlainText(jokeElement.innerHTML);
    
    try {
        const success = await copyToClipboard(jokeText);
        if (success) {
            showConfirmation('Copied!');
        } else {
            showError('Failed to copy joke. Your browser may not support this feature.');
        }
    } catch (error) {
        console.error('Failed to copy joke:', error);
        showError('Failed to copy joke. Your browser may not support this feature.');
    }
}

/**
 * Remove a favorite by ID
 * @param {string} favoriteId - The ID of the favorite to remove
 */
function removeFavorite(favoriteId) {
    const success = favoritesManager.removeFavoriteById(favoriteId);
    if (success) {
        favoritesManager.displayFavorites();
        favoritesManager.updateFavoriteButton(currentJoke);
        showConfirmation('Removed from favorites');
    }
}

/**
 * Show the main view
 */
function showMainView() {
    currentView = 'main';
    
    // Update view visibility
    document.getElementById('main-section')?.classList.add('active');
    document.getElementById('favorites-section')?.classList.remove('active');
    
    // Update toggle buttons
    document.getElementById('main-toggle')?.classList.add('active');
    document.getElementById('favorites-toggle')?.classList.remove('active');
    
    // Show controls
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'block';
}

/**
 * Show the favorites view
 */
function showFavoritesView() {
    currentView = 'favorites';
    
    // Update view visibility
    document.getElementById('main-section')?.classList.remove('active');
    document.getElementById('favorites-section')?.classList.add('active');
    
    // Update toggle buttons
    document.getElementById('main-toggle')?.classList.remove('active');
    document.getElementById('favorites-toggle')?.classList.add('active');
    
    // Hide controls
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'none';
    
    // Display favorites
    favoritesManager.displayFavorites();
}

/**
 * Make functions globally available for inline event handlers
 */
window.getRandomJoke = getRandomJoke;
window.searchJokes = searchJokes;
window.toggleFavorite = toggleFavorite;
window.copyJoke = copyJoke;
window.removeFavorite = removeFavorite;
window.showMainView = showMainView;
window.showFavoritesView = showFavoritesView;
window.displayJoke = displayJoke;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);