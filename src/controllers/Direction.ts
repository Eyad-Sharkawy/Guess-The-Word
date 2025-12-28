const Direction = {
    FORWARD: 'forward',
    BACKWARD: 'backward'
} as const;

export type DirectionType = typeof Direction[keyof typeof Direction];

export default Direction;