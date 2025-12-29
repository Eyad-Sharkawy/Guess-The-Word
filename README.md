# Guess the Word

A Wordle-inspired word guessing game built with TypeScript, following the MVC (Model-View-Controller) architecture pattern. Players have 6 attempts to guess a 6-letter word, with visual feedback indicating whether letters are correct and in the right position, correct but in the wrong position, or incorrect.

## Features

- 🎮 **Word Guessing Gameplay**: 6 attempts to guess a 6-letter word
- 🎯 **Visual Feedback**: Color-coded indicators for letter correctness
  - 🟢 Green: Letter is correct and in the right position
  - 🟡 Yellow: Letter is correct but in the wrong position
  - 🔴 Red: Letter is incorrect
- ⌨️ **Keyboard Navigation**: Arrow keys, Enter, and Backspace support
- 📋 **Paste Support**: Paste entire words to fill multiple inputs at once
- 🔄 **Auto-fill Correct Letters**: Correctly positioned letters are automatically filled in subsequent rows
- 🔁 **Restart Functionality**: Start a new game with a fresh word
- 💡 **Hint Button**: Placeholder for future hint feature
- 🌐 **Random Word API**: Fetches random 6-letter words from an external API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd guess-the-word
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
guess-the-word/
├── src/
│   ├── constants/
│   │   └── CssClasses.ts          # CSS class name constants
│   ├── controllers/
│   │   ├── Direction.ts           # Direction enum for navigation
│   │   └── GameController.ts      # Main game controller (MVC pattern)
│   ├── models/
│   │   ├── GameModel.ts           # Game state and logic
│   │   ├── LetterResult.ts        # Letter evaluation result
│   │   └── LetterState.ts         # Letter state enum
│   ├── views/
│   │   ├── GameView.ts            # Main game view
│   │   └── InputView.ts           # Individual input field view
│   ├── styles/
│   │   └── style.css              # Application styles
│   └── main.ts                    # Application entry point
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

## Architecture

This project follows the **MVC (Model-View-Controller)** architectural pattern:

### Model (`GameModel`)
- Manages game state (current row, correct answer, correct indices)
- Handles word fetching from external API
- Validates guesses and determines letter states
- Tracks game progress (win/loss conditions)

### View (`GameView`, `InputView`)
- `GameView`: Manages the overall game UI, input rows, buttons, and messages
- `InputView`: Wraps individual input fields with event handling

### Controller (`GameController`)
- Coordinates between Model and View
- Handles user interactions (keyboard, clicks, paste)
- Manages game flow and state transitions
- Processes input validation and navigation

## How It Works

1. **Initialization**: On page load, the game fetches a random 6-letter word from the API
2. **Input**: Players type letters into the input fields (one letter per field)
3. **Validation**: When a row is complete, the "Check Word" button becomes enabled
4. **Evaluation**: Clicking "Check Word" or pressing Enter evaluates the guess:
   - Letters are compared against the answer
   - Each letter receives a state: `inplace`, `correct`, or `wrong`
   - Visual feedback is applied via CSS classes
5. **Progress**: Correctly positioned letters are automatically filled in the next row
6. **Win/Loss**: The game ends when:
   - The player guesses the word correctly (win)
   - The player uses all 6 attempts without guessing correctly (loss)

## API Integration

The game uses the [Random Word API](https://random-word-api.herokuapp.com/) to fetch random 6-letter words:

- **Endpoint**: `https://random-word-api.herokuapp.com/word?length=6&number=1`
- **Timeout**: 5 seconds per request
- **Retries**: 3 attempts with exponential backoff
- **Fallback**: If the API fails, defaults to "WORDLE"

## Keyboard Controls

- **Arrow Left/Right**: Navigate between input fields
- **Enter**: Submit guess (if row is full) or move to next input
- **Backspace**: Delete current letter or move to previous input
- **Paste**: Paste a word to fill multiple inputs at once

## Technologies Used

- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Normalize.css**: CSS reset for consistent styling
- **ES Modules**: Modern JavaScript module system

## Development Notes

- The game is configured for 6-letter words and 6 attempts
- In development mode, the correct answer is logged to the console
- The hint feature is currently a placeholder
- All input is automatically converted to uppercase
- Only alphabetic characters are accepted in input fields

## License

This project is private and not licensed for public use.

