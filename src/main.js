import 'normalize.css'
import './style.css'

document.addEventListener("DOMContentLoaded", async () => {
  async function fetchAnswer() {
    const response = await fetch('https://random-word-api.herokuapp.com/word?length=6&number=1');
    const data = await response.json();

    return data[0].toUpperCase();
  }

  let correctAnswer;
  try {
    correctAnswer = await fetchAnswer();
    console.log(correctAnswer);
  } catch (error) {
    console.error('Failed to fetch word:', error);
    // Fallback word if API fails
    correctAnswer = 'WORDLE';
  }

  const inputRows = document.querySelectorAll(".game__inputs");
  const allInputs = document.querySelectorAll(".game__input-letter");
  const checkWordBtn = document.querySelector(".game__btn--check-word");
  const restartBtn = document.querySelector(".game__btn--restart");
  const hintBtn = document.querySelector(".game__btn--hint");
  let correctIndices = new Set();
  let currentRow = 0;

  function inputsAreFull(row) {
    const currentInputs = Array.from(row.querySelectorAll(".game__input-letter"));
    return currentInputs.every(input => input.value);
  }

  allInputs.forEach((input, index) => {
    const inputRow = input.closest('.game__inputs');
    const rowInputs = Array.from(inputRow.querySelectorAll('.game__input-letter'));
    const currentIndex = rowInputs.indexOf(input);

    input.addEventListener('input', event => {
      let value = event.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
      // Limit to one character
      if (value.length > 1) {
        value = value.charAt(0);
      }
      event.target.value = value;

      if (event.target.value && currentIndex < rowInputs.length - 1) {
        for (let i = currentIndex + 1; i < rowInputs.length; ++i) {
          if (!rowInputs[i].disabled) {
            rowInputs[i].focus();
            break;
          }
        }
      }

      // Only update button state if this is the current active row
      if (inputRow === inputRows[currentRow]) {
        checkWordBtn.disabled = !inputsAreFull(inputRow);
      }
    });

    // Handle paste events to prevent pasting multiple characters
    input.addEventListener('paste', event => {
      event.preventDefault();
      const pastedText = (event.clipboardData || window.clipboardData).getData('text');
      const firstLetter = pastedText.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase();
      if (firstLetter) {
        event.target.value = firstLetter;
        // Trigger input event to handle auto-advance
        event.target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    input.addEventListener('keydown', event => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();

        if (currentIndex > 0) {
          for (let i = currentIndex - 1; i >= 0; --i) {
            if (!rowInputs[i].disabled) {
              rowInputs[i].focus();
              break;
            }
          }
        }
      }

      if (event.key === "ArrowRight" && currentIndex < rowInputs.length - 1) {
        event.preventDefault();

        for (let i = currentIndex + 1; i < rowInputs.length; ++i) {
          if (!rowInputs[i].disabled) {
            rowInputs[i].focus();
            break;
          }
        }
      }

      if (event.key === "Backspace" && !input.value && currentIndex > 0) {
        event.preventDefault();

        for (let i = currentIndex - 1; i >= 0; --i) {
          if (!rowInputs[i].disabled) {
            rowInputs[i].focus();
            break;
          }
        }
      }

      // Enter key: move to next input if not last, otherwise let global handler submit
      if (event.key === "Enter" && input.value) {
        if (currentIndex < rowInputs.length - 1) {
          event.preventDefault();
          for (let i = currentIndex + 1; i < rowInputs.length; ++i) {
            if (!rowInputs[i].disabled) {
              rowInputs[i].focus();
              break;
            }
          }
        }
        // If on last input and row is full, let the global handler submit
      }
    });
  });

  function checkRow(row, answer) {
    const currentInputs = Array.from(row.querySelectorAll(".game__input-letter"));
    const answerArray = answer.toUpperCase().split("");

    const usedIndices = new Set();
    let rowCorrectCount = 0;

    currentInputs.forEach((input, index) => {
      if (input.value.toUpperCase() === answerArray[index]) {
        input.classList.add("game__input-letter--inplace");
        usedIndices.add(index);
        ++rowCorrectCount;
        correctIndices.add(index);
      }
    });

    currentInputs.forEach((input, index) => {
      if (usedIndices.has(index)) {
        return;
      }

      const letter = input.value.toUpperCase();
      if (!letter) {
        return;
      }

      const foundIndex = answerArray.findIndex((char, i) => !usedIndices.has(i) && char === letter);

      if (foundIndex !== -1) {
        input.classList.add("game__input-letter--correct");
        usedIndices.add(foundIndex);
      } else {
        input.classList.add("game__input-letter--wrong");
      }
    });
    
    return rowCorrectCount;
  }

  function disableRow(row) {
    const currentInputs = Array.from(row.querySelectorAll(".game__input-letter"));

    currentInputs.forEach((input) => {
      input.disabled = true;
    });
  }

  function enableRow(row) {
    const currentInputs = Array.from(row.querySelectorAll(".game__input-letter"));

    currentInputs.forEach((input) => {
      input.disabled = false;
    });
  }

  function transitionToNextStage(rowNumber, answer) {
    const rowCorrectCount = checkRow(inputRows[rowNumber], answer);
    disableRow(inputRows[rowNumber]);

    if (rowCorrectCount === 6) {
      document.querySelector(".message").innerHTML = `<p>You Won! The word was ${correctAnswer.toLowerCase()}</p>`;
      checkWordBtn.disabled = true;
      return false; // Game won, don't continue
    }
    else if (rowNumber === 5) {
      document.querySelector(".message").innerHTML = `<p>You Lost! The word was ${correctAnswer.toLowerCase()}</p>`;
      checkWordBtn.disabled = true;
      return false; // Game lost, don't continue
    }
    else {
      enableRow(inputRows[rowNumber + 1]);
      checkWordBtn.disabled = true; // Disable button for new empty row

      const currentInputs = inputRows[rowNumber + 1].querySelectorAll(".game__input-letter");
      const answerArray = correctAnswer.split("");

      for (let index of correctIndices) {
        const correctInput = currentInputs[index];
        correctInput.classList.add("game__input-letter--inplace");
        correctInput.value = answerArray[index];
        correctInput.disabled = true;
      }

      const inputInRow = inputRows[rowNumber + 1].querySelectorAll(".game__input-letter");

      for (let i = 0; i < inputInRow.length; ++i) {
        if (!inputInRow[i].disabled) {
          inputInRow[i].focus();
          break;
        }
      }
      return true; // Continue to next row
    }
  }

  checkWordBtn.addEventListener("click", _ => {
    if (transitionToNextStage(currentRow, correctAnswer)) {
      ++currentRow;
    }
  });

  restartBtn.addEventListener("click", _ => {
    location.reload();
  });

  hintBtn.addEventListener("click", _ => {
    window.alert("Coming Soon!");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (inputsAreFull(inputRows[currentRow])) {
        event.preventDefault();
        if (transitionToNextStage(currentRow, correctAnswer)) {
          ++currentRow;
        }
      }
    }
  });
});