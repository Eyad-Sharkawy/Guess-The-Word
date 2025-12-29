import { CSS_CLASSES } from '../constants/CssClasses';

/**
 * GameView - Manages the main game UI and DOM interactions
 * 
 * Handles input rows, buttons, messages, and visual feedback.
 * Follows the MVC pattern as the View component.
 * 
 * @class GameView
 */
class GameView {
    private readonly inputRows: NodeListOf<HTMLElement>;
    private readonly checkWordBtn: HTMLButtonElement;
    private readonly restartBtn: HTMLButtonElement;
    private readonly hintBtn: HTMLButtonElement;
    private readonly messageElement: HTMLElement;

    constructor() {
        this.inputRows = document.querySelectorAll<HTMLElement>('.game__inputs');

        if (!this.inputRows.length) {
            throw new Error('Game input rows not found');
        }

        const checkBtn = document.querySelector<HTMLButtonElement>(`.game__btn--check-word`);

        if (!checkBtn) {
            throw new Error(`Check word button not found`);
        }
        this.checkWordBtn = checkBtn;

        const restartBtn = document.querySelector<HTMLButtonElement>(`.game__btn--restart`);

        if (!restartBtn) {
            throw new Error(`Restart button not found`);
        }
        this.restartBtn = restartBtn;

        const hintBtn = document.querySelector<HTMLButtonElement>(`.game__btn--hint`);

        if (!hintBtn) {
            throw new Error(`Hint button not found`);
        }
        this.hintBtn = hintBtn;

        const messageEl = document.querySelector<HTMLElement>(`.message`);

        if (!messageEl) {
            throw new Error(`Message element was not found`);
        }
        this.messageElement = messageEl;
    }

    getRowInputs(rowIndex: number): HTMLInputElement[] {
        if (rowIndex < 0 || rowIndex >= this.inputRows.length) {
            throw new Error(`Invalid row index ${rowIndex}`);
        }
        const row = this.inputRows[rowIndex];
        return Array.from(row.querySelectorAll<HTMLInputElement>(`.game__input-letter`));
    }

    getRowValues(rowIndex: number): string[] {
        const inputs = this.getRowInputs(rowIndex);
        return inputs.map(input => input.value.toUpperCase());
    }

    disableRow(rowIndex: number): void {
        const inputs = this.getRowInputs(rowIndex);

        inputs.forEach(input => {
            input.disabled = true;
        });
    }

    enableRow(rowIndex: number): void {
        const inputs = this.getRowInputs(rowIndex);
        inputs.forEach(input => {
            input.disabled = false;
        });
    }

    setInputValue(rowIndex: number, inputIndex: number, value: string): void {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].value = value;
    }

    addInputClass(rowIndex: number, inputIndex: number, className: string): void {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].classList.add(className);
    }

    removeInputClass(rowIndex: number, inputIndex: number, className: string): void {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].classList.remove(className);
    }

    focusInput(rowIndex: number, inputIndex: number): void {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].focus();
    }

    focusFirstEnabledInput(rowIndex: number): void {
        const inputs = this.getRowInputs(rowIndex);

        for (let i = 0; i < inputs.length; ++i) {
            if (!inputs[i].disabled) {
                inputs[i].focus();
                break;
            }
        }
    }

    updateMessage(text: string): void {
        const p = document.createElement('p');
        p.textContent = text;
        this.messageElement.innerHTML = '';
        this.messageElement.appendChild(p);
    }

    clearMessage(): void {
        this.messageElement.innerHTML = ``;
    }

    setCheckButtonEnabled(enabled: boolean): void {
        this.checkWordBtn.disabled = !enabled;
    }

    setHintButtonEnabled(enabled: boolean): void {
        this.hintBtn.disabled = !enabled;
    }

    getCheckWordButton(): HTMLButtonElement {
        return this.checkWordBtn;
    }

    getRestartButton(): HTMLButtonElement {
        return this.restartBtn;
    }

    getHintButton(): HTMLButtonElement {
        return this.hintBtn;
    }

    reset(): void {
        for (let rowIndex = 0; rowIndex < this.getRowCount(); ++rowIndex) {
            const inputs = this.getRowInputs(rowIndex);
            inputs.forEach((input) => {
               input.value = '';
               input.disabled = rowIndex !== 0;
               input.classList.remove(
                   CSS_CLASSES.INPUT_IN_PLACE,
                   CSS_CLASSES.INPUT_CORRECT,
                   CSS_CLASSES.INPUT_WRONG
               );
            });
        }

        this.enableRow(0);

        this.clearMessage();

        this.setCheckButtonEnabled(false);
        this.setHintButtonEnabled(true);
    }

    getRowCount(): number {
        return this.inputRows.length;
    }
}

export default GameView