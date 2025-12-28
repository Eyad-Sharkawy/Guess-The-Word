import LetterState from "./LetterState.ts";

class LetterResult {
    public readonly letter: string;
    public readonly position: number;
    public readonly state: typeof LetterState[keyof typeof LetterState];

    constructor(letter: string, position: number, state: typeof LetterState[keyof typeof LetterState]) {
        this.letter = letter;
        this.position = position;
        this.state = state;
    }

    public isInPlace() {
        return this.state === LetterState.IN_PLACE;
    }

    public isCorrect() {
        return this.state === LetterState.CORRECT;
    }

    public isWrong() {
        return this.state === LetterState.WRONG;
    }

    public isEmpty() {
        return this.state === LetterState.EMPTY;
    }
}

export default LetterResult;