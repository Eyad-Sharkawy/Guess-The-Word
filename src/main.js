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
  
});