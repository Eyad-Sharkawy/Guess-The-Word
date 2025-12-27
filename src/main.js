import 'normalize.css'
import './style.css'

document.addEventListener("DOMContentLoaded", async () => {
  async function fetchAnswer() {
    const response = await fetch('https://random-word-api.herokuapp.com/word?length=6&number=1');
    const data = await response.json();

    return data[0].toUpperCase();
  }

  let correctAnswer = await fetchAnswer();
  console.log(correctAnswer);

  const inputRows = document.querySelectorAll(".game__inputs");
  const allInputs = document.querySelectorAll(".game__input-letter");
  const checkWordBtn = document.querySelector(".game__btn--check-word");
  const restartBtn = document.querySelector(".game__btn--restart");
  let correctCount = 0;
  let correctIndices = new Set();
  let currentRow = 0;

  function inputsAreFull(row) {
    const currentInputs = Array.from(row.querySelectorAll(".game__input-letter"));
    return currentInputs.every(input => input.value);
  }

  allInputs.forEach((input, index) => {
    const currentRow = input.closest('.game__inputs');
    const rowInputs = Array.from(currentRow.querySelectorAll('.game__input-letter'));
    const currentIndex = rowInputs.indexOf(input);

    input.addEventListener('input', event => {
      if (event.target.value) event.preventDefault();

      if (!event.target.value) {
        event.target.value = event.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
      }

      if (event.target.value && index < allInputs.length - 1) {
        for (let i = currentIndex + 1; i < rowInputs.length; ++i) {
          if (!rowInputs[i].disabled) {
            rowInputs[i].focus();
            break;
          }
        }
      }

      if (inputsAreFull(currentRow)) {
        checkWordBtn.disabled = false;
      }

      if (!inputsAreFull(currentRow)) {
        checkWordBtn.disabled = true;
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

      if (event.key === "Enter" && input.value && currentIndex < rowInputs.length - 1) {
        event.preventDefault();

        for (let i = currentIndex + 1; i < rowInputs.length; ++i) {
          if (!rowInputs[i].disabled) {
            rowInputs[i].focus();
            break;
          }
        }
      }
    });
  });

  function checkRow(row, answer) {
    const currentInputs = Array.from(row.querySelectorAll(".game__input-letter"));
    const answerArray = answer.toUpperCase().split("");

    const usedIndices = new Set();

    currentInputs.forEach((input, index) => {
      if (input.value.toUpperCase() === answerArray[index]) {
        input.classList.add("game__input-letter--inplace");
        usedIndices.add(index);
        ++correctCount;
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
    checkRow(inputRows[rowNumber], answer);
    disableRow(inputRows[rowNumber]);

    if (correctCount === 6) {
      document.querySelector(".message").innerHTML = `<p>You Won! The word was ${correctAnswer.toLowerCase()}</p>`;
    }
    else if (rowNumber === 5) {
      document.querySelector(".message").innerHTML = `<p>You Lost! The word was ${correctAnswer.toLowerCase()}</p>`;
    }
    else {
      enableRow(inputRows[rowNumber + 1]);

      const currentInputs = inputRows[rowNumber + 1].querySelectorAll(".game__input-letter");
      const answerArray = correctAnswer.split("");

      for (let index of correctIndices) {
        const correctInput = currentInputs[index];
        correctInput.classList.add("game__input-letter--inplace");
        correctInput.value = answerArray[index];
        correctInput.disabled = true;
      }

      const inputInRow = inputRows[rowNumber + 1].querySelectorAll(".game__input-letter");

      for (let i = 0; i < 6; ++i) {
        if (!inputInRow[i].disabled) {
          inputInRow[i].focus();
          break;
        }
      }
    }
  }

  checkWordBtn.addEventListener("click", _ => {
    transitionToNextStage(currentRow, correctAnswer);
    ++currentRow;
  });

  restartBtn.addEventListener("click", _ => {
    location.reload();
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (inputsAreFull(inputRows[currentRow])) {
        event.preventDefault();
        transitionToNextStage(currentRow, correctAnswer);
        ++currentRow;
      }
    }
  });
});