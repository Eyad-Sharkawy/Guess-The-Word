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
  let currentRow = 0;

  function inputsAreFull(row) {
    const currentInputs = Array.from(row.querySelectorAll(".game__input-letter"));
    return currentInputs.every(input => input.value);
  }

  allInputs.forEach((input, index) => {
    const currentRow = input.closest('.game__inputs');

    input.addEventListener('input', event => {
      event.target.value = event.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();

      const nextInput = allInputs[index + 1];

      if (event.target.value && index < allInputs.length - 1) {
        if (!nextInput.disabled) nextInput.focus();
      }

      if (inputsAreFull(currentRow)) {
        checkWordBtn.disabled = false;
      }

      if (!inputsAreFull(currentRow)) {
        checkWordBtn.disabled = true;
      }
    });

    input.addEventListener('keydown', event => {
      const rowInputs = Array.from(currentRow.querySelectorAll('.game__input-letter'));
      const currentIndex = rowInputs.indexOf(input);
      const rowIndex = Array.from(inputRows).indexOf(currentRow);

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault();
        rowInputs[currentIndex - 1].focus();
      }

      if (event.key === "ArrowRight" && currentIndex < rowInputs.length - 1) {
        event.preventDefault();
        rowInputs[currentIndex + 1].focus();
      }

      if (event.key === "Backspace" && !input.value && currentIndex > 0) {
        event.preventDefault();
        rowInputs[currentIndex - 1].focus();
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


});