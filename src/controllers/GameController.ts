import GameModel from "../models/GameModel.ts";
import GameView from "../views/GameView.ts";
import InputView from "../views/InputView.ts";
import Direction, { type DirectionType } from "./Direction.ts";
import {CSS_CLASSES, HINT_MESSAGE_TIMEOUT, MAX_HINT_COUNT} from "../constants/Constants.ts";

/**
 * GameController - Coordinates game logic between Model and View
 * 
 * Handles user interactions, manages game flow, and processes input validation.
 * Follows the MVC pattern as the Controller component.
 * 
 * @class GameController
 */
class GameController {
    private readonly model: GameModel;
    private readonly view: GameView;
    private inputViews: InputView[][] = [];
    private enterKeyHandler: ((event: KeyboardEvent) => void) | null = null;
    private checkWordHandler: (() => void) | null = null;
    private restartHandler: (() => void) | null = null;
    private hintHandler: (() => void) | null = null;
    private hintTimeoutId: number | null = null;
    private readonly isDevelopment: boolean = import.meta.env.DEV;

    /**
     * Creates a new GameController instance
     * @param model - The game model instance
     * @param view - The game view instance
     */
    constructor(model: GameModel, view: GameView) {
        this.model = model;
        this.view = view;
    }

    /**
     * Initializes the game by fetching a word, setting up input views, and starting the game
     * @throws {Error} If word fetching fails, falls back to default word "WORDLE"
     */
    async init(): Promise<void> {
        try {
            const answer = await this.model.fetchAnswer();
            this.model.setAnswer(answer);
            if (this.isDevelopment) {
                console.log(`Answer: ${answer}`);
            }
        }
        catch (error) {
            console.error(`Failed to fetch word`, error);
            this.model.setAnswer("WORDLE");
        }

        this.initializeInputViews();

        this.setupEventListeners();

        this.start();
    }

    /**
     * Starts the game by enabling the first row of inputs
     */
    start(): void {
        this.view.enableRow(0);
    }

    private initializeInputViews(): void {
        const rowCount = this.view.getRowCount();
        this.inputViews = [];

        for (let rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
            const inputs = this.view.getRowInputs(rowIndex);
            const rowInputViews: InputView[] = [];

            inputs.forEach((input, inputIndex) => {
                const inputView = new InputView(input, rowIndex, inputIndex);
                inputView.attachEventListeners(
                    this.handleInputChange.bind(this),
                    this.handleKeydown.bind(this),
                    this.handlePaste.bind(this),
                );
                rowInputViews.push(inputView);
            });

            this.inputViews.push(rowInputViews);
        }
    }

    private setupEventListeners(): void {
        this.checkWordHandler = () => {
            this.handleCheckWord();
        };
        this.view.getCheckWordButton().addEventListener('click', this.checkWordHandler);

        this.restartHandler = () => {
            this.handleRestart();
        };
        this.view.getRestartButton().addEventListener('click', this.restartHandler);

        this.hintHandler = () => {
            this.handleHint();
        };
        this.view.getHintButton().addEventListener('click', this.hintHandler);

        this.enterKeyHandler = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement) {
                return;
            }
            
