/**
 * Favorites Manager Module
 * Handles favorite jokes storage and management using localStorage
 */

class FavoritesManager {
    constructor() {
        this.storageKey = 'dadJokeFavorites';
        this.favorites = [];
        this.loadFavorites();
    }

    /**
     * Load favorites from localStorage
     */
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.favorites = stored ? JSON.parse(stored) : [];
            this.updateFavoritesCount();
        } catch (error) {
            console.error('Error loading favorites:', error);
            // Clear potentially corrupt stored data
            localStorage.removeItem(this.storageKey);
            this.favorites = [];
        }
    }

    /**
     * Save favorites to localStorage
     */
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            this.updateFavoritesCount();
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    /**
     * Add a joke to favorites
     * @param {string} jokeText - The joke text to add
     * @returns {boolean} True if added, false if already exists
     */
    addFavorite(jokeText) {
        if (!jokeText || this.isFavorite(jokeText)) {
            return false;
        }

        const favoriteJoke = {
            text: jokeText,
            id: generateId(),
            dateAdded: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };

        this.favorites.push(favoriteJoke);
        this.saveFavorites();
        return true;
    }

    /**
     * Remove a joke from favorites
     * @param {string} favoriteId - The ID of the favorite to remove
     * @returns {boolean} True if removed, false if not found
     */
    removeFavoriteById(favoriteId) {
        const initialLength = this.favorites.length;
        this.favorites = this.favorites.filter(fav => fav.id !== favoriteId);
        
        if (this.favorites.length < initialLength) {
            this.saveFavorites();
            return true;
        }
        return false;
    }

    /**
     * Remove a joke from favorites by text
     * @param {string} jokeText - The joke text to remove
     * @returns {boolean} True if removed, false if not found
     */
    removeFavoriteByText(jokeText) {
        const initialLength = this.favorites.length;
        this.favorites = this.favorites.filter(fav => fav.text !== jokeText);
        
        if (this.favorites.length < initialLength) {
            this.saveFavorites();
            return true;
        }
        return false;
    }

    /**
     * Toggle favorite status of a joke
     * @param {string} jokeText - The joke text to toggle
     * @returns {boolean} True if now favorited, false if removed
     */
    toggleFavorite(jokeText) {
        if (this.isFavorite(jokeText)) {
            this.removeFavoriteByText(jokeText);
            return false;
        } else {
            this.addFavorite(jokeText);
            return true;
        }
    }

    /**
     * Check if a joke is favorited
     * @param {string} jokeText - The joke text to check
     * @returns {boolean} True if favorited, false otherwise
     */
    isFavorite(jokeText) {
        return this.favorites.some(fav => fav.text === jokeText);
    }

    /**
     * Get all favorites
     * @returns {Array} Array of favorite jokes
     */
    getAllFavorites() {
        return [...this.favorites];
    }

    /**
     * Get favorites count
     * @returns {number} Number of favorite jokes
     */
    getFavoritesCount() {
        return this.favorites.length;
    }

    /**
     * Clear all favorites
     */
    clearAllFavorites() {
        this.favorites = [];
        this.saveFavorites();
    }

    /**
     * Update the favorites count display
     */
    updateFavoritesCount() {
        const countElement = document.getElementById('favorites-count');
        if (countElement) {
            countElement.textContent = `(${this.favorites.length})`;
        }
    }

    /**
     * Update the favorite button state for current joke
     * @param {string} currentJoke - The current joke text
     */
    updateFavoriteButton(currentJoke) {
        const favoriteBtn = document.getElementById('favorite-btn');
        if (!favoriteBtn || !currentJoke) return;

        const isFavorited = this.isFavorite(currentJoke);
        
        if (isFavorited) {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.innerHTML = '❤️';
            favoriteBtn.title = 'Remove from favorites';
        } else {
            favoriteBtn.classList.remove('favorited');
            favoriteBtn.innerHTML = '♡';
            favoriteBtn.title = 'Add to favorites';
        }
    }

    /**
     * Display favorites in the UI
     */
    displayFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        const emptyMessage = document.getElementById('empty-favorites');
        
        if (!favoritesList || !emptyMessage) return;
        
        if (this.favorites.length === 0) {
            emptyMessage.style.display = 'block';
            favoritesList.innerHTML = '';
            favoritesList.appendChild(emptyMessage);
            return;
        }
        
        emptyMessage.style.display = 'none';
        favoritesList.innerHTML = '';
        
        // Sort favorites by timestamp (newest first)
        const sortedFavorites = [...this.favorites].sort((a, b) => b.timestamp - a.timestamp);
        
        sortedFavorites.forEach((favorite) => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.innerHTML = `
                <div class="favorite-joke-text">${sanitizeHTML(favorite.text)}</div>
                <div class="favorite-actions">
                    <small>Added: ${favorite.dateAdded}</small>
                    <button class="remove-favorite-btn" onclick="removeFavorite('${favorite.id}')">
                        Remove ❌
                    </button>
                </div>
            `;
            favoritesList.appendChild(favoriteItem);
        });
    }

    /**
     * Search favorites by text
     * @param {string} searchTerm - The term to search for
     * @returns {Array} Array of matching favorites
     */
    searchFavorites(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return this.getAllFavorites();
        }
        
        const term = searchTerm.toLowerCase();
        return this.favorites.filter(favorite => 
            favorite.text.toLowerCase().includes(term)
        );
    }

    /**
     * Export favorites as JSON
     * @returns {string} JSON string of favorites
     */
    exportFavorites() {
        return JSON.stringify(this.favorites, null, 2);
    }

    /**
     * Import favorites from JSON
     * @param {string} jsonString - JSON string of favorites to import
     * @param {boolean} replace - Whether to replace existing favorites
     * @returns {boolean} True if successful, false otherwise
     */
    importFavorites(jsonString, replace = false) {
        try {
            const importedFavorites = JSON.parse(jsonString);
            
            if (!Array.isArray(importedFavorites)) {
                throw new Error('Invalid format: expected array');
            }
            
            // Validate structure
            for (const favorite of importedFavorites) {
                if (!favorite.text || !favorite.id) {
                    throw new Error('Invalid favorite structure');
                }
            }
            
            if (replace) {
                this.favorites = importedFavorites;
            } else {
                // Merge, avoiding duplicates
                for (const favorite of importedFavorites) {
                    if (!this.isFavorite(favorite.text)) {
                        this.favorites.push(favorite);
                    }
                }
            }
            
            this.saveFavorites();
            return true;
        } catch (error) {
            console.error('Error importing favorites:', error);
            return false;
        }
    }
}

// Create and export favorites manager instance
const favoritesManager = new FavoritesManager();