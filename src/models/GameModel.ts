import LetterState from "./LetterState.ts";
import LetterResult from "./LetterResult.ts";

class GameModel {
    private correctAnswer = '';
    private currentRow = 0;
    private correctIndices = new Set<number>;
    
    private readonly maxRows = 6;
    private readonly wordLength = 6;
    private readonly apiUrl = 'https://random-word-api.herokuapp.com/word';
    private readonly apiTimeout = 5000;
    private readonly apiRetries = 3;

    getCorrectAnswer(): string {
        return this.correctAnswer;
    }

    getCurrentRow(): number {
        return this.currentRow;
    }

    getCorrectIndices(): Set<number> {
        return new Set(this.correctIndices);
    }

    getMaxRows(): number {
        return this.maxRows;
    }

    getWordLength(): number {
        return this.wordLength;
    }

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

    isRowFull(letters: string[]): boolean {
        if (!Array.isArray(letters)) {
            return false;
        }
        
        return letters.length === this.wordLength && letters.every(letter => letter && letter.trim().length > 0);
    }

    reset(): void {
        this.correctAnswer = '';
        this.currentRow = 0;
        this.correctIndices.clear();
    }

    incrementRow(): void {
        if (this.currentRow < this.maxRows - 1) {
            ++this.currentRow;
        }
    }

    isGameWon(guess: string): boolean {
        return guess.toUpperCase() === this.correctAnswer;
    }

    isGameLost(): boolean {
        return this.currentRow >= this.maxRows - 1;
    }

    getCorrectCount(): number {
        return this.correctIndices.size;
    }

    isPositionCorrect(index: number): boolean {
        return this.correctIndices.has(index);
    }
}

export default GameModel;