            if (event.key === 'Enter') {
                this.handleEnterKey();
            }
        };
        
        document.addEventListener('keydown', this.enterKeyHandler);
    }

    private cleanupEventListeners(): void {
        if (this.enterKeyHandler) {
            document.removeEventListener('keydown', this.enterKeyHandler);
            this.enterKeyHandler = null;
        }
        
        if (this.checkWordHandler) {
            this.view.getCheckWordButton().removeEventListener('click', this.checkWordHandler);
            this.checkWordHandler = null;
        }
        
        if (this.restartHandler) {
            this.view.getRestartButton().removeEventListener('click', this.restartHandler);
            this.restartHandler = null;
        }
        
        if (this.hintHandler) {
            this.view.getHintButton().removeEventListener('click', this.hintHandler);
            this.hintHandler = null;
        }
        
        if (this.hintTimeoutId) {
            clearTimeout(this.hintTimeoutId);
            this.hintTimeoutId = null;
        }
    }

    private handleInputChange(rowIndex: number, inputIndex: number, value: string): void {
        const currentRow = this.model.getCurrentRow();

        if (rowIndex !== currentRow) return;

        if (value) {
            const wordLength = this.model.getWordLength();
            if (inputIndex < wordLength - 1) {
                this.moveToNextInput(rowIndex, inputIndex, Direction.FORWARD);
            }
        }

        const rowValues = this.view.getRowValues(currentRow);
        const isFull = this.model.isRowFull(rowValues);
        this.view.setCheckButtonEnabled(isFull);
    }

    private handlePaste(rowIndex: number, startIndex: number, letters: string[]): void {
        const currentRow = this.model.getCurrentRow();
        
        if (rowIndex !== currentRow) return;
        
        const wordLength = this.model.getWordLength();
        const maxIndex = Math.min(startIndex + letters.length, wordLength);
        
        for (let i = 0; i < letters.length && (startIndex + i) < wordLength; i++) {
            const inputIndex = startIndex + i;
            const letter = letters[i];
            
            if (letter) {
                this.view.setInputValue(rowIndex, inputIndex, letter);
                const input = this.inputViews[rowIndex][inputIndex].getInputElement();
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        
        const nextIndex = Math.min(maxIndex, wordLength - 1);
        if (nextIndex < wordLength) {
            requestAnimationFrame(() => {
                this.view.focusInput(rowIndex, nextIndex);
            });
        }
        
        const rowValues = this.view.getRowValues(currentRow);
        const isFull = this.model.isRowFull(rowValues);
        this.view.setCheckButtonEnabled(isFull);
    }

    private handleKeydown(rowIndex: number, inputIndex: number, event: KeyboardEvent): void {
        const currentRow = this.model.getCurrentRow();

        if (rowIndex !== currentRow) return;

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (inputIndex > 0) {
                this.moveToNextInput(rowIndex, inputIndex, Direction.BACKWARD);
            }
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (inputIndex < this.inputViews[rowIndex].length - 1) {
                this.moveToNextInput(rowIndex, inputIndex, Direction.FORWARD);
            }
        }

        if (event.key === 'Backspace') {
            const currentValue = this.inputViews[rowIndex][inputIndex].getValue();
            if (!currentValue && inputIndex > 0) {
                event.preventDefault();
                this.moveToNextInput(rowIndex, inputIndex, Direction.BACKWARD);
            }
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const rowValues = this.view.getRowValues(currentRow);
            
            if (this.model.isRowFull(rowValues)) {
                this.handleCheckWord();
                return;
            }
            
            const currentValue = this.inputViews[rowIndex][inputIndex].getValue();
            if (currentValue && inputIndex < this.inputViews[rowIndex].length - 1) {
                this.moveToNextInput(rowIndex, inputIndex, Direction.FORWARD);
            }
        }
    }

    private handleEnterKey(): void {
        const currentRow = this.model.getCurrentRow();
        const rowValues = this.view.getRowValues(currentRow);

        if (this.model.isRowFull(rowValues)) {
            this.handleCheckWord();
        }
    }

    private handleCheckWord(): void {
        const currentRow = this.model.getCurrentRow();
        const rowValues = this.view.getRowValues(currentRow);
        const guess = rowValues.join('');

        if (!this.model.isRowFull(rowValues)) {
            return;
        }

        try {
            const { results } = this.model.checkRow(guess);

            results.forEach((result, index) => {
                let className: string;
                switch (result.state) {
                    case 'inplace':
                        className = CSS_CLASSES.INPUT_IN_PLACE;
                        break;
                    case 'correct':
                        className = CSS_CLASSES.INPUT_CORRECT;
                        break;
                    case 'wrong':
                        className = CSS_CLASSES.INPUT_WRONG;
                        break;
                    default:
                        className = CSS_CLASSES.INPUT_WRONG;
                }
                this.view.addInputClass(currentRow, index, className);
            });
        } catch (error) {
            console.error('Error checking word:', error);
            this.view.updateMessage('Error: Invalid guess. Please try again.');
            return;
        }

        this.view.disableRow(currentRow);

        if (this.model.isGameWon(guess)) {
            const answer = this.model.getCorrectAnswer();
            this.view.updateMessage(`You Won! The word was ${answer.toUpperCase()}`);
            this.view.setCheckButtonEnabled(false);
            return;
        }

        if (this.model.isGameLost()) {
            const answer = this.model.getCorrectAnswer();
            this.view.updateMessage(`You Lost! The word was ${answer.toUpperCase()}`);
            this.view.setCheckButtonEnabled(false);
            return;
        }

        if (this.transitionToNextStage()) {
            this.model.incrementRow();
        }
    }

    private transitionToNextStage(): boolean {
        const currentRow = this.model.getCurrentRow();
        const nextRow = currentRow + 1;

        this.view.enableRow(nextRow);

        this.view.setCheckButtonEnabled(false);

        this.updateCorrectIndicesInNextRow(nextRow);

        this.view.focusFirstEnabledInput(nextRow);

        return true;
    }

    private updateCorrectIndicesInNextRow(nextRow: number): void {
        const maxRows = this.model.getMaxRows();
        if (nextRow < 0 || nextRow >= maxRows) {
            if (this.isDevelopment) {
                console.warn(`Invalid nextRow index: ${nextRow}`);
            }
            return;
        }
        
        const correctIndices = this.model.getCorrectIndices();
        const answer = this.model.getCorrectAnswer();
        const answerArray = answer.split('');
        const wordLength = this.model.getWordLength();

        correctIndices.forEach((index) => {
            if (index < 0 || index >= wordLength || index >= answerArray.length) {
                if (this.isDevelopment) {
                    console.warn(`Invalid index in correctIndices: ${index}`);
                }
                return;
            }
            
            this.view.setInputValue(nextRow, index, answerArray[index]);

            this.view.addInputClass(nextRow, index, CSS_CLASSES.INPUT_IN_PLACE);

            const inputs = this.view.getRowInputs(nextRow);
            if (index < inputs.length) {
                inputs[index].disabled = true;
            }
        });
    }

    private moveToNextInput(
        rowIndex: number,
        currentIndex: number,
        direction: DirectionType
    ): void {
        if (rowIndex < 0 || rowIndex >= this.inputViews.length) {
            if (this.isDevelopment) {
                console.warn(`Invalid row index: ${rowIndex}`);
            }
            return;
        }
        
        const inputs = this.inputViews[rowIndex];
        
        if (!inputs || inputs.length === 0) {
            if (this.isDevelopment) {
                console.warn(`No inputs found for row: ${rowIndex}`);
            }
            return;
        }
        
        const startIndex = direction === Direction.FORWARD ? currentIndex + 1 : currentIndex - 1;
        const endIndex = direction === Direction.FORWARD ? inputs.length : -1;
        const step = direction === Direction.FORWARD ? 1 : -1;

        for (let i = startIndex; i !== endIndex; i += step) {
            if (i < 0 || i >= inputs.length) {
                continue;
            }
            
            if (!inputs[i].isDisabled()) {
                inputs[i].focus();
                break;
            }
        }
    }

    private async handleRestart(): Promise<void> {
        this.cleanupEventListeners();
        
        this.model.reset();

        this.view.reset();

        await this.init();
    }

    private handleHint(): void {
        if (this.hintTimeoutId) {
            clearTimeout(this.hintTimeoutId);
        }

        const currentRow = this.model.getCurrentRow();
        const hintIndex = this.model.getHintIndex();

        if (hintIndex === -1) {
            this.view.updateMessage('All letters have been revealed!');
            this.hintTimeoutId = window.setTimeout(() => {
                this.view.clearMessage();
                this.hintTimeoutId = null;
            }, HINT_MESSAGE_TIMEOUT);
            return;
        }

        const letter = this.model.getLetterAtIndex(hintIndex);

        this.view.revealHint(currentRow, hintIndex, letter);

        this.model.addCorrectIndex(hintIndex);
        this.model.incrementHint();

        const rowValues = this.view.getRowValues(currentRow);
        const isFull = this.model.isRowFull(rowValues);
        this.view.setCheckButtonEnabled(isFull);

        this.view.updateMessage(`Hint: Letter at position ${hintIndex + 1} is "${letter}"`);

        this.hintTimeoutId = window.setTimeout(() => {
            this.view.clearMessage();
            this.hintTimeoutId = null;
        }, HINT_MESSAGE_TIMEOUT);

        const hintCount = this.model.getHintCount();
        if (hintCount >= MAX_HINT_COUNT) {
            this.view.setHintButtonEnabled(false);
        }
    }
}

export default GameController;