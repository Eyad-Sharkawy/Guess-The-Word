import GameModel from "../models/GameModel.ts";
import GameView from "../views/GameView.ts";
import InputView from "../views/InputView.ts";
import Direction from "./Direction.ts";

class GameController {
    private readonly model: GameModel;
    private readonly view: GameView;
    private inputViews: InputView[][] = [];

    constructor(model: GameModel, view: GameView) {
        this.model = model;
        this.view = view;
    }

    async init() {
        try {
            const answer = await this.model.fetchAnswer();
            this.model.setAnswer(answer);
            console.log(`Answer: ${answer}`);
        }
        catch (error) {
            console.error(`Failed to fetch word`, error)
            this.model.setAnswer("WORDLE");
        }

        this.initializeInputViews();

        this.setupEventListeners();

        this.start();
    }

    start() {
        this.view.enableRow(0);
    }

    private initializeInputViews() {
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
                );
                rowInputViews.push(inputView);
            });

            this.inputViews.push(rowInputViews);
        }
    }

    private setupEventListeners() {
        this.view.getCheckWordButton().addEventListener('click', () => {
            this.handleCheckWord();
        });

        this.view.getRestartButton().addEventListener('click', () => {
            this.handleRestart();
        });

        this.view.getHintButton().addEventListener('click', () => {
            this.handleHint();
        });

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                this.handleEnterKey();
            }
        });
    }

    private handleInputChange(rowIndex: number, inputIndex: number, value: string) {
        const currentRow = this.model.getCurrentRow();

        if (rowIndex !== currentRow) return;


        if (value && inputIndex < this.inputViews[rowIndex].length - 1) {
            this.moveToNextInput(rowIndex, inputIndex, Direction.FORWARD);
        }

        const rowValues = this.view.getRowValues(currentRow);
        const isFull = this.model.isRowFull(rowValues);
        this.view.setCheckButtonEnabled(isFull);
    }

    private handleKeydown(rowIndex: number, inputIndex: number, event: KeyboardEvent) {
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
            const currentValue = this.inputViews[rowIndex][inputIndex].getValue();
            if (currentValue && inputIndex < this.inputViews[rowIndex].length - 1) {
                event.preventDefault();
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

        const results = this.model.checkRow(guess);

        results.forEach((result, index) => {
            const className = `game__input-letter--${result.state}`;
            this.view.addInputClass(currentRow, index, className);
        });

        this.view.disableRow(currentRow);

        if (this.model.isGameWon(guess)) {
            const answer = this.model.getCorrectAnswer();
            this.view.updateMessage(`You Won! The word was ${answer.toLowerCase()}`);
            this.view.setCheckButtonEnabled(false);
            return;
        }

        if (this.model.isGameLost()) {
            const answer = this.model.getCorrectAnswer();
            this.view.updateMessage(`You Lost! The word was ${answer.toLowerCase()}`);
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
        const correctIndices = this.model.getCorrectIndices();
        const answer = this.model.getCorrectAnswer();
        const answerArray = answer.split('');

        correctIndices.forEach((index) => {
            this.view.setInputValue(nextRow, index, answerArray[index]);

            this.view.addInputClass(nextRow, index, 'game__input-letter--inplace');

            const inputs = this.view.getRowInputs(nextRow);
            inputs[index].disabled = true;
        });
    }

    private moveToNextInput(
        rowIndex: number,
        currentIndex: number,
        direction: typeof Direction[keyof typeof Direction]
    ): void {
        const inputs = this.inputViews[rowIndex];
        const startIndex = direction === Direction.FORWARD ? currentIndex + 1 : currentIndex - 1;
        const endIndex = direction === Direction.FORWARD ? inputs.length : -1;
        const step = direction === Direction.FORWARD ? 1 : -1;

        for (let i = startIndex; i !== endIndex; i += step) {
            if (!inputs[i].isDisabled()) {
                inputs[i].focus();
                break;
            }
        }
    }

    private handleRestart(): void {
        this.model.reset();

        this.view.reset();

        this.init();
    }

    private handleHint(): void {
        window.alert('Coming Soon!');
    }
}

export default GameController;