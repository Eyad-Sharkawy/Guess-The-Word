class InputView {
    private input: HTMLInputElement;
    private rowIndex: number;
    private inputIndex: number;

    constructor(input: HTMLInputElement, rowIndex: number, inputIndex: number) {
        this.input = input;
        this.rowIndex = rowIndex;
        this.inputIndex = inputIndex;
    }

    attatchEventListeners(
        onInput: (rowIndex: number, inputIndex: number, value: string) => void,
        onKeydown: (rowIndex: number, inputIndex: number, value: KeyboardEvent) => void,
        onPaste: (rowIndex: number, inputIndex: number, event: ClipboardEvent) => void
    ) {
        this.input.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            let value = target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();

            if (value.length > 1) {
                value = value.charAt(0);
            }
            target.value = value;

            onInput(this.rowIndex, this.inputIndex, value);
        });

        this.input.addEventListener('keydown', (event) => {
            onKeydown(this.rowIndex, this.inputIndex, event);
        });

        this.input.addEventListener('paste' ,(event) => {
            event.preventDefault();
            const pastedText = event.clipboardData?.getData('text');
            const firstLetter = pastedText?.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase();

            if (firstLetter) {
                this.input.value = firstLetter;
                this.input.dispatchEvent(new Event('input', {bubbles: true}));
            }
            onPaste(this.rowIndex, this.inputIndex, event);

        });
    }

    getValue() {
        return this.input.value;
    }

    setValue(value: string) {
        this.input.value = value;
    }

    focus() {
        this.input.focus();
    }

    disable() {
        this.input.disabled = true;
    }

    enable() {
        this.input.disabled = false;
    }

    isDisabled() {
        return this.input.disabled;
    }

    addClass(className: string) {
        this.input.classList.add(className);
    }

    removeClass(className: string) {
        this.input.classList.remove(className);
    }

    hasClass(className: string) {
        return this.input.classList.contains(className);
    }

    getInputElement(): HTMLInputElement {
        return this.input;
    }

    getRowIndex() {
        return this.rowIndex;
    }

    getInputIndex() {
        return this.inputIndex;
    }
}

export default InputView;