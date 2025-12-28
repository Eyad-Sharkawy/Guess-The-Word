import LetterState, { type LetterStateType } from "./LetterState.ts";

class LetterResult {
    public readonly letter: string;
    public readonly position: number;
    public readonly state: LetterStateType;

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