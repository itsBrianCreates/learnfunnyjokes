/**
 * Utility functions for the Dad Jokes app
 */

// Utility for showing confirmation messages
function showConfirmation(message = 'Copied!') {
    const confirmationElement = document.getElementById('confirmation-message');
    confirmationElement.textContent = message;
    
    // Show the confirmation message
    confirmationElement.classList.add('show');
    
    // Hide it after 2 seconds
    setTimeout(() => {
        confirmationElement.classList.remove('show');
    }, 2000);
}

// Utility for showing error messages
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

// Utility for clearing error messages
function clearError() {
    const existingError = document.getElementById('error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Utility for splitting jokes into setup and punchline
function splitJoke(jokeText) {
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
    
    return { setup, punchline };
}

// Utility for generating unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Utility for debouncing function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility for throttling function calls
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Utility for copying text to clipboard
async function copyToClipboard(text) {
    try {
        // Modern clipboard API
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            console.error('Failed to copy text:', fallbackError);
            return false;
        }
    }
}

// Utility for formatting dates
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

// Utility for formatting time
function formatTime(date) {
    return new Date(date).toLocaleTimeString();
}

// Utility for sanitizing HTML to prevent XSS
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Utility for getting plain text from HTML
function getPlainText(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}