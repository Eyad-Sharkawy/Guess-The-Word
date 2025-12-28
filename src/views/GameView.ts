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

    getRowInputs(rowIndex: number) {
        if (rowIndex < 0 || rowIndex >= this.inputRows.length) {
            throw new Error(`Invalid row index ${rowIndex}`);
        }
        const row = this.inputRows[rowIndex];
        return Array.from(row.querySelectorAll<HTMLInputElement>(`.game__input-letter`));
    }

    getRowValues(rowIndex: number) {
        const inputs = this.getRowInputs(rowIndex);
        return inputs.map(input => input.value.toUpperCase());
    }

    disableRow(rowIndex: number) {
        const inputs = this.getRowInputs(rowIndex);

        inputs.forEach(input => {
            input.disabled = true;
        });
    }

    enableRow(rowIndex: number) {
        const inputs = this.getRowInputs(rowIndex);
        inputs.forEach(input => {
            input.disabled = false;
        });
    }

    setInputValue(rowIndex: number, inputIndex: number, value: string) {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].value = value;
    }

    addInputClass(rowIndex: number, inputIndex: number, className: string) {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].classList.add(className);
    }

    removeInputClass(rowIndex: number, inputIndex: number, className: string) {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].classList.remove(className);
    }

    focusInput(rowIndex: number, inputIndex: number) {
        const inputs = this.getRowInputs(rowIndex);

        if (inputIndex < 0 || inputIndex >= inputs.length) {
            throw new Error(`Invalid input index: ${inputIndex}`);
        }
        inputs[inputIndex].focus();
    }

    focusFirstEnabledInput(rowIndex: number) {
        const inputs = this.getRowInputs(rowIndex);

        for (let i = 0; i < inputs.length; ++i) {
            if (!inputs[i].disabled) {
                inputs[i].focus();
                break;
            }
        }
    }

    updateMessage(text: string) {
        this.messageElement.innerHTML = `<p>${text}</p>`;
    }

    clearMessage() {
        this.messageElement.innerHTML = ``;
    }

    setCheckButtonEnabled(enabled: boolean) {
        this.checkWordBtn.disabled = !enabled;
    }

    setHintButtonEnabled(enabled: boolean) {
        this.hintBtn.disabled = !enabled;
    }

    getCheckWordButton() {
        return this.checkWordBtn;
    }

    getRestartButton() {
        return this.restartBtn;
    }

    getHintButton() {
        return this.hintBtn;
    }

    reset() {
        for (let rowIndex = 0; rowIndex < this.getRowCount(); ++rowIndex) {
            const inputs = this.getRowInputs(rowIndex);
            inputs.forEach((input) => {
               input.value = '';
               input.disabled = rowIndex !== 0;
               input.classList.remove(
                   `game__input-letter--inplace`,
                   `game__input-letter--correct`,
                   `game__input-letter--wrong`
               );
            });
        }

        this.enableRow(0);

        this.clearMessage();

        this.setCheckButtonEnabled(false);
        this.setHintButtonEnabled(true);
    }

    getRowCount() {
        return this.inputRows.length;
    }
}

export default GameView