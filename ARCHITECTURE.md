# Architecture Documentation

## Overview

This project follows the **Model-View-Controller (MVC)** architectural pattern, providing clear separation of concerns and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                      │
│                    (HTML + CSS + Events)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      GameController                         │
│  • Handles user interactions                                │
│  • Coordinates Model and View                               │
│  • Manages game flow and state transitions                  │
│  • Processes input validation                               │
└───────────────┬───────────────────────────────┬─────────────┘
                │                               │
                ▼                               ▼
    ┌───────────────────────┐      ┌───────────────────────┐
    │      GameModel        │      │      GameView         │
    │  • Game state         │      │  • DOM manipulation   │
    │  • Business logic     │      │  • UI updates         │
    │  • Word fetching      │      │  • Event binding      │
    │  • Guess validation   │      │                       │
    └───────────────────────┘      └───────────────────────┘
                │                               │
                └───────────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     InputView         │
                    │  • Individual input   │
                    │  • Event handling     │
                    └───────────────────────┘
```

## Component Responsibilities

### GameController
- **Purpose**: Orchestrates the game flow and coordinates between Model and View
- **Responsibilities**:
  - Initialize game state
  - Handle user input (keyboard, mouse, paste)
  - Validate user actions
  - Update View based on Model state
  - Manage game progression (row transitions, win/loss)
  - Clean up event listeners

### GameModel
- **Purpose**: Manages game state and business logic
- **Responsibilities**:
  - Fetch random words from API
  - Store correct answer
  - Track current row/attempt
  - Validate guesses
  - Evaluate letter states (inplace, correct, wrong)
  - Track correctly positioned letters
  - Determine win/loss conditions
  - Generate hints (select random unrevealed letters)
  - Track hint usage count

### GameView
- **Purpose**: Manages the main game UI
- **Responsibilities**:
  - Query and manipulate DOM elements
  - Enable/disable input rows
  - Update input values and classes
  - Manage button states
  - Display messages
  - Handle focus management

### InputView
- **Purpose**: Wraps individual input fields
- **Responsibilities**:
  - Attach event listeners to inputs
  - Validate input (letters only, uppercase)
  - Handle paste events
  - Provide clean interface for input manipulation

## Data Flow

### Game Initialization
1. `main.ts` creates Model, View, and Controller instances
2. Controller calls `model.fetchAnswer()` to get random word
3. Controller initializes InputView instances for each input field
4. Controller sets up event listeners
5. Controller enables first row

### User Input Flow
1. User types/pastes into input field
2. `InputView` validates and normalizes input
3. `InputView` calls Controller's `handleInputChange`
4. Controller updates View (enable/disable buttons, move focus)
5. Controller checks if row is full

### Guess Submission Flow
1. User clicks "Check Word" or presses Enter
2. Controller calls `handleCheckWord()`
3. Controller gets row values from View
4. Controller calls `model.checkRow(guess)`
5. Model evaluates guess and returns letter results
6. Controller updates View with visual feedback (CSS classes)
7. Controller checks win/loss conditions
8. If game continues, Controller transitions to next row
9. Controller auto-fills correct letters in next row

### Hint Flow
1. User clicks "Hint" button
2. Controller calls `handleHint()`
3. Controller calls `model.getHintIndex()` to get a random unrevealed letter index
4. If no unrevealed letters exist, show message and return
5. Controller gets the letter at that index via `model.getLetterAtIndex()`
6. Controller calls `view.revealHint()` to display the letter
7. Controller marks the index as correct via `model.addCorrectIndex()`
8. Controller increments hint count via `model.incrementHint()`
9. Controller checks if row is now full and enables "Check Word" button if needed
10. Controller displays hint message and disables hint button after 3 uses

## State Management

### GameModel State
- `correctAnswer`: The word to guess (string)
- `currentRow`: Current attempt index (0-5)
- `correctIndices`: Set of indices with correctly positioned letters
- `hintCount`: Number of hints used (0-3)
- `maxRows`: Maximum number of attempts (6)
- `wordLength`: Required word length (6)

### GameController State
- `inputViews`: 2D array of InputView instances
- Event handler references (for cleanup)
- Hint timeout ID (for message display)

## Letter Evaluation Algorithm

The game uses a two-pass algorithm to evaluate letters:

1. **First Pass**: Check for exact matches (IN_PLACE)
   - Compare each letter at the same position
   - Mark as IN_PLACE if match
   - Mark position as "used" in answer

2. **Second Pass**: Check for correct letters in wrong positions (CORRECT)
   - For remaining unmatched letters in guess
   - Search answer for matching letter not already used
   - Mark as CORRECT if found
   - Mark position as "used" in answer

3. **Remaining**: All other letters marked as WRONG

This ensures:
- Each letter in the answer is only matched once
- Priority given to exact position matches
- Correct handling of duplicate letters

## Error Handling

- **API Failures**: Retries 3 times with exponential backoff, falls back to "WORDLE"
- **Invalid Input**: Filtered to letters only, converted to uppercase
- **Invalid State**: Validation checks prevent invalid operations
- **DOM Errors**: Thrown if required elements not found

## Extension Points

The architecture supports easy extension:

- **New Features**: Add methods to Model, update Controller, extend View
- **Different Word Lengths**: Modify `wordLength` and `maxRows` in Model
- **Custom APIs**: Replace `fetchAnswer()` implementation
- **Additional Views**: Create new View classes following same pattern
- **Hint System**: Fully implemented - reveals random unrevealed letters (max 3 per game)

