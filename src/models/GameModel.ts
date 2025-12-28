import LetterState from "./LetterState.ts";
import LetterResult from "./LetterResult.ts";

class GameModel {
    private correctAnswer = '';
    private currentRow = 0;
    private correctIndices = new Set<number>;
    private readonly maxRows: number = 6;
    private readonly wordLength: number = 6;

    getCorrectAnswer() {
        return this.correctAnswer;
    }

    getCurrentRow() {
        return this.currentRow
    }

    getCorrectIndices() {
        return new Set(this.correctIndices);
    }

    getMaxRows() {
        return this.maxRows;
    }

    getWordLength() {
        return this.wordLength;
    }

    async fetchAnswer(): Promise<string> {
        const response = await fetch('https://random-word-api.herokuapp.com/word?length=6&number=1');
        const data = await response.json();
        return data[0];
    }

    setAnswer(answer: string) {
        this.correctAnswer = answer.toUpperCase();
    }

    checkRow(guess: string) {
        const results: LetterResult[] = [];
        const answerArray = this.correctAnswer.split("");
        const guessArray = guess.toUpperCase().split("");
        const usedIndices = new Set<number>();

        guessArray.forEach((letter, index) => {
            if (letter === answerArray[index]) {
                results[index] = new LetterResult(letter, index, LetterState.IN_PLACE)
                usedIndices.add(index);
                this.correctIndices.add(index);
            }
        });

        guessArray.forEach((letter, index) => {
            if (results[index]) return;

            if (!letter || letter.trim().length === 0) {
                results[index] =new LetterResult(letter, index, LetterState.WRONG)
                return;
            }

            const foundIndex = answerArray.findIndex(
                (char, i) => !usedIndices.has(i) && char === letter
            );

            if (foundIndex !== -1) {
                results[index] = new LetterResult(letter, index, LetterState.CORRECT);
                usedIndices.add(index);
            }
            else {
                results[index] = new LetterResult(letter, index, LetterState.WRONG);
            }
        });

        return results;
    }

    isRowFull(letters: string[]) {
        return letters.length === this.wordLength && letters.every(letter => letter && letter.trim().length > 0);
    }

    reset() {
        this.correctAnswer = '';
        this.currentRow = 0;
        this.correctIndices.clear();
    }

    incrementRow() {
        if (this.currentRow < this.maxRows - 1) {
            ++this.currentRow;
        }
    }

    isGameWon(guess: string) {
        return guess.toUpperCase() === this.correctAnswer;
    }

    isGameLost() {
        return this.currentRow >= this.maxRows - 1;
    }

    getCorrectCount() {
        return this.correctIndices.size;
    }

    public isPositionCorrect(index: number) {
        return this.correctIndices.has(index);
    }
}

export default GameModel;