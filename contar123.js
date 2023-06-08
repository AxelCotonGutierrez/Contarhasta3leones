// Generar imágenes aleatorias
const images = ["img/leon.png", "img/leon.png", "img/leon.png"]; // Aquí especificas la ruta de la imagen

let score = 0; // Contador de respuestas correctas
let questionsCount = 0; // Contador de preguntas realizadas
let previousNumImages = -1; // Variable para almacenar el número de imágenes de la pregunta anterior

function generateQuestion() {
  // Verificar si se han realizado las 5 preguntas
  if (questionsCount >= 5) {
    const scoreElement = document.querySelector("#score");
    scoreElement.textContent = `¡Fin!`;

    if (score === 5) {
      scoreElement.textContent += ` ¡Felicidades, eres un/a campeón/a!`;
      scoreElement.style.color="green";
    } else {
      scoreElement.textContent += ` ¡Vuelve a intentarlo!`;
      scoreElement.style.color="red";
    }

    // Mostrar botón "Volver a jugar"
    const playAgainButton = document.querySelector("#play-again-button");
    playAgainButton.style.display = "block";
    playAgainButton.addEventListener("click", restartGame);

    return;
  }

  let numImages = generateRandomNumImages();

  while (numImages === previousNumImages) {
    numImages = generateRandomNumImages();
  }

  previousNumImages = numImages;

  // Generar imágenes aleatorias para la pregunta actual
  const chosenImages = [];

  for (let i = 0; i < numImages; i++) {
    const randomIndex = Math.floor(Math.random() * images.length);
    chosenImages.push(images[randomIndex]);
  }

  // Mostrar imágenes en el HTML
  const imageContainer = document.querySelector("#image-container");
  const imageElements = chosenImages.map(
    (image) => `<img src="${image}" alt="Imagen">`
  );
  imageContainer.innerHTML = imageElements.join("");

  // Pedir al jugador que adivine
  const guessButtons = document.querySelectorAll(".guess-button");

  // Eliminar eventos click anteriores
  guessButtons.forEach((button) => {
    button.removeEventListener("click", handleGuess);
  });

  // Asignar eventos click nuevos
  guessButtons.forEach((button) => {
    button.addEventListener("click", handleGuess);
  });
}

function generateRandomNumImages() {
  return Math.floor(Math.random() * 3) + 1;
}

function handleGuess(event) {
  const guess = parseInt(event.target.textContent);
  const resultElement = document.querySelector("#result");
  questionsCount++;

  const numImages = document.querySelectorAll("#image-container img").length;

  if (guess === numImages) {
    score++;
    resultElement.textContent = "¡Correcto!";
    resultElement.style.color="green";
  } else {
    resultElement.textContent = `Incorrecto, había ${numImages} imágenes.`;
    resultElement.style.color="red";
  }

  // Actualizar puntaje y generar la siguiente pregunta
  const scoreElement = document.querySelector("#score");
  scoreElement.textContent = ` ${score} respuestas correctas de ${questionsCount}`;

  setTimeout(generateQuestion, 1000);
}

function restartGame() {
  // Restablecer variables de juego
  score = 0;
  questionsCount = 0;
  previousNumImages = -1;

  // Ocultar botón "Volver a jugar"
  const playAgainButton = document.querySelector("#play-again-button");
  playAgainButton.style.display = "none";
  playAgainButton.removeEventListener("click", restartGame);


  // Reiniciar el juego
  generateQuestion();
}

// Llamar a la función para iniciar el juego
generateQuestion();
