const LetterState = {
    IN_PLACE: 'inplace',
    CORRECT: 'correct',
    WRONG: 'wrong',
    EMPTY: 'empty'
} as const;

export type LetterStateType = typeof LetterState[keyof typeof LetterState];

export default LetterState;