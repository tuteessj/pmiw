// mateo garcia  tp1 escena con sprittes
//click izq pegas y con R reinicias 
const ANCHO = 800;
const ALTO = 600;

const CELDA = 64;
const ESCALA = 3;

// ESTADOS DE LA ESCENA

const CAMINANDO_ENTRADA = 0;
const CORRIENDO = 1;
const QUIETO = 2;
const CAMINANDO_SALIDA = 3;
const FINAL = 4;

let estadoEscena = CAMINANDO_ENTRADA;

// ESTADOS DEL SPRITESHEET

const IDLE = 0;
const WALK = 1;
const RUN = 2;
const ATTACK = 4;

// CONFIGURACIÓN DEL SPRITESHEET

let fila = [];

fila[IDLE] = 0;
fila[WALK] = 1;
fila[RUN] = 2;
fila[ATTACK] = 4;

let cantidadFrames = [];

cantidadFrames[IDLE] = 4;
cantidadFrames[WALK] = 6;
cantidadFrames[RUN] = 6;
cantidadFrames[ATTACK] = 5;

// Velocidad de cada animación

let velocidadFrames = [];

velocidadFrames[IDLE] = 170;
velocidadFrames[WALK] = 120;
velocidadFrames[RUN] = 75;
velocidadFrames[ATTACK] = 70;

// FONDO

let archivosFondo = [
  "capa1_cielo.png",
  "capa2_nubes.png",
  "capa3_montanas.png",
  "capa4_colinas.png",
  "capa5_suelo.png",
  "capa6_frente.png"
];

// Parallax

let factorCapa = [
  0.0,
  0.06,
  0.15,
  0.40,
  1.0,
  1.70
];

// VARIABLES

let hoja;
let animaciones = [];
let fondo = [];

let frameActual = 0;
let tiempoFrame = 0;
let tiempoAnterior = 0;

let personajeX = -120;
let personajeY = 370;

let direccion = 1;

let desplazamiento = 0;
let desplazamientoNubes = 0;

// CONTROL DE TIEMPO

// 15 segundos corriendo
const DURACION_CARRERA = 15000;

// 5 segundos detenido
const DURACION_PAUSA = 5000;

let inicioCarrera = 0;
let inicioPausa = 0;

// CONTROL DEL ATAQUE

let ataqueActivo = false;

// Se habilita al comenzar la escena
// y se deshabilita cuando empieza a volver
let ataquesHabilitados = true;

// CANVAS

let lienzo;

// PRELOAD

function preload() {
  hoja = loadImage("personaje.png");

  for (let i = 0; i < archivosFondo.length; i++) {
    fondo[i] = loadImage(archivosFondo[i]);
  }
}

// SETUP

function setup() {
  lienzo = createCanvas(ANCHO, ALTO);

  noSmooth();

  // Crear arrays de frames
  animaciones[IDLE] = recortarFila(
    hoja,
    fila[IDLE],
    cantidadFrames[IDLE],
    CELDA,
    CELDA
  );

  animaciones[WALK] = recortarFila(
    hoja,
    fila[WALK],
    cantidadFrames[WALK],
    CELDA,
    CELDA
  );

  animaciones[RUN] = recortarFila(
    hoja,
    fila[RUN],
    cantidadFrames[RUN],
    CELDA,
    CELDA
  );

  animaciones[ATTACK] = recortarFila(
    hoja,
    fila[ATTACK],
    cantidadFrames[ATTACK],
    CELDA,
    CELDA
  );

  tiempoAnterior = millis();

 
  lienzo.canvas.addEventListener(
    "contextmenu",
    function(event) {
      event.preventDefault();
    }
  );
}

// RECORTAR FILA DEL SPRITESHEET
// FUNCIÓN CON PARÁMETROS QUE RETORNA UN VALOR

function recortarFila(
  imagen,
  filaSprite,
  cantidad,
  ancho,
  alto
) {
  let frames = [];

  // FOR
  for (let i = 0; i < cantidad; i++) {
    frames[i] = imagen.get(
      i * ancho,
      filaSprite * alto,
      ancho,
      alto
    );
  }

  return frames;
}

