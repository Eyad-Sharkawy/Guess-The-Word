import LetterState, { type LetterStateType } from "./LetterState.ts";

/**
 * LetterResult - Represents the evaluation result of a single letter in a guess
 * 
 * Contains the letter, its position, and its state (inplace, correct, or wrong).
 * 
 * @class LetterResult
 */
class LetterResult {
    /** The letter character */
    public readonly letter: string;
    /** The position index of the letter in the word */
    public readonly position: number;
    /** The evaluation state of the letter */
    public readonly state: LetterStateType;

    /**
     * Creates a new LetterResult instance
     * @param letter - The letter character
     * @param position - The position index in the word
     * @param state - The evaluation state (inplace, correct, or wrong)
     */
    constructor(letter: string, position: number, state: LetterStateType) {
        this.letter = letter;
        this.position = position;
        this.state = state;
    }

    public isInPlace(): boolean {
        return this.state === LetterState.IN_PLACE;
    }

    public isCorrect(): boolean {
        return this.state === LetterState.CORRECT;
    }

    public isWrong(): boolean {
        return this.state === LetterState.WRONG;
    }

    public isEmpty(): boolean {
        return this.state === LetterState.EMPTY;
    }
}

export default LetterResult;