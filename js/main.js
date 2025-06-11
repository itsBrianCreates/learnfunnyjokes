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
    // Initialize with the default joke
    const defaultJoke = "Why don't scientists trust atoms? Because they make up everything!";
    historyManager.addToHistory(defaultJoke);
    currentJoke = defaultJoke;
    
    // Update initial UI state
    favoritesManager.updateFavoriteButton(currentJoke);
    historyManager.updateNavigationControls();
    
    // Set up event listeners
    setupEventListeners();
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
    
    // Arrow key navigation for jokes
    document.addEventListener('keydown', function(event) {
        // Only handle arrow keys if not focused on input and in main view
        if (document.activeElement === searchInput || currentView !== 'main') {
            return;
        }
        
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigateOrFetchJoke(-1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateOrFetchJoke(1);
        }
    });
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
        // Add to history if it's a new joke (not from navigation)
        if (addToHistory) {
            historyManager.addToHistory(jokeText);
        }
        
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
        historyManager.updateNavigationControls();
    }, 200);
}

/**
 * Set loading state for buttons
 * @param {boolean} loading - Whether app is loading
 */
function setLoadingState(loading) {
    isLoading = loading;
    const buttons = ['random-btn', 'search-btn'];
    
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        if (btnId === 'random-btn') {
            // Disable next joke button when loading
            btn.disabled = loading;
            if (loading) {
                btn.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
            } else {
                btn.innerHTML = 'Next Joke';
            }
        } else if (btnId === 'search-btn') {
            btn.disabled = loading;
            if (loading) {
                btn.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
            } else {
                btn.innerHTML = 'Search';
            }
        }
    });
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
 * Navigate through joke history or fetch new joke
 * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
 */
function navigateOrFetchJoke(direction) {
    if (direction === -1) {
        // Previous: try to navigate back in history
        const joke = historyManager.navigate(direction);
        if (joke) {
            displayJoke(joke, false);
        }
        // If no previous joke in history, do nothing (button should be disabled)
    } else if (direction === 1) {
        // Next: try to navigate forward in history, or fetch new joke
        const joke = historyManager.navigate(direction);
        if (joke) {
            displayJoke(joke, false);
        } else {
            // At the end of history, fetch a new joke
            getRandomJoke();
        }
    }
}

/**
 * Navigate through joke history (legacy function for compatibility)
 * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
 */
function navigateHistory(direction) {
    navigateOrFetchJoke(direction);
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
    document.getElementById('recently-viewed-section')?.classList.remove('active');
    
    // Update toggle buttons
    document.getElementById('main-toggle')?.classList.add('active');
    document.getElementById('favorites-toggle')?.classList.remove('active');
    document.getElementById('history-toggle')?.classList.remove('active');
    
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
    document.getElementById('recently-viewed-section')?.classList.remove('active');
    
    // Update toggle buttons
    document.getElementById('main-toggle')?.classList.remove('active');
    document.getElementById('favorites-toggle')?.classList.add('active');
    document.getElementById('history-toggle')?.classList.remove('active');
    
    // Hide controls
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'none';
    
    // Display favorites
    favoritesManager.displayFavorites();
}

/**
 * Show the history view
 */
function showHistoryView() {
    currentView = 'history';
    
    // Update view visibility
    document.getElementById('main-section')?.classList.remove('active');
    document.getElementById('favorites-section')?.classList.remove('active');
    document.getElementById('recently-viewed-section')?.classList.add('active');
    
    // Update toggle buttons
    document.getElementById('main-toggle')?.classList.remove('active');
    document.getElementById('favorites-toggle')?.classList.remove('active');
    document.getElementById('history-toggle')?.classList.add('active');
    
    // Hide controls
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'none';
    
    // Display history
    historyManager.displayHistory();
}

/**
 * Make functions globally available for inline event handlers
 */
window.getRandomJoke = getRandomJoke;
window.searchJokes = searchJokes;
window.navigateHistory = navigateHistory;
window.navigateOrFetchJoke = navigateOrFetchJoke;
window.toggleFavorite = toggleFavorite;
window.copyJoke = copyJoke;
window.removeFavorite = removeFavorite;
window.showMainView = showMainView;
window.showFavoritesView = showFavoritesView;
window.showHistoryView = showHistoryView;
window.displayJoke = displayJoke;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);