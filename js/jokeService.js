/**
 * Joke Service Module
 * Handles API calls and local joke management
 */

// Local jokes array
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

class JokeService {
    constructor() {
        this.apiBaseUrl = 'https://icanhazdadjoke.com';
        this.currentLocalJokeIndex = 0;
    }

    /**
     * Fetch a random joke from the API
     * @returns {Promise<string>} The joke text
     */
    async fetchRandomJoke() {
        try {
            const response = await fetch(this.apiBaseUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.joke;
            
        } catch (error) {
            console.error('Error fetching random joke:', error);
            throw new Error('Failed to fetch joke. Please check your internet connection and try again.');
        }
    }

    /**
     * Search for jokes with specific terms
     * @param {string} searchTerm - The term to search for
     * @returns {Promise<string>} A random joke from search results
     */
    async searchJokes(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            throw new Error('Please enter a search term.');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/search?term=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // Get a random joke from the search results
                const randomJoke = data.results[Math.floor(Math.random() * data.results.length)];
                return randomJoke.joke;
            } else {
                throw new Error(`No jokes found for "${searchTerm}". Try a different search term.`);
            }
            
        } catch (error) {
            console.error('Error searching jokes:', error);
            if (error.message.includes('No jokes found')) {
                throw error;
            }
            throw new Error('Failed to search for jokes. Please check your internet connection and try again.');
        }
    }

    /**
     * Get a random local joke
     * @returns {string} The joke text
     */
    getLocalJoke() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * dadJokes.length);
        } while (newIndex === this.currentLocalJokeIndex && dadJokes.length > 1);
        
        this.currentLocalJokeIndex = newIndex;
        const joke = dadJokes[this.currentLocalJokeIndex];
        return `${joke.setup} ${joke.punchline}`;
    }

    /**
     * Get the current local joke index
     * @returns {number} Current index
     */
    getCurrentLocalJokeIndex() {
        return this.currentLocalJokeIndex;
    }

    /**
     * Get all local jokes
     * @returns {Array} Array of local jokes
     */
    getLocalJokes() {
        return [...dadJokes];
    }

    /**
     * Get total count of local jokes
     * @returns {number} Total number of local jokes
     */
    getLocalJokesCount() {
        return dadJokes.length;
    }
}

// Create and export joke service instance
const jokeService = new JokeService();