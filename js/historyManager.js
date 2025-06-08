/**
 * History Manager Module
 * Handles joke history tracking and navigation
 */

class HistoryManager {
    constructor(maxHistory = 10) {
        this.jokeHistory = [];
        this.historyIndex = -1;
        this.maxHistory = maxHistory;
    }

    /**
     * Add a joke to the history
     * @param {string} jokeText - The joke text to add
     */
    addToHistory(jokeText) {
        // Don't add duplicates if it's the same as the last joke
        if (this.jokeHistory.length > 0 && 
            this.jokeHistory[this.jokeHistory.length - 1].text === jokeText) {
            return;
        }
        
        const historyItem = {
            text: jokeText,
            id: generateId(),
            timestamp: new Date().toLocaleTimeString(),
            dateAdded: new Date()
        };
        
        this.jokeHistory.push(historyItem);
        
        // Keep only the last MAX_HISTORY items
        if (this.jokeHistory.length > this.maxHistory) {
            this.jokeHistory = this.jokeHistory.slice(-this.maxHistory);
        }
        
        // Update history index to point to the latest joke
        this.historyIndex = this.jokeHistory.length - 1;
        this.updateHistoryCount();
    }

    /**
     * Navigate through history
     * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
     * @returns {string|null} The joke text or null if navigation not possible
     */
    navigate(direction) {
        if (this.jokeHistory.length === 0) return null;
        
        const newIndex = this.historyIndex + direction;
        
        // Check bounds
        if (newIndex < 0 || newIndex >= this.jokeHistory.length) return null;
        
        this.historyIndex = newIndex;
        return this.jokeHistory[this.historyIndex].text;
    }

    /**
     * Get the current history item
     * @returns {Object|null} Current history item or null
     */
    getCurrentItem() {
        if (this.historyIndex >= 0 && this.historyIndex < this.jokeHistory.length) {
            return this.jokeHistory[this.historyIndex];
        }
        return null;
    }

    /**
     * Jump to a specific history item by ID
     * @param {string} itemId - The ID of the history item
     * @returns {string|null} The joke text or null if not found
     */
    jumpToItem(itemId) {
        const index = this.jokeHistory.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.historyIndex = index;
            return this.jokeHistory[this.historyIndex].text;
        }
        return null;
    }

    /**
     * Get all history items
     * @returns {Array} Array of history items
     */
    getAllHistory() {
        return [...this.jokeHistory];
    }

    /**
     * Get history count
     * @returns {number} Number of items in history
     */
    getHistoryCount() {
        return this.jokeHistory.length;
    }

    /**
     * Get current position info
     * @returns {Object} Object with current and total counts
     */
    getPositionInfo() {
        return {
            current: this.historyIndex + 1,
            total: this.jokeHistory.length
        };
    }

    /**
     * Check if navigation is possible
     * @returns {Object} Object with canGoPrevious and canGoNext flags
     */
    getNavigationState() {
        return {
            canGoPrevious: this.historyIndex > 0,
            canGoNext: this.historyIndex < this.jokeHistory.length - 1
        };
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.jokeHistory = [];
        this.historyIndex = -1;
        this.updateHistoryCount();
    }

    /**
     * Update the history count display
     */
    updateHistoryCount() {
        const countElement = document.getElementById('history-count');
        if (countElement) {
            countElement.textContent = `(${this.jokeHistory.length})`;
        }
    }

    /**
     * Update navigation controls based on current state
     */
    updateNavigationControls() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const historyInfo = document.getElementById('history-info');
        
        if (!prevBtn || !nextBtn || !historyInfo) return;
        
        const navState = this.getNavigationState();
        const positionInfo = this.getPositionInfo();
        
        // Update button states
        prevBtn.disabled = !navState.canGoPrevious;
        // Next button is always enabled (will fetch new joke if at end of history)
        nextBtn.disabled = false;
        
        // Update info display
        if (this.jokeHistory.length > 0) {
            historyInfo.textContent = `${positionInfo.current} of ${positionInfo.total}`;
        } else {
            historyInfo.textContent = '0 of 0';
        }
    }

    /**
     * Display history in the UI
     */
    displayHistory() {
        const historyList = document.getElementById('history-list');
        const emptyMessage = document.getElementById('empty-history');
        
        if (!historyList || !emptyMessage) return;
        
        if (this.jokeHistory.length === 0) {
            emptyMessage.style.display = 'block';
            historyList.innerHTML = '';
            historyList.appendChild(emptyMessage);
            return;
        }
        
        emptyMessage.style.display = 'none';
        historyList.innerHTML = '';
        
        // Display history in reverse order (newest first)
        this.jokeHistory.slice().reverse().forEach((historyItem, index) => {
            const actualIndex = this.jokeHistory.length - 1 - index;
            const historyItemEl = document.createElement('div');
            historyItemEl.className = 'history-item';
            
            // Mark current joke
            if (actualIndex === this.historyIndex) {
                historyItemEl.classList.add('current');
            }
            
            historyItemEl.innerHTML = `
                <div class="history-item-text">${sanitizeHTML(historyItem.text)}</div>
                <div class="history-item-meta">Viewed at: ${historyItem.timestamp}</div>
            `;
            
            // Add click handler to navigate to this joke
            historyItemEl.addEventListener('click', () => {
                this.historyIndex = actualIndex;
                if (window.displayJoke) {
                    window.displayJoke(historyItem.text, false);
                }
                if (window.showMainView) {
                    window.showMainView();
                }
            });
            
            historyList.appendChild(historyItemEl);
        });
    }
}

// Create and export history manager instance
const historyManager = new HistoryManager();