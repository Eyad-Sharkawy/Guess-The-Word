export const CSS_CLASSES = {
    INPUT_IN_PLACE: 'game__input-letter--inplace',
    INPUT_CORRECT: 'game__input-letter--correct',
    INPUT_WRONG: 'game__input-letter--wrong',
    INPUT_HINT: 'game__input-letter--hint'
} as const;

export type CssClassType = typeof CSS_CLASSES[keyof typeof CSS_CLASSES];

export const HINT_MESSAGE_TIMEOUT = 3000;

export const MAX_HINT_COUNT = 3;