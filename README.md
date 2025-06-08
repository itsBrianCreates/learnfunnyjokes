# Dad Jokes Web App

A modern, responsive web application for viewing and managing dad jokes with API integration, favorites, and history tracking.

## Features

- 🎯 **API Integration**: Fetch jokes from icanhazdadjoke.com
- 🔍 **Search**: Find jokes by keyword
- ❤️ **Favorites**: Save your favorite jokes locally
- 📚 **History**: Navigate through recently viewed jokes
- 📱 **Mobile Optimized**: Touch-friendly design for all devices
- ✨ **Smooth Animations**: Polished transitions and interactions
- ⌨️ **Keyboard Support**: Press Enter for next joke

## Project Structure

```
dad-jokes-app/
├── index.html              # Main HTML structure
├── styles.css             # All styling and responsive design
├── js/                    # JavaScript modules
│   ├── main.js           # Main application logic
│   ├── jokeService.js    # API calls and joke fetching
│   ├── favoritesManager.js # Favorites handling with localStorage
│   ├── historyManager.js  # History tracking and navigation
│   └── utils.js          # Shared utility functions
└── README.md             # This file
```

## Architecture

### Modular Design

The application is built with a modular architecture for maintainability and scalability:

**Core Modules:**

1. **JokeService** (`jokeService.js`)
   - Handles API communication with icanhazdadjoke.com
   - Manages local joke fallbacks
   - Provides search functionality

2. **FavoritesManager** (`favoritesManager.js`)
   - Manages favorite jokes using localStorage
   - Provides CRUD operations for favorites
   - Handles favorites UI updates

3. **HistoryManager** (`historyManager.js`)
   - Tracks recently viewed jokes in memory
   - Provides navigation through joke history
   - Manages history display and controls

4. **Utils** (`utils.js`)
   - Shared utility functions
   - DOM helpers and common operations
   - Error handling utilities

5. **Main App** (`main.js`)
   - Coordinates all modules
   - Handles UI interactions
   - Manages application state

### Key Features

#### API Integration
- Fetches random jokes from icanhazdadjoke.com
- Search jokes by keyword
- Graceful error handling with user feedback
- Loading states with animated spinners

#### Favorites System
- Click heart icon to save/remove favorites
- Persistent storage using localStorage
- View all favorites in dedicated section
- Export/import functionality

#### History & Navigation
- Automatically tracks last 10 viewed jokes
- Previous/Next navigation buttons
- Click any history item to jump back
- Session-based storage (resets on page reload)

#### Mobile Optimization
- Touch-friendly 48px+ button targets
- Responsive layout for phones and tablets
- Native system fonts for better performance
- Optimized animations for mobile devices

#### Keyboard Support
- Press Enter to get next joke
- Enter in search box triggers search
- Disabled when typing in inputs

## Usage

### Getting Started
1. Open `index.html` in a web browser
2. The app loads with a default joke
3. Use the buttons to navigate and interact

### Navigation
- **New Jokes Tab**: Main interface with API jokes
- **My Favorites Tab**: Saved favorite jokes
- **Recently Viewed Tab**: History of viewed jokes

### Controls
- **Next Joke**: Fetch random joke from API
- **Search**: Find jokes by keyword
- **Heart Icon**: Add/remove from favorites
- **Copy Joke**: Copy to clipboard
- **← Previous / Next →**: Navigate through history

## Technical Details

### Dependencies
- No external JavaScript libraries
- Pure vanilla JavaScript ES6+
- Modern CSS with Flexbox and Grid
- Uses Fetch API for HTTP requests

### Browser Support
- Modern browsers supporting ES6+
- Chrome 61+, Firefox 60+, Safari 12+, Edge 79+
- Mobile browsers on iOS 12+ and Android 7+

### Performance
- Lazy loading and efficient DOM updates
- GPU-accelerated animations
- Optimized mobile interactions
- Minimal resource usage

### Storage
- **Favorites**: Persistent localStorage
- **History**: Session memory (10 items max)
- **No cookies or tracking**

## Development

### File Organization
- HTML structure separated from logic
- CSS in external stylesheet
- JavaScript split into focused modules
- Clear separation of concerns

### Code Style
- ES6+ modern JavaScript
- Class-based modules
- Comprehensive error handling
- Extensive documentation

### Extensibility
- Modular architecture allows easy feature additions
- Clear API boundaries between modules
- Configurable constants and settings
- Event-driven communication

## API Reference

### icanhazdadjoke.com
- **Endpoint**: `https://icanhazdadjoke.com/`
- **Search**: `https://icanhazdadjoke.com/search?term={query}`
- **Headers**: `Accept: application/json`
- **Rate Limits**: Reasonable usage expected
- **Documentation**: https://icanhazdadjoke.com/api

## License

This project is for educational and personal use. The icanhazdadjoke.com API is used under their terms of service.