// FUNCIÓN QUE RETORNA UN VALOR

function obtenerAnimacionActual() {
  // El ataque tiene prioridad
  if (ataqueActivo) {
    return ATTACK;
  }

  if (
    estadoEscena === CAMINANDO_ENTRADA ||
    estadoEscena === CAMINANDO_SALIDA
  ) {
    return WALK;
  }

  if (
    estadoEscena === CORRIENDO
  ) {
    return RUN;
  }

  if (
    estadoEscena === QUIETO ||
    estadoEscena === FINAL
  ) {
    return IDLE;
  }

  return IDLE;
}

// ACTUALIZAR ANIMACIÓN

function actualizarAnimacion(deltaTime) {
  let animacion =
    obtenerAnimacionActual();

  tiempoFrame += deltaTime;

  if (
    tiempoFrame >=
    velocidadFrames[animacion]
  ) {
    tiempoFrame -=
      velocidadFrames[animacion];

    frameActual++;

    // ATTACK
    if (animacion === ATTACK) {
      // Mostrar los 5 frames
      if (
        frameActual >=
        cantidadFrames[ATTACK]
      ) {
        // El ataque terminó
        ataqueActivo = false;

        // Reiniciar la animación
        frameActual = 0;

        tiempoFrame = 0;
      }
    }

    // WALK / RUN / IDLE
    else {
      if (
        frameActual >=
        cantidadFrames[animacion]
      ) {
        frameActual = 0;
      }
    }
  }
}

// DIBUJAR ANIMACIÓN
// FUNCIÓN REUTILIZABLE CON PARÁMETROS

function dibujarAnimacion(
  frames,
  indice,
  x,
  y,
  escala,
  direccion
) {
  let indiceSeguro =
    constrain(
      indice,
      0,
      frames.length - 1
    );

  let frame =
    frames[indiceSeguro];

  push();

  translate(
    x,
    y
  );

  // Dar vuelta al personaje
  scale(
    direccion,
    1
  );

  image(
    frame,
    -frame.width * escala / 2,
    0,
    frame.width * escala,
    frame.height * escala
  );

  pop();
}

// DIBUJAR PARALLAX

function dibujarParallax() {
  // CIELO
  image(
    fondo[0],
    0,
    0,
    ANCHO,
    ALTO
  );

  // NUBES
  let xNubes =
    -(desplazamientoNubes *
      factorCapa[1]) % ANCHO;

  if (xNubes > 0) {
    xNubes -= ANCHO;
  }

  image(
    fondo[1],
    xNubes,
    0,
    ANCHO,
    ALTO
  );

  image(
    fondo[1],
    xNubes + ANCHO,
    0,
    ANCHO,
    ALTO
  );

  // RESTO DE LAS CAPAS
  for (
    let i = 2;
    i < fondo.length;
    i++
  ) {
    let x =
      -(desplazamiento *
        factorCapa[i]) % ANCHO;

    if (x > 0) {
      x -= ANCHO;
    }

    image(
      fondo[i],
      x,
      0,
      ANCHO,
      ALTO
    );

    image(
      fondo[i],
      x + ANCHO,
      0,
      ANCHO,
      ALTO
    );
  }
}

// ACTUALIZAR ESCENA

