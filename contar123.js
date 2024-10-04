// Axel Cotón Gutiérrez Copyright 2023

// Cargar archivos de audio desde la carpeta adecuada
const preguntaLeonesAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/audio/PreguntaLeones.mp3');
const correctoAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/audio/Correcto.mp3');
const incorrectoAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/audio/Incorrecto.mp3');
const felicidadesAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/audio/Felicidades.mp3');
const intentarAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/audio/Intentar.mp3');

// Acceder al botón de silencio y al icono del megáfono en el DOM
const soundControl = document.querySelector('#sound-control');
const megaphoneIcon = document.querySelector('#megaphone-icon');

// Variable de control para determinar si el juego ha terminado
let gameOver = false;

// Función para reproducir audio si el sonido está activado
function playAudio(audioElement) {
  if (soundControl.checked) {
    audioElement.play();
  }
}

// Evento clic para el icono del megáfono para reproducir la pregunta en audio
megaphoneIcon.addEventListener('click', () => playAudio(preguntaLeonesAudio));

// Generar imágenes aleatorias
const images = [
  "https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/img/leon.png",
  "https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/img/leon.png",
  "https://raw.githubusercontent.com/AxelCotonGutierrez/Contarhasta3leones/master/img/leon.png"
];

let score = 0; // Contador de respuestas correctas
let questionsCount = 0; // Contador de preguntas realizadas
let previousNumImages = -1; // Variable para almacenar el número de imágenes de la pregunta anterior

// Función para restablecer los resultados y mensajes del juego anterior
function resetGame() {
  const scoreElement = document.querySelector("#score");
  const resultElement = document.querySelector("#result");

  scoreElement.textContent = "";
  resultElement.textContent = "";
  scoreElement.style.color = "initial";
  resultElement.style.color = "initial";
}

// Función para incrementar el contador del juego en Firebase
function incrementarContadorFirebase() {
  const ruta = "Infantil/Matemáticas/Contar/3";  // Ruta definida para la categoría y tema
  const juegoId = "leones";  // Identificador del juego
  
  const contadorRef = firebase.database().ref(`${ruta}/${juegoId}/contador`);
  contadorRef.transaction(function(contador) {
    return (contador || 0) + 1;
  });
}

// Función para mostrar el contador actual en la página para "leones"
function mostrarContador() {
  const ruta = "Infantil/Matemáticas/Contar/3";  // Ruta definida para la categoría y tema
  const juegoId = "leones";  // Identificador del juego

  const contadorRef = firebase.database().ref(`${ruta}/${juegoId}/contador`);
  contadorRef.on('value', (snapshot) => {
    const contador = snapshot.val();
    document.getElementById('contador').innerText = `Han jugado ${contador || 0} veces.`;
  });
}

// Mostrar el contador al cargar la página
mostrarContador();

function generateQuestion() {
  if (gameOver) return; // Si el juego ha terminado, no generar más preguntas
  
  resetGame(); // Restablecer resultados y mensajes del juego anterior

  // Verificar si se han realizado las 5 preguntas
  if (questionsCount >= 5) {
    const scoreElement = document.querySelector("#score");
    scoreElement.textContent = `\u00A1Fin!`;

    if (score === 5) {
      scoreElement.textContent += ` \u00A1Felicidades, lo has conseguido!`;
      scoreElement.style.color = "green";
      playAudio(felicidadesAudio);
    } else {
      scoreElement.textContent += ` \u00A1Vuelve a intentarlo!`;
      scoreElement.style.color = "red";
      playAudio(intentarAudio);
    }

    // Incrementar el contador en Firebase
    incrementarContadorFirebase();  

    // Mostrar botón "Volver a jugar"
    const playAgainButton = document.querySelector("#play-again-button");
    playAgainButton.style.display = "block";

    // Marcar el juego como terminado
    gameOver = true;

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
    const image = document.createElement("img");
    image.src = images[randomIndex];
    image.alt = "Imagen";
    image.classList.add("game-image"); // Agregar la clase "game-image" a las imágenes
    chosenImages.push(image);
  }

  // Mostrar imágenes en el HTML
  const imageContainer = document.querySelector("#image-container");
  imageContainer.innerHTML = ""; // Limpiar el contenedor de imágenes

  chosenImages.forEach((image) => {
    imageContainer.appendChild(image);
  });

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
  if (gameOver) return; // Si el juego ha terminado, no manejar más respuestas
  
  const guess = parseInt(event.target.textContent);
  const resultElement = document.querySelector("#result");
  questionsCount++;

  const numImages = document.querySelectorAll("#image-container img").length;

  if (guess === numImages) {
    score++;
    resultElement.textContent = "\u00A1Correcto!";
    resultElement.style.color = "green";
    playAudio(correctoAudio);
  } else {
    resultElement.textContent = `Incorrecto, había ${numImages} imágenes.`;
    resultElement.style.color = "red";
    playAudio(incorrectoAudio);
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

  // Marcar el juego como no terminado
  gameOver = false;

  // Ocultar botón "Volver a jugar"
  const playAgainButton = document.querySelector("#play-again-button");
  playAgainButton.style.display = "none";

  // Reiniciar el juego
  generateQuestion();
}

// Llamar a la función para iniciar el juego
generateQuestion();

// Agregar evento clic al botón "Volver a jugar"
const playAgainButton = document.querySelector("#play-again-button");
playAgainButton.addEventListener("click", restartGame);
