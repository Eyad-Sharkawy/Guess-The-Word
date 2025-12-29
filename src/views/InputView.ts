/**
 * InputView - Wraps an individual input field with event handling
 * 
 * Manages input validation, event listeners, and provides a clean interface
 * for interacting with individual letter input fields.
 * 
 * @class InputView
 */
class InputView {
    private input: HTMLInputElement;
    private rowIndex: number;
    private inputIndex: number;

    /**
     * Creates a new InputView instance
     * @param input - The HTML input element to wrap
     * @param rowIndex - The row index this input belongs to
     * @param inputIndex - The index of this input within its row
     */
    constructor(input: HTMLInputElement, rowIndex: number, inputIndex: number) {
        this.input = input;
        this.rowIndex = rowIndex;
        this.inputIndex = inputIndex;
    }

    /**
     * Attaches event listeners to the input element
     * 
     * Handles input validation (only letters, uppercase), keyboard navigation,
     * and paste events for multi-letter input.
     * 
     * @param onInput - Callback for input events (rowIndex, inputIndex, value)
     * @param onKeydown - Callback for keydown events (rowIndex, inputIndex, event)
     * @param onPaste - Optional callback for paste events (rowIndex, startIndex, letters[])
     */
    attachEventListeners(
        onInput: (rowIndex: number, inputIndex: number, value: string) => void,
        onKeydown: (rowIndex: number, inputIndex: number, value: KeyboardEvent) => void,
        onPaste?: (rowIndex: number, startIndex: number, letters: string[]) => void
    ) {
        this.input.addEventListener('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) {
                return;
            }
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

        this.input.addEventListener('paste', (event) => {
            event.preventDefault();
            const pastedText = event.clipboardData?.getData('text');
            
            if (!pastedText) return;
            
            const letters = pastedText.replace(/[^a-zA-Z]/g, '').toUpperCase().split('');
            
            if (letters.length === 0) return;
            
            if (onPaste) {
                onPaste(this.rowIndex, this.inputIndex, letters);
            } else {
                const firstLetter = letters[0];
                if (firstLetter) {
                    this.input.value = firstLetter;
                    this.input.dispatchEvent(new Event('input', {bubbles: true}));
                }
            }
        });
    }

    getValue(): string {
        return this.input.value;
    }

    setValue(value: string): void {
        this.input.value = value;
    }

    focus(): void {
        this.input.focus();
    }

    disable(): void {
        this.input.disabled = true;
    }

    enable(): void {
        this.input.disabled = false;
    }

    isDisabled(): boolean {
        return this.input.disabled;
    }

    addClass(className: string): void {
        this.input.classList.add(className);
    }

    removeClass(className: string): void {
        this.input.classList.remove(className);
    }

    hasClass(className: string): boolean {
        return this.input.classList.contains(className);
    }

    getInputElement(): HTMLInputElement {
        return this.input;
    }

    getRowIndex(): number {
        return this.rowIndex;
    }

    getInputIndex(): number {
        return this.inputIndex;
    }
}

export default InputView;