function actualizarEscena(deltaTime) {
  // Nubes siempre muy lentas
  desplazamientoNubes +=
    0.02 * deltaTime;

  // CAMINANDO DESDE LA IZQUIERDA
  if (
    estadoEscena ===
    CAMINANDO_ENTRADA
  ) {
    direccion = 1;

    personajeX +=
      0.12 * deltaTime;

    // Llegó al centro
    if (
      personajeX >=
      ANCHO / 2
    ) {
      personajeX =
        ANCHO / 2;

      estadoEscena =
        CORRIENDO;

      inicioCarrera =
        millis();

      frameActual = 0;
      tiempoFrame = 0;
    }
  }

  // CORRER
  else if (
    estadoEscena ===
    CORRIENDO
  ) {
    direccion = 1;

    // Mantener al personaje en el centro
    personajeX =
      ANCHO / 2;

    // Mover el escenario hacia la izquierda
    desplazamiento +=
      0.24 * deltaTime;

    // Tiempo corriendo
    let tiempoCorriendo =
      millis() - inicioCarrera;

    // Pasaron 15 segundos
    if (
      tiempoCorriendo >=
      DURACION_CARRERA
    ) {
      estadoEscena =
        QUIETO;

      inicioPausa =
        millis();

      frameActual = 0;
      tiempoFrame = 0;
    }
  }

  // QUIETO
  else if (
    estadoEscena ===
    QUIETO
  ) {
    // Queda en el centro
    personajeX =
      ANCHO / 2;

    // Mira hacia la derecha
    direccion = 1;

    let tiempoQuieto =
      millis() - inicioPausa;

    // Después de 5 segundos
    if (
      tiempoQuieto >=
      DURACION_PAUSA
    ) {
      // Deshabilitar espadazos
      ataquesHabilitados =
        false;

      // Empezar la salida
      estadoEscena =
        CAMINANDO_SALIDA;

      // Girar hacia la izquierda
      direccion = -1;

      frameActual = 0;
      tiempoFrame = 0;
    }
  }

  // VOLVER CAMINANDO HACIA LA IZQUIERDA
  else if (
    estadoEscena ===
    CAMINANDO_SALIDA
  ) {
    direccion = -1;

    // Caminar hacia la izquierda
    personajeX -=
      0.12 * deltaTime;

    // El fondo acompaña el regreso
    desplazamiento -=
      0.12 * deltaTime;

    // Sale completamente
    if (
      personajeX < -150
    ) {
      estadoEscena =
        FINAL;

      frameActual = 0;
      tiempoFrame = 0;
    }
  }

  // FINAL
  else if (
    estadoEscena === FINAL
  ) {
    // La escena queda terminada
  }
}

// REINICIAR

function reiniciar() {
  estadoEscena =
    CAMINANDO_ENTRADA;

  frameActual = 0;
  tiempoFrame = 0;

  personajeX = -120;
  personajeY = 370;

  direccion = 1;

  desplazamiento = 0;
  desplazamientoNubes = 0;

  inicioCarrera = 0;
  inicioPausa = 0;

  ataqueActivo = false;

  // Volver a habilitar los ataques
  ataquesHabilitados = true;

  tiempoAnterior = millis();
}

// DRAW

function draw() {
  let tiempoActual =
    millis();

  let deltaTime =
    tiempoActual -
    tiempoAnterior;

  tiempoAnterior =
    tiempoActual;

  // Evitar saltos grandes
  if (deltaTime > 50) {
    deltaTime = 50;
  }

  // ACTUALIZAR
  actualizarEscena(
    deltaTime
  );

  actualizarAnimacion(
    deltaTime
  );

  // DIBUJAR
  background(
    20,
    18,
    34
  );

  dibujarParallax();

  // DIBUJAR PERSONAJE
  let animacion =
    obtenerAnimacionActual();

  dibujarAnimacion(
    animaciones[animacion],
    frameActual,
    personajeX,
    personajeY,
    ESCALA,
    direccion
  );
}

// CLIC DEL MOUSE

function mousePressed() {
  // CLIC IZQUIERDO = ESPADAZO
  if (
    mouseButton === LEFT
  ) {
    // Solo mientras estén habilitados
    if (
      ataquesHabilitados &&
      !ataqueActivo &&
      estadoEscena !== FINAL
    ) {
      // Activar ataque
      ataqueActivo = true;

      // Empezar desde el primer frame
      frameActual = 0;

      tiempoFrame = 0;
    }

    return false;
  }
}

// TECLADO

function keyPressed() {
  // R = reiniciar
  if (
    key === "r" ||
    key === "R"
  ) {
    reiniciar();
  }
}
