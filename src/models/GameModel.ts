import LetterState from "./LetterState.ts";
import LetterResult from "./LetterResult.ts";

/**
 * GameModel - Manages game state and business logic
 * 
 * Handles word fetching, guess validation, letter state evaluation,
 * and game progress tracking. Follows the MVC pattern as the Model component.
 * 
 * @class GameModel
 */
class GameModel {
    private correctAnswer = '';
    private currentRow = 0;
    private correctIndices = new Set<number>;
    
    private readonly maxRows = 6;
    private readonly wordLength = 6;
    private readonly apiUrl = 'https://random-word-api.herokuapp.com/word';
    private readonly apiTimeout = 5000;
    private readonly apiRetries = 3;

    /**
     * Gets the correct answer word
     * @returns The correct answer as an uppercase string
     */
    getCorrectAnswer(): string {
        return this.correctAnswer;
    }

    /**
     * Gets the current active row index (0-based)
     * @returns The current row index
     */
    getCurrentRow(): number {
        return this.currentRow;
    }

    /**
     * Gets a copy of the set of indices where letters are correctly positioned
     * @returns A new Set containing correct position indices
     */
    getCorrectIndices(): Set<number> {
        return new Set(this.correctIndices);
    }

    /**
     * Gets the maximum number of rows (attempts) allowed
     * @returns The maximum number of rows
     */
    getMaxRows(): number {
        return this.maxRows;
    }

    /**
     * Gets the required word length
     * @returns The word length
     */
    getWordLength(): number {
        return this.wordLength;
    }

    /**
     * Fetches a random word from the external API
     * 
     * Attempts to fetch a word with retry logic (3 attempts) and timeout handling.
     * 
     * @returns A promise that resolves to a random 6-letter word
     * @throws {Error} If all retry attempts fail
     */
    async fetchAnswer(): Promise<string> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= this.apiRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);
                
                try {
                    const response = await fetch(
                        `${this.apiUrl}?length=${this.wordLength}&number=1`,
                        { signal: controller.signal }
                    );
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch word: ${response.status} ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    
                    if (!Array.isArray(data) || data.length === 0 || !data[0]) {
                        throw new Error('Invalid response from word API');
                    }
                    
                    const word = data[0];
                    
                    if (word.length !== this.wordLength) {
                        throw new Error(`Word length mismatch: expected ${this.wordLength}, got ${word.length}`);
                    }
                    
                    return word;
                } catch (error) {
                    clearTimeout(timeoutId);
                    throw error;
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < this.apiRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }
        
        throw lastError || new Error('Failed to fetch word after all retries');
    }

    /**
     * Sets the correct answer word
     * 
     * Validates that the answer is a non-empty string of the correct length
     * and contains only alphabetic characters. Converts to uppercase.
     * 
     * @param answer - The answer word to set
     * @throws {Error} If the answer is invalid (empty, wrong length, or non-alphabetic)
     */
    setAnswer(answer: string): void {
        if (!answer || typeof answer !== 'string') {
            throw new Error('Answer must be a non-empty string');
        }
        
        const trimmedAnswer = answer.trim().toUpperCase();
        
        if (trimmedAnswer.length === 0) {
            throw new Error('Answer cannot be empty');
        }
        
        if (trimmedAnswer.length !== this.wordLength) {
            throw new Error(`Answer length must be ${this.wordLength}, got ${trimmedAnswer.length}`);
        }
        
        if (!/^[A-Z]+$/.test(trimmedAnswer)) {
            throw new Error('Answer must contain only letters');
        }
        
        this.correctAnswer = trimmedAnswer;
    }

    /**
     * Checks a guess against the correct answer
     * 
     * Evaluates each letter in the guess and determines its state:
     * - IN_PLACE: Letter is correct and in the right position
     * - CORRECT: Letter is in the word but in the wrong position
     * - WRONG: Letter is not in the word
     * 
     * Tracks newly discovered correct positions and updates the internal state.
     * 
     * @param guess - The guessed word (will be converted to uppercase)
     * @returns An object containing letter results and newly found correct indices
     * @throws {Error} If the answer hasn't been set or guess length is incorrect
     */
    checkRow(guess: string): { results: LetterResult[]; newCorrectIndices: Set<number> } {
        if (!this.correctAnswer || this.correctAnswer.length === 0) {
            throw new Error('Cannot check row: answer has not been set');
        }
        
        if (guess.length !== this.wordLength) {
            throw new Error(`Guess length must be ${this.wordLength}, got ${guess.length}`);
        }

        const results: LetterResult[] = [];
        const answerArray = this.correctAnswer.split("");
        const guessArray = guess.toUpperCase().split("");
        const usedIndices = new Set<number>();
        const newCorrectIndices = new Set<number>();

        guessArray.forEach((letter, index) => {
            if (letter === answerArray[index]) {
                results[index] = new LetterResult(letter, index, LetterState.IN_PLACE);
                usedIndices.add(index);
                newCorrectIndices.add(index);
            }
        });

        guessArray.forEach((letter, index) => {
            if (results[index]) return;

            if (!letter || letter.trim().length === 0) {
                results[index] = new LetterResult(letter, index, LetterState.WRONG);
                return;
            }

            const foundIndex = answerArray.findIndex(
                (char, i) => !usedIndices.has(i) && char === letter
            );

            if (foundIndex !== -1) {
                results[index] = new LetterResult(letter, index, LetterState.CORRECT);
                usedIndices.add(foundIndex);
            }
            else {
                results[index] = new LetterResult(letter, index, LetterState.WRONG);
            }
        });

        newCorrectIndices.forEach(index => this.correctIndices.add(index));

        return { results, newCorrectIndices };
    }

    /**
     * Checks if a row is completely filled with valid letters
     * @param letters - Array of letter strings to check
     * @returns True if the row has the correct length and all letters are non-empty
     */
    isRowFull(letters: string[]): boolean {
        if (!Array.isArray(letters)) {
            return false;
        }
        
        return letters.length === this.wordLength && letters.every(letter => letter && letter.trim().length > 0);
    }

    /**
     * Resets the game state to initial values
     * Clears the answer, resets current row to 0, and clears correct indices
     */
    reset(): void {
        this.correctAnswer = '';
        this.currentRow = 0;
        this.correctIndices.clear();
    }

    /**
     * Increments the current row index (moves to next attempt)
     * Only increments if not already at the maximum row
     */
    incrementRow(): void {
        if (this.currentRow < this.maxRows - 1) {
            ++this.currentRow;
        }
    }

    /**
     * Checks if the game has been won
     * @param guess - The guessed word to check
     * @returns True if the guess matches the correct answer (case-insensitive)
     */
    isGameWon(guess: string): boolean {
        return guess.toUpperCase() === this.correctAnswer;
    }

    /**
     * Checks if the game has been lost (no more attempts remaining)
     * @returns True if the current row is at or beyond the last allowed row
     */
    isGameLost(): boolean {
        return this.currentRow >= this.maxRows - 1;
    }

    /**
     * Gets the count of correctly positioned letters
     * @returns The number of correct positions found
     */
    getCorrectCount(): number {
        return this.correctIndices.size;
    }

    /**
     * Checks if a specific position index has a correct letter
     * @param index - The position index to check
     * @returns True if the position has a correctly placed letter
     */
    isPositionCorrect(index: number): boolean {
        return this.correctIndices.has(index);
    }
}

export default GameModel;