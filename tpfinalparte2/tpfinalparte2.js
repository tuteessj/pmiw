//tp final parte 2 garcia mateo nicolas com3 
// video link https://youtu.be/8GctvdEG3NM

let game;
let imgEscudoFacu;
let imgTexturaAsfalto;
let imgIconoPS2;

// sonidos del juego
let sonidoInicio;
let sonidoPasoCaminar;
let sonidoPasoCorrer;
let sonidoSinEstamina;
let sonidoBocinaAuto;
let sonidoBocinaColectivo;
let sonidoChoque;
let sonidoVictoria;

function preload() {
  imgEscudoFacu = loadImage('assets/escudo_facu.png');
  imgTexturaAsfalto = loadImage('assets/asfalto.png');
  imgIconoPS2 = loadImage('assets/memory_card.png');

  sonidoInicio = loadSound('assets/inicio_ps2.mp3');
  sonidoPasoCaminar = loadSound('assets/paso_caminar.mp3');
  sonidoPasoCorrer = loadSound('assets/paso_correr.mp3');
  sonidoSinEstamina = loadSound('assets/sin_estamina.mp3');
  sonidoBocinaAuto = loadSound('assets/bocina_auto.mp3');
  sonidoBocinaColectivo = loadSound('assets/bocina_colectivo.mp3');
  sonidoChoque = loadSound('assets/choque.mp3');
  sonidoVictoria = loadSound('assets/victoria.mp3');
}

function setup() {
  createCanvas(800, 400);
  game = new Game();
}

function draw() {
  game.update();
  game.display();
}

function mousePressed() {
  game.handleMousePressed(mouseX, mouseY);
}

function keyPressed() {
  game.handleKeyPressed(key, keyCode);
}


// clse 1, GAME (CONTROLADOR PRINCIPAL, ESTADOS, PANTALLAS Y COLISIONES)


class Game {
  constructor() {
    this.grid = 40;
    this.finishRow = 30;
    this.state = "INICIO"; // INICIO, INSTRUCCIONES, CREDITOS, JUGANDO, GANASTE, PERDISTE

    this.sound = new SoundEngine();
    this.player = new Player(this.grid, this.finishRow);
    this.previewPlayer = new Player(this.grid, this.finishRow);
    this.previewPlayer.animState = "WALK";

    this.lanes = [];
    this.ps2Towers = [];

    this.initPS2Towers();
    this.resetLevel();
  }

  initPS2Towers() {
    this.ps2Towers = [];
    for (let i = 0; i < 24; i++) {
      this.ps2Towers.push( {
      x:
        random(15, width - 35),
        y:
        random(20, height - 20),
        w:
        random(24, 52),
        h:
        random(35, 110),
        speedY:
        random(-0.35, -0.1),
        alpha:
        random(20, 52),
        phase:
        random(TWO_PI)
      }
      );
    }
  }

  resetLevel() {
    this.player.reset();
    this.lanes = [];

    // arreglo de 31 carriles (inicio + 30 pasos hasta la meta)
    for (let i = 0; i <= this.finishRow; i++) {
      let type = 'calle';
      if (i === 0 || i === this.finishRow || i % 5 === 0) {
        type = 'vereda';
      }

      let nextType = 'calle';
      if (i + 1 === this.finishRow || (i + 1) % 5 === 0) {
        nextType = 'vereda';
      }

      let isFinalCrossing = (i === this.finishRow - 1);
      let dir = random([-1, 1]);

      // Carriles diferenciados, autos rapidos vs colectivos lentos
      let laneVehicleType = 'colectivo';
      if (random(1) > 0.42) {
        laneVehicleType = 'auto';
      }

      let baseSpeed;
      if (laneVehicleType === 'auto') {
        baseSpeed = random(2.5, 4.2);
      } else {
        baseSpeed = random(1.2, 1.9);
      }

      this.lanes.push(
        new Lane(-i * this.grid, type, nextType, isFinalCrossing, dir, baseSpeed, laneVehicleType, this.grid)
        );
    }
  }

  update() {
    if (this.state === "JUGANDO") {
      for (let i = 0; i < this.lanes.length; i++) {
        let lane = this.lanes[i];
        lane.update(this.player, this.sound);
        if (lane.hits(this.player)) {
          this.state = "PERDISTE";
          this.sound.playCrash();
          return;
        }
      }

      this.player.update(this.sound);

      // Condición de victoria: resuelve el conflicto al llegar a la Facultad
      if (this.player.y <= -this.finishRow * this.grid && !this.player.isMoving) {
        this.state = "GANASTE";
        this.sound.playWin();
      }
    }
  }

  display() {
    if (this.state === "INICIO") {
      this.drawStartScreen();
    } else if (this.state === "INSTRUCCIONES") {
      this.drawInstructionsScreen();
    } else if (this.state === "CREDITOS") {
      this.drawCreditsScreen();
    } else if (this.state === "JUGANDO") {
      this.drawGameplay();
    } else if (this.state === "GANASTE") {
      this.drawEndScreen(true);
    } else if (this.state === "PERDISTE") {
      this.drawEndScreen(false);
    }
  }

  drawGameplay() {
    background(40);
    push();

    // Camara vertical
    let cameraY = -this.player.visualY + height - (this.grid * 2.2);
    translate(0, cameraY);

    this.drawFacultad();

    for (let i = 0; i < this.lanes.length; i++) {
      let lane = this.lanes[i];
      lane.show();
    }

    this.player.show();
    pop();

    this.drawHUD();
  }

  drawFacultad() {
    push();
    rectMode(CORNER);
    noStroke();
    let topY = -this.finishRow * this.grid - 150;

    fill(175, 135, 105);
    rect(0, topY, width, 150);

    // Cornisa superior
    fill(115, 85, 65);
    rect(0, topY, width, 20);
    fill(145, 110, 85);
    rect(0, topY + 20, width, 7);

    // Ventanales
    let winXs = [70, 175, width - 235, width - 130];
    for (let i = 0; i < winXs.length; i++) {
      let wx = winXs[i];
      fill(60, 85, 110);
      rect(wx, topY + 42, 60, 58, 3);
      stroke(220, 210, 195);
      strokeWeight(2);
      line(wx + 30, topY + 42, wx + 30, topY + 100);
      line(wx, topY + 71, wx + 60, topY + 71);
      noStroke();
    }

    // escalinata central
    fill(195, 195, 190);
    rect(width / 2 - 95, topY + 125, 190, 25);
    stroke(150);
    strokeWeight(1);
    line(width / 2 - 95, topY + 133, width / 2 + 95, topY + 133);
    line(width / 2 - 95, topY + 141, width / 2 + 95, topY + 141);
    noStroke();

    // Puertas y columnas
    fill(85, 55, 35);
    rect(width / 2 - 42, topY + 76, 84, 49, 2);
    stroke(50, 30, 18);
    strokeWeight(2);
    line(width / 2, topY + 76, width / 2, topY + 125);
    noStroke();

    fill(215, 210, 200);
    rect(width / 2 - 64, topY + 66, 14, 59);
    rect(width / 2 + 50, topY + 66, 14, 59);

    // cartel de la Facultad (assets/escudo_facu.png)
    imageMode(CENTER);
    image(imgEscudoFacu, width / 2, topY + 44);
    imageMode(CORNER);

    pop();
  }

  drawHUD() {
    push();
    rectMode(CORNER);

    let flashAlert = (this.player.noStaminaFlash > 0 && frameCount % 4 < 2);

    // PANEL IZQUIERDO, ESTAMINA+ ESTADO
    let lx = 14, ly = 10, lw = 230, lh = 50;
    noStroke();
    fill(0, 0, 0, 95);
    rect(lx + 2, ly + 3, lw, lh, 8);

    fill(10, 17, 32, 220);
    let alertStroke;
    if (flashAlert) {
      alertStroke = color(255, 70, 70);
    } else {
      alertStroke = color(80, 170, 255, 150);
    }
    stroke(alertStroke);
    strokeWeight(1.4);
    rect(lx, ly, lw, lh, 8);
    noStroke();

    fill(255, 255, 255, 16);
    rect(lx + 2, ly + 2, lw - 4, 16, 6, 6, 0, 0);

    // rayo de energia
    let lightningColor;
    if (flashAlert) {
      lightningColor = color(255, 80, 80);
    } else {
      lightningColor = color(255, 215, 75);
    }
    fill(lightningColor);
    beginShape();
    vertex(lx + 15, ly + 8);
    vertex(lx + 10, ly + 15);
    vertex(lx + 14, ly + 15);
    vertex(lx + 12, ly + 21);
    vertex(lx + 18, ly + 14);
    vertex(lx + 14, ly + 14);
    endShape(CLOSE);

    fill(235, 244, 255);
    textAlign(LEFT, CENTER);
    textSize(10.5);
    textStyle(BOLD);
    text("ESTAMINA", lx + 23, ly + 15);

    // badge de animacion
    let badgeBg, badgeTxt;
    if (this.player.animState === "RUN") {
      badgeBg = color(40, 175, 255, 65);
      badgeTxt = color(110, 230, 255);
    } else if (this.player.animState === "WALK") {
      badgeBg = color(65, 210, 115, 55);
      badgeTxt = color(135, 245, 165);
    } else {
      badgeBg = color(140, 155, 175, 45);
      badgeTxt = color(195, 205, 220);
    }

    fill(badgeBg);
    rect(lx + lw - 62, ly + 7, 52, 15, 4);
    fill(badgeTxt);
    textAlign(CENTER, CENTER);
    textSize(9.5);
    text(this.player.animState, lx + lw - 36, ly + 14.5);
    textStyle(NORMAL);

    // barra segmentada de 10 celdas
    let barX = lx + 10, barY = ly + 28, barW = lw - 20, barH = 14;
    fill(6, 10, 20, 220);
    rect(barX, barY, barW, barH, 4);

    let totalSegs = 10, gap = 2.5, pad = 2.5;
    let segW = (barW - pad * 2 - gap * (totalSegs - 1)) / totalSegs;
    let segH = barH - pad * 2;
    let perSeg = this.player.maxStamina / totalSegs;

    let activeCol;
    if (flashAlert) {
      activeCol = color(255, 65, 65);
    } else if (this.player.stamina > 55) {
      activeCol = color(55, 215, 145);
    } else if (this.player.stamina > 22) {
      activeCol = color(245, 185, 50);
    } else {
      activeCol = color(240, 70, 75);
    }

    for (let s = 0; s < totalSegs; s++) {
      let sx = barX + pad + s * (segW + gap);
      let sy = barY + pad;
      fill(28, 36, 52);
      rect(sx, sy, segW, segH, 2);

      let ratio = constrain((this.player.stamina - s * perSeg) / perSeg, 0, 1);
      if (ratio > 0) {
        fill(activeCol);
        rect(sx, sy, segW * ratio, segH, 2);
        fill(255, 255, 255, 65);
        rect(sx, sy, segW * ratio, segH * 0.45, 2, 2, 0, 0);
      }
    }

    // PANEL CENTRAL, PROGRESO HACIA LA FACULTAD
    let cx = 256, cy = 10, cw = 195, ch = 50;
    fill(0, 0, 0, 95);
    rect(cx + 2, cy + 3, cw, ch, 8);

    fill(10, 17, 32, 220);
    stroke(80, 170, 255, 150);
    strokeWeight(1.4);
    rect(cx, cy, cw, ch, 8);
    noStroke();

    let currentStep = constrain(round(abs(this.player.y) / this.grid), 0, this.finishRow);
    let progRatio = currentStep / this.finishRow;

    fill(165, 205, 245);
    textAlign(LEFT, CENTER);
    textSize(10);
    textStyle(BOLD);
    text("DISTANCIA FACULTAD", cx + 10, cy + 15);

    fill(255);
    textAlign(RIGHT, CENTER);
    text(currentStep + "/" + this.finishRow, cx + cw - 10, cy + 15);
    textStyle(NORMAL);

    fill(24, 34, 52);
    rect(cx + 10, cy + 29, cw - 20, 11, 5);
    if (progRatio > 0) {
      fill(85, 205, 255);
      rect(cx + 10, cy + 29, (cw - 20) * progRatio, 11, 5);
    }

    // 3 PANEL DERECHO, BOTONES DE REINICIO Y SONIDO
    let rx = 464, ry = 10, rw = 152, rh = 50;
    fill(0, 0, 0, 95);
    rect(rx + 2, ry + 3, rw, rh, 8);
    fill(10, 17, 32, 220);
    stroke(80, 170, 255, 150);
    strokeWeight(1.4);
    rect(rx, ry, rw, rh, 8);
    noStroke();

    fill(130, 220, 255);
    textAlign(CENTER, CENTER);
    textSize(11);
    textStyle(BOLD);
    text("[R] REINICIAR", rx + rw / 2, ry + 18);
    fill(180, 200, 225);
    textSize(9.5);
    textStyle(NORMAL);
    text("Volver al inicio", rx + rw / 2, ry + 35);

    let sx = 628, sy = 10, sw = 158, sh = 50;
    let audioReady = this.sound.audioEnabled;
    let soundCol;
    if (this.sound.muted) {
      soundCol = color(255, 105, 110);
    } else if (audioReady) {
      soundCol = color(120, 225, 255);
    } else {
      soundCol = color(245, 195, 75);
    }

    fill(0, 0, 0, 95);
    rect(sx + 2, sy + 3, sw, sh, 8);
    fill(10, 17, 32, 220);
    stroke(soundCol);
    strokeWeight(1.4);
    rect(sx, sy, sw, sh, 8);
    noStroke();

    fill(soundCol);
    textAlign(CENTER, CENTER);
    textSize(11);
    textStyle(BOLD);
    let soundLabel = "[M] SONIDO: ON";
    if (this.sound.muted) {
      soundLabel = "[M] SONIDO: OFF";
    }
    text(soundLabel, sx + sw / 2, sy + 18);
    fill(180, 200, 225);
    textSize(9.5);
    textStyle(NORMAL);
    text("Click o tecla M", sx + sw / 2, sy + 35);

    pop();
  }

  //FONDO RETRO

  drawPS2Backdrop(topCol, botCol, orbCol, towerCol, towerHighlight) {
    for (let y = 0; y < height; y += 4) {
      let inter = map(y, 0, height, 0, 1);
      fill(lerpColor(topCol, botCol, inter));
      rect(0, y, width, 4);
    }

    for (let r = 260; r > 20; r -= 28) {
      fill(red(orbCol), green(orbCol), blue(orbCol), map(r, 20, 260, 18, 2));
      ellipse(width * 0.65, height * 0.5, r * 2.2, r * 1.2);
    }

    for (let i = 0; i < this.ps2Towers.length; i++) {
      let t = this.ps2Towers[i];
      t.y += t.speedY;
      if (t.y + t.h < 0) t.y = height + 20;

      let pulse = sin(frameCount * 0.03 + t.phase) * 8;
      fill(red(towerCol), green(towerCol), blue(towerCol), t.alpha + pulse);
      rect(t.x, t.y, t.w, t.h, 2);
      fill(red(towerHighlight), green(towerHighlight), blue(towerHighlight), t.alpha + 25);
      rect(t.x, t.y, t.w, 3);
      rect(t.x, t.y, 2, t.h);
    }
  }

  drawScanlines(alphaVal) {
    stroke(0, 0, 0, alphaVal);
    strokeWeight(1);
    for (let y = 0; y < height; y += 3) {
      line(0, y, width, y);
    }
    noStroke();
  }

  // PANTALLA DE INCIO

  drawStartScreen() {
    push();
    rectMode(CORNER);
    noStroke();

    this.drawPS2Backdrop(
      color(6, 12, 34),
      color(14, 34, 78),
      color(40, 130, 255),
      color(45, 135, 245),
      color(140, 210, 255)
      );

    // barra superior estilo Memory Card PS2 (assets/memory_card.png)
    image(imgIconoPS2, 22, 12);
    fill(180, 215, 255, 200);
    textAlign(LEFT, CENTER);
    textSize(10.5);
    text("SONY PS2 // MEMORY CARD (SLOT 1) - PROYECTO POO", 54, 25);


    stroke(90, 170, 255, 110);
    strokeWeight(1);
    line(22, 42, width - 22, 42);
    noStroke();

    // COLUMNA IZQUIERDA: TÍTULO + BOTONES DE NAVEGACION
    fill(8, 18, 44, 195);
    stroke(80, 175, 255, 175);
    strokeWeight(1.5);
    rect(32, 60, 445, 155, 8);
    noStroke();

    fill(60, 150, 255, 70);
    rect(34, 62, 441, 24, 6, 6, 0, 0);

    fill(130, 215, 255);
    textAlign(CENTER, CENTER);
    textSize(11);
    text("AVENTURA URBANA INTERACTIVA", 254, 74);

    fill(0, 180);
    textSize(34);
    textStyle(BOLD);
    text("CAMINO A LA FACU", 256, 134);

    fill(245, 250, 255);
    text("CAMINO A LA FACU", 254, 132);
    textStyle(NORMAL);

    fill(185, 215, 245);
    textSize(12);
    text("Esquivá el tráfico y llegá a la Facultad sin que te choquen", 254, 182);

    // Boton principal: APRETA CLICK PARA EMPEZAR
    let blinkAlpha = map(sin(frameCount * 0.08), -1, 1, 135, 255);
    fill(14, 42, 95, 225);
    stroke(95, 205, 255, blinkAlpha);
    strokeWeight(2);
    rect(32, 232, 445, 50, 8);
    noStroke();

    fill(255, 255, 255, blinkAlpha);
    textSize(16);
    textStyle(BOLD);
    text("APRETÁ CLICK PARA EMPEZAR", 254, 257);
    textStyle(NORMAL);

    // botones secundarios: [I] INSTRUCCIONES y [C] CREDITOS
    fill(8, 22, 54, 210);
    stroke(80, 175, 255, 160);
    strokeWeight(1.4);
    rect(32, 296, 215, 42, 7);
    rect(262, 296, 215, 42, 7);
    noStroke();

    fill(160, 220, 255);
    textSize(12);
    textStyle(BOLD);
    text("[I] INSTRUCCIONES", 139.5, 317);
    text("[C] CRÉDITOS", 369.5, 317);
    textStyle(NORMAL);

    // columna derecha,con personaje animado
    let pedX = 635;
    let pedY = 195;

    noFill();
    stroke(70, 190, 255, 145);
    strokeWeight(2);
    ellipse(pedX, pedY + 12, 125, 52);
    stroke(160, 230, 255, 95);
    strokeWeight(1);
    ellipse(pedX, pedY + 12, 165, 70);
    noStroke();

    fill(45, 155, 255, 45);
    ellipse(pedX, pedY + 12, 120, 48);

    push();
    translate(pedX, pedY - 6);
    scale(2.0);
    this.previewPlayer.animState = "WALK";
    if (frameCount % 7 === 0) {
      this.previewPlayer.frameIndex = (this.previewPlayer.frameIndex + 1) % 4;
    }
    this.previewPlayer.visualX = -this.grid / 2;
    this.previewPlayer.visualY = -this.grid / 2;
    this.previewPlayer.show();
    pop();

    // caja resumen de controles rapidos debajo del pedestal
    fill(6, 14, 34, 185);
    stroke(80, 170, 255, 90);
    strokeWeight(1);
    rect(505, 270, 260, 68, 7);
    noStroke();

    fill(145, 205, 255);
    textSize(10.5);
    textStyle(BOLD);
    text("CONTROLES RÁPIDOS", 635, 286);
    textStyle(NORMAL);

    fill(225);
    textSize(10.5);
    text("WASD / Flechas: Caminar (WALK)", 635, 304);
    text("+SHIFT: Correr (RUN)  |  R: Reiniciar", 635, 321);

    this.drawScanlines(35);
    pop();
  }

  // pantalla de instrucciones

  drawInstructionsScreen() {
    push();
    rectMode(CORNER);
    noStroke();

    this.drawPS2Backdrop(
      color(6, 12, 34),
      color(14, 34, 78),
      color(40, 130, 255),
      color(45, 135, 245),
      color(140, 210, 255)
      );

    fill(8, 18, 44, 220);
    stroke(80, 175, 255, 185);
    strokeWeight(1.5);
    rect(50, 32, width - 100, height - 64, 10);
    noStroke();

    fill(60, 150, 255, 70);
    rect(52, 34, width - 104, 34, 8, 8, 0, 0);

    fill(140, 220, 255);
    textAlign(CENTER, CENTER);
    textSize(15);
    textStyle(BOLD);
    text("INSTRUCCIONES DE JUEGO", width / 2, 51);
    textStyle(NORMAL);

    // columna izquierda: objetivo y conflicto
    textAlign(LEFT, TOP);
    fill(110, 215, 255);
    textSize(12);
    textStyle(BOLD);
    text("OBJETIVO Y CONFLICTO", 80, 86);
    textStyle(NORMAL);

    fill(230, 240, 250);
    textSize(11.5);
    text(
      "• Tenés que cruzar 30 carriles de calles y veredas\n" +
      "  para llegar a la entrada de la Facultad.\n" +
      "• RESOLVÉS EL CONFLICTO (GANÁS): Si cruzás\n" +
      "  todas las avenidas y llegás a la Facultad.\n" +
      "• NO RESOLVÉS EL CONFLICTO (PIERDES): Si te\n" +
      "  choca un auto rápido o un colectivo lento.",
      80, 110
      );

    // columna derecha: controles y mecanicas
    fill(110, 215, 255);
    textSize(12);
    textStyle(BOLD);
    text("CONTROLES Y MECÁNICAS", 435, 86);
    textStyle(NORMAL);

    fill(230, 240, 250);
    textSize(11.5);
    text(
      "• FLECHAS o WASD: Caminar paso a paso (WALK).\n" +
      "• Mantener SHIFT + Dirección: Correr rápido (RUN).\n" +
      "• BARRA DE ESTAMINA: Correr consume energía;\n" +
      "  caminá o detenete para recuperarla.\n" +
      "• TECLA 'R': Reiniciar la partida en cualquier momento.\n" +
      "• TECLA 'M': Silenciar o activar los sonidos.",
      435, 110
      );

    // boton volver
    fill(14, 42, 95, 230);
    stroke(95, 205, 255, 220);
    strokeWeight(1.8);
    rect(width / 2 - 130, 304, 260, 42, 8);
    noStroke();

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text("VOLVER AL MENÚ (CLICK / ESC)", width / 2, 325);
    textStyle(NORMAL);

    this.drawScanlines(35);
    pop();
  }

  // pantalla de creditos

  drawCreditsScreen() {
    push();
    rectMode(CORNER);
    noStroke();

    this.drawPS2Backdrop(
      color(6, 12, 34),
      color(14, 34, 78),
      color(40, 130, 255),
      color(45, 135, 245),
      color(140, 210, 255)
      );

    fill(8, 18, 44, 220);
    stroke(80, 175, 255, 185);
    strokeWeight(1.5);
    rect(110, 36, width - 220, height - 72, 10);
    noStroke();

    fill(60, 150, 255, 70);
    rect(112, 38, width - 224, 34, 8, 8, 0, 0);

    fill(140, 220, 255);
    textAlign(CENTER, CENTER);
    textSize(15);
    textStyle(BOLD);
    text("CRÉDITOS DEL PROYECTO", width / 2, 55);
    textStyle(NORMAL);

    fill(245, 250, 255);
    textSize(14);
    textStyle(BOLD);
    text("CAMINO A LA FACU — Minijuego Interactivo", width / 2, 102);
    textStyle(NORMAL);

    fill(180, 215, 250);
    textSize(12);
    text("Diseño, Programación Orientada a Objetos y Arte:", width / 2, 136);
    fill(255);
    textSize(13);
    textStyle(BOLD);
    text("Mateo Garcia y Snabria Abril", width / 2, 156);
    textStyle(NORMAL);


    // Botón Volver
    fill(14, 42, 95, 230);
    stroke(95, 205, 255, 220);
    strokeWeight(1.8);
    rect(width / 2 - 130, 298, 260, 42, 8);
    noStroke();

    fill(255);
    textSize(13);
    textStyle(BOLD);
    text("VOLVER AL MENÚ (CLICK / ESC)", width / 2, 319);
    textStyle(NORMAL);

    this.drawScanlines(35);
    pop();
  }

  //pantalla final

  drawEndScreen(isWin) {
    push();
    rectMode(CORNER);
    noStroke();

    let topBg;
    let botBg;
    let orbCol;
    let towerCol;
    let towerHi;
    let panelBg;
    let borderCol;
    let stripCol;
    let subCol;
    let titleCol;
    let btnBg;

    if (isWin) {
      topBg = color(5, 24, 28);
      botBg = color(12, 58, 56);
      orbCol = color(55, 225, 165);
      towerCol = color(45, 210, 155);
      towerHi = color(155, 255, 215);
      panelBg = color(6, 26, 28, 205);
      borderCol = color(75, 235, 165, 185);
      stripCol = color(55, 215, 155, 65);
      subCol = color(145, 245, 200);
      titleCol = color(120, 255, 195);
      btnBg = color(10, 44, 42, 220);
    } else {
      topBg = color(26, 6, 16);
      botBg = color(64, 14, 32);
      orbCol = color(245, 55, 75);
      towerCol = color(235, 65, 85);
      towerHi = color(255, 155, 170);
      panelBg = color(28, 8, 18, 205);
      borderCol = color(255, 80, 95, 185);
      stripCol = color(245, 65, 85, 65);
      subCol = color(255, 165, 175);
      titleCol = color(255, 95, 110);
      btnBg = color(46, 12, 24, 220);
    }

    this.drawPS2Backdrop(topBg, botBg, orbCol, towerCol, towerHi);

    // cabecera superior (assets/memory_card.png)
    image(imgIconoPS2, 22, 12);
    fill(red(subCol), green(subCol), blue(subCol), 200);
    textAlign(LEFT, CENTER);
    textSize(10.5);
    text("SONY PS2 // MEMORY CARD (SLOT 1)", 54, 25);

    textAlign(RIGHT, CENTER);
    let resultLabel = "CONFLICTO NO RESUELTO";
    if (isWin) {
      resultLabel = "CONFLICTO RESUELTO";
    }
    text(resultLabel, width - 24, 25);

    stroke(red(borderCol), green(borderCol), blue(borderCol), 110);
    strokeWeight(1);
    line(22, 42, width - 22, 42);
    noStroke();

    // COLUMNA IZQUIERDA, RESULTADO Y BOTONES
    fill(panelBg);
    stroke(borderCol);
    strokeWeight(1.5);
    rect(32, 60, 455, 175, 8);
    noStroke();

    fill(stripCol);
    rect(34, 62, 451, 24, 6, 6, 0, 0);

    fill(subCol);
    textAlign(CENTER, CENTER);
    textSize(11);
    let subtitle = "NO RESOLVISTE EL CONFLICTO • LLEGÁS TARDE";
    let mainTitle = "¡TE PISARON!";
    if (isWin) {
      subtitle = "CONFLICTO RESUELTO • ENTRADA A CLASE";
      mainTitle = "¡LLEGASTE A CURSAR!";
    }
    text(subtitle, 259.5, 74);
    fill(0, 190);
    textSize(32);
    textStyle(BOLD);
    text(mainTitle, 261.5, 132);

    fill(titleCol);
    text(mainTitle, 259.5, 130);
    textStyle(NORMAL);

    let currentStep = constrain(round(abs(this.player.y) / this.grid), 0, this.finishRow);
    fill(235);
    textSize(12);
    let resultDescription;
    if (isWin) {
      resultDescription = "Cruzaste los 30 carriles sano y salvo hasta la Facultad.";
    } else {
      resultDescription = "Un vehículo te interceptó en el Paso " + currentStep + " de " + this.finishRow + ".";
    }
    text(resultDescription, 259.5, 178);

    fill(subCol);
    textSize(11);
    text("Progreso del recorrido: " + currentStep + " / " + this.finishRow + " pasos", 259.5, 206);

    // boton reiniciar / jugar de nuevo
    let blinkAlpha = map(sin(frameCount * 0.08), -1, 1, 135, 255);
    fill(btnBg);
    stroke(red(borderCol), green(borderCol), blue(borderCol), blinkAlpha);
    strokeWeight(2);
    rect(32, 254, 285, 52, 8);
    noStroke();

    fill(255, 255, 255, blinkAlpha);
    textSize(13.5);
    textStyle(BOLD);
    let restartLabel = "REINTENTAR (CLICK / R)";
    if (isWin) {
      restartLabel = "JUGAR DE NUEVO (CLICK / R)";
    }
    text(restartLabel, 174.5, 280);
    textStyle(NORMAL);

    // Boton Volver al Menú Principal
    fill(btnBg);
    stroke(red(borderCol), green(borderCol), blue(borderCol), 160);
    strokeWeight(1.5);
    rect(330, 254, 157, 52, 8);
    noStroke();

    fill(subCol);
    textSize(12);
    textStyle(BOLD);
    text("MENÚ INICIO", 408.5, 280);
    textStyle(NORMAL);

    // columna derecha, pedestal holografico
    let pedX = 640;
    let pedY = 205;

    noFill();
    stroke(red(borderCol), green(borderCol), blue(borderCol), 150);
    strokeWeight(2);
    ellipse(pedX, pedY + 12, 125, 52);
    stroke(red(subCol), green(subCol), blue(subCol), 95);
    strokeWeight(1);
    ellipse(pedX, pedY + 12, 165, 70);
    noStroke();

    fill(red(orbCol), green(orbCol), blue(orbCol), 45);
    ellipse(pedX, pedY + 12, 120, 48);

    push();
    translate(pedX, pedY - 6);
    scale(2.0);
    this.previewPlayer.visualX = -this.grid / 2;
    this.previewPlayer.visualY = -this.grid / 2;

    if (isWin) {
      this.previewPlayer.animState = "RUN";
      if (frameCount % 5 === 0) {
        this.previewPlayer.frameIndex = (this.previewPlayer.frameIndex + 1) % 4;
      }
      this.previewPlayer.show();
    } else {
      this.previewPlayer.animState = "IDLE";
      this.previewPlayer.frameIndex = 0;
      push();
      rotate(HALF_PI * 0.85);
      this.previewPlayer.show();
      pop();

      for (let s = 0; s < 3; s++) {
        let ang = frameCount * 0.07 + s * (TWO_PI / 3);
        let sx = cos(ang) * 11;
        let sy = -11 + sin(ang) * 4;
        fill(255, 225, 95);
        ellipse(sx, sy, 3.2, 3.2);
      }
    }
    pop();

    this.drawScanlines(35);
    pop();
  }

  // CONTROLES DE MOUSE Y TECLADO

  handleMousePressed(mx, my) {
    if (this.state === "INICIO") {
      // Botón [I] INSTRUCCIONES
      if (mx >= 32 && mx <= 247 && my >= 296 && my <= 338) {
        this.sound.unlockAndRun();
        this.state = "INSTRUCCIONES";
        return;
      }
      // boton [C] CREDITOS
      if (mx >= 262 && mx <= 477 && my >= 296 && my <= 338) {
        this.sound.unlockAndRun();
        this.state = "CREDITOS";
        return;
      }
      // boton JUGAR
      if (mx >= 32 && mx <= 477 && my >= 232 && my <= 282) {
        this.resetLevel();
        this.state = "JUGANDO";
        this.sound.unlockAndRun();
        this.sound.playStartPS2();
      }
      return;
    } else if (this.state === "INSTRUCCIONES" || this.state === "CREDITOS") {
      this.sound.unlockAndRun();
      this.state = "INICIO";
    } else if (this.state === "JUGANDO") {
      // clic en boton [R] REINICIAR del HUD
      if (mx >= 464 && mx <= 616 && my >= 10 && my <= 60) {
        this.resetLevel();
        this.sound.unlockAndRun();
        this.sound.playStartPS2();
        return;
      }
      // Clic en boton [M] SONIDO del HUD
      if (mx >= 628 && mx <= 786 && my >= 10 && my <= 60) {
        this.sound.unlockAndRun();
        this.sound.toggleMute();
        return;
      }
      this.sound.unlockAndRun();
    } else if (this.state === "GANASTE" || this.state === "PERDISTE") {
      // Clic en boton MENU INICIO
      if (mx >= 330 && mx <= 487 && my >= 254 && my <= 306) {
        this.sound.unlockAndRun();
        this.state = "INICIO";
        return;
      }
      // Clic en REINTENTAR / JUGAR DE NUEVO
      if (mx >= 32 && mx <= 317 && my >= 254 && my <= 306) {
        this.resetLevel();
        this.state = "JUGANDO";
        this.sound.unlockAndRun();
        this.sound.playStartPS2();
      }
      return;
    }
  }

  handleKeyPressed(k, kCode) {
    if (k === 'r' || k === 'R') {
      this.resetLevel();
      this.state = "JUGANDO";
      this.sound.unlockAndRun();
      this.sound.playStartPS2();
      return;
    }

    if (k === 'm' || k === 'M') {
      this.sound.unlockAndRun();
      this.sound.toggleMute();
      return;
    }

    if (this.state === "INICIO") {
      if (k === 'i' || k === 'I') {
        this.sound.unlockAndRun();
        this.state = "INSTRUCCIONES";
      } else if (k === 'c' || k === 'C') {
        this.sound.unlockAndRun();
        this.state = "CREDITOS";
      } else if (kCode === ENTER || k === ' ') {
        this.resetLevel();
        this.state = "JUGANDO";
        this.sound.unlockAndRun();
        this.sound.playStartPS2();
      }
    } else if (this.state === "INSTRUCCIONES" || this.state === "CREDITOS") {
      if (kCode === ESCAPE || kCode === ENTER || k === ' ') {
        this.state = "INICIO";
      }
    } else if (this.state === "JUGANDO") {
      this.sound.unlockAndRun();
      let isRunning = keyIsDown(SHIFT);
      if (kCode === UP_ARROW || k === 'w' || k === 'W') this.player.tryMove(0, -1, isRunning, this.sound);
      else if (kCode === DOWN_ARROW || k === 's' || k === 'S') this.player.tryMove(0, 1, isRunning, this.sound);
      else if (kCode === RIGHT_ARROW || k === 'd' || k === 'D') this.player.tryMove(1, 0, isRunning, this.sound);
      else if (kCode === LEFT_ARROW || k === 'a' || k === 'A') this.player.tryMove(-1, 0, isRunning, this.sound);
    } else if (this.state === "GANASTE" || this.state === "PERDISTE") {
      if (kCode === ENTER || k === ' ') {
        this.resetLevel();
        this.state = "JUGANDO";
        this.sound.unlockAndRun();
        this.sound.playStartPS2();
      } else if (kCode === ESCAPE) {
        this.state = "INICIO";
      }
    }
  }
}


// clase 2, PLAYER (PERSONAJE CON ANIMACIONES IDLE, WALK Y RUN)


class Player {
  constructor(grid, finishRow) {
    this.grid = grid;
    this.finishY = -finishRow * grid;
    this.size = grid - 12;
    this.maxStamina = 100;
    this.reset();
  }

  reset() {
    this.x = floor((width / 2) / this.grid) * this.grid;
    this.y = 0;
    this.visualX = this.x;
    this.visualY = this.y;

    this.stamina = this.maxStamina;
    this.noStaminaFlash = 0;

    this.isMoving = false;
    this.isRunning = false;
    this.animState = "IDLE";
    this.angle = 0;

    this.frameIndex = 0;
    this.totalFrames = 4;
  }

  tryMove(xdir, ydir, running, sound) {
    if (this.isMoving) return;

    if (ydir === -1) this.angle = 0;
    else if (ydir === 1) this.angle = PI;
    else if (xdir === 1) this.angle = HALF_PI;
    else if (xdir === -1) this.angle = -HALF_PI;

    if (running && this.stamina < 16) {
      running = false;
      this.noStaminaFlash = 16;
      if (sound) sound.playNoStamina();
    }

    let nextX = constrain(this.x + xdir * this.grid, 0, width - this.grid);
    let nextY = constrain(this.y + ydir * this.grid, this.finishY, 0);

    if (nextX !== this.x || nextY !== this.y) {
      this.x = nextX;
      this.y = nextY;
      this.isMoving = true;
      this.isRunning = running;
      if (running) {
        this.animState = "RUN";
      } else {
        this.animState = "WALK";
      }
      this.frameIndex = 0;
      if (sound) sound.playStep(running);
    }
  }

  update(sound) {
    if (this.noStaminaFlash > 0) this.noStaminaFlash--;

    if (!this.isMoving) {
      let running = keyIsDown(SHIFT);
      if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.tryMove(0, -1, running, sound);
      else if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.tryMove(0, 1, running, sound);
      else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.tryMove(1, 0, running, sound);
      else if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.tryMove(-1, 0, running, sound);
    }

    if (this.isMoving && this.isRunning) {
      this.stamina = max(0, this.stamina - 1.45);
    } else if (this.isMoving && !this.isRunning) {
      this.stamina = min(this.maxStamina, this.stamina + 0.16);
    } else {
      this.stamina = min(this.maxStamina, this.stamina + 0.45);
    }

    if (this.isMoving) {
      let moveSpeed = 0.17;
      if (this.isRunning) {
        moveSpeed = 0.34;
      }
      this.visualX = lerp(this.visualX, this.x, moveSpeed);
      this.visualY = lerp(this.visualY, this.y, moveSpeed);

      if (abs(this.x - this.visualX) < 1 && abs(this.y - this.visualY) < 1) {
        this.visualX = this.x;
        this.visualY = this.y;
        this.isMoving = false;
        this.isRunning = false;
        this.animState = "IDLE";
      }
    }

    let frameDelay = 14;
    if (this.animState === "WALK") frameDelay = 6;
    if (this.animState === "RUN") frameDelay = 3;

    if (frameCount % frameDelay === 0) {
      this.frameIndex = (this.frameIndex + 1) % this.totalFrames;
    }
  }

  show() {
    push();
    translate(this.visualX + this.grid / 2, this.visualY + this.grid / 2);
    rotate(this.angle);

    rectMode(CENTER);
    noStroke();

    let phase = (this.frameIndex / this.totalFrames) * TWO_PI;
    let cycle = sin(phase);

    let footOffset = 0, armOffset = 0, torsoTwist = 0;
    let breatheScale = 1, hairLag = 0, packSway = 0;

    if (this.animState === "IDLE") {
      breatheScale = 1 + cycle * 0.04;
    } else if (this.animState === "WALK") {
      footOffset = cycle * 5.5;
      armOffset = -cycle * 4.5;
      torsoTwist = cycle * 0.08;
      packSway = -cycle * 0.8;
    } else if (this.animState === "RUN") {
      footOffset = cycle * 9.5;
      armOffset = -cycle * 8.5;
      torsoTwist = cycle * 0.16;
      breatheScale = 1.04;
      hairLag = 1.8;
      packSway = -cycle * 1.5;
    }

    // 1 Sombra
    fill(0, 0, 0, 55);
    ellipse(0, 2, 26, 22);

    // 2 Pies
    fill(42, 44, 48);
    ellipse(-5.5, footOffset * 0.7, 6.5, 8);
    ellipse(5.5, -footOffset * 0.7, 6.5, 8);

    fill(96, 60, 34);
    ellipse(-5.5, footOffset - 1.5, 6.5, 9.5);
    ellipse(5.5, -footOffset - 1.5, 6.5, 9.5);

    // 3 Torso y brazos
    push();
    rotate(torsoTwist);
    scale(breatheScale);

    fill(104, 116, 66);
    rect(-12.5, armOffset, 6, 10, 3);
    rect(12.5, -armOffset, 6, 10, 3);

    fill(238, 194, 160);
    ellipse(-12.5, armOffset - 4.5, 5, 5);
    ellipse(12.5, -armOffset - 4.5, 5, 5);

    fill(116, 128, 75);
    rect(0, -1, 22, 12, 5);

    fill(84, 94, 52);
    rect(0, -4, 14, 5, 2);

    // 4 Mochila
    push();
    translate(packSway, 6);

    fill(102, 66, 36);
    rect(-7, -5, 2.5, 7, 1);
    rect(7, -5, 2.5, 7, 1);

    fill(144, 138, 96);
    rect(-9.5, 0.5, 4, 7, 1.5);
    rect(9.5, 0.5, 4, 7, 1.5);

    fill(164, 158, 114);
    rect(0, 0, 17, 10, 3.5);

    fill(148, 142, 100);
    rect(0, -1.2, 15.5, 6.5, 2.5);
    fill(102, 66, 36);
    rect(0, 2.5, 16, 1.8, 1);
    rect(-4, 2.5, 2.2, 3.5, 1);
    rect(4, 2.5, 2.2, 3.5, 1);
    pop();

    pop();

    // 5 Rostro y anteojos
    fill(238, 194, 160);
    arc(0, -5, 13.5, 13, PI, TWO_PI);

    noFill();
    stroke(65, 60, 62);
    strokeWeight(1.2);
    rect(-3.6, -10.5, 5, 2.5, 1);
    rect(3.6, -10.5, 5, 2.5, 1);
    line(-1.1, -10.5, 1.1, -10.5);

    noStroke();
    fill(215, 240, 255, 140);
    rect(-3.6, -10.5, 4, 1.5);
    rect(3.6, -10.5, 4, 1.5);

    // 6 PELO
    push();
    translate(0, hairLag);

    fill(54, 30, 16);
    ellipse(0, -2.5, 16, 15);

    let curls = [
      [-6.5, -6.5, 5.2], [6.5, -6.5, 5.2],
      [-7.8, -3.2, 5.5], [7.8, -3.2, 5.5],
      [-7.2, 0.5, 5.5], [7.2, 0.5, 5.5],
      [-5.2, 3.5, 5.4], [5.2, 3.5, 5.4],
      [-2.0, 4.5, 5.5], [2.0, 4.5, 5.5],
      [-3.5, -7.2, 4.5], [3.5, -7.2, 4.5],
      [0, -7.5, 4.5]
    ];
    for (let i = 0; i < curls.length; i++) {
      let c = curls[i];
      ellipse(c[0], c[1], c[2], c[2]);
    }

    fill(84, 49, 28);
    ellipse(-3.5, -3.5, 4.8, 4.8);
    ellipse(3.5, -3.5, 4.8, 4.8);
    ellipse(0, -1.5, 5.2, 5.2);
    ellipse(-4.2, 0.8, 4.5, 4.5);
    ellipse(4.2, 0.8, 4.5, 4.5);
    ellipse(0, 2.2, 4.6, 4.6);

    stroke(42, 22, 11);
    strokeWeight(1.1);
    line(0, -6.5, 0, -1.5);
    noStroke();
    pop();

    // 7 LIneas de velocidad al hacer RUN
    if (this.animState === "RUN") {
      stroke(255, 255, 255, 140);
      strokeWeight(1.5);
      line(-9, 14, -9, 19);
      line(9, 14, 9, 19);
      noStroke();
    }

    pop();
  }
}


// clse 3, LANE (CARRIL DE CALLE O VEREDA CON ARREGLOS DE VEHICULOS)


class Lane {
  constructor(y, type, nextType, isFinalCrossing, dir, speed, vehicleType, grid) {
    this.y = y;
    this.type = type;
    this.nextType = nextType;
    this.isFinalCrossing = isFinalCrossing;
    this.grid = grid;
    this.vehicles = [];
    this.props = [];

    if (this.type === 'calle') {
      let numVehicles;
      if (vehicleType === 'auto') {
        numVehicles = floor(random(3, 5));
      } else {
        numVehicles = floor(random(2, 4));
      }
      let trackLength = width + 360;
      let sectorSize = trackLength / numVehicles;

      for (let i = 0; i < numVehicles; i++) {
        let startX = -180 + i * sectorSize + random(15, max(20, sectorSize - 125));
        this.vehicles.push(new Vehicle(startX, this.y, dir, speed, vehicleType, this.grid));
      }
    } else {
      let candidateXs = [22, 140, width - 140, width - 22];
      for (let i = 0; i < candidateXs.length; i++) {
        let px = candidateXs[i];
        if (random(1) > 0.45) {
          let propKind = 'farol';
          if (random(1) > 0.25) {
            propKind = 'arbol';
          }
          this.props.push(new SceneryProp(px, this.y + this.grid / 2, propKind));
        }
      }
    }
  }

  update(player, sound) {
    for (let i = 0; i < this.vehicles.length; i++) {
      let v = this.vehicles[i];
      v.update(this.vehicles, player, sound);
    }
  }

  show() {
    push();
    rectMode(CORNER);
    noStroke();

    if (this.type === 'vereda') {
      fill(158, 165, 155);
      rect(0, this.y, width, this.grid);

      stroke(136, 143, 133);
      strokeWeight(1);
      line(0, this.y + this.grid / 2, width, this.y + this.grid / 2);
      for (let bx = 0; bx <= width; bx += 20) {
        line(bx, this.y, bx, this.y + this.grid);
      }
      noStroke();

      fill(186, 192, 184);
      rect(0, this.y, width, 4);
      rect(0, this.y + this.grid - 4, width, 4);

      fill(45, 48, 52, 90);
      rect(0, this.y + this.grid, width, 2);

      for (let i = 0; i < this.props.length; i++) {
        let prop = this.props[i];
        prop.show();
      }
    } else {
      // Textura de asfalto (assets/asfalto.png)
      imageMode(CORNER);
      image(imgTexturaAsfalto, 0, this.y, width, this.grid);

      if (this.isFinalCrossing) {
        fill(235, 235, 230, 215);
        for (let zx = 24; zx < width - 25; zx += 38) {
          rect(zx, this.y + 5, 20, this.grid - 10, 2);
        }
      } else if (this.nextType === 'calle') {
        fill(235, 235, 235, 190);
        for (let lx = 14; lx < width; lx += 40) {
          rect(lx, this.y - 1.5, 22, 3, 1);
        }
      } else {
        fill(45, 48, 52);
        rect(0, this.y, width, 2);
      }
    }

    for (let i = 0; i < this.vehicles.length; i++) {
      let v = this.vehicles[i];
      v.show();
    }

    pop();
  }

  hits(p) {
    let pLeft = p.visualX + 8;
    let pRight = p.visualX + this.grid - 8;
    let pTop = p.visualY + 8;
    let pBottom = p.visualY + this.grid - 8;

    for (let i = 0; i < this.vehicles.length; i++) {
      let v = this.vehicles[i];
      if (pLeft < v.x + v.w &&
        pRight > v.x &&
        pTop < v.y + v.h &&
        pBottom > v.y) {
        return true;
      }
    }
    return false;
  }
}

//clse 4,  VEHICLE (AUTOS RAPIDOS Y COLECTIVOS LENTOS)


class Vehicle {
  constructor(x, y, dir, speed, type, grid) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.type = type;
    this.grid = grid;
    this.speed = speed * dir;
    this.honkedThisPass = false;

    if (this.type === 'colectivo') {
      this.w = grid * 2.5;
    } else {
      this.w = grid * 1.2;
    }
    this.h = grid - 10;
  }

  update(laneVehicles, player, sound) {
    this.x += this.speed;
    let minGap = 110;

    // Bocina solo si el jugador está en este mismo carril y el vehículo está por chocarlo
    if (!this.honkedThisPass && player && abs(this.y - player.visualY) < this.grid * 0.5) {
      let playerLeft = player.visualX + 6;
      let playerRight = player.visualX + this.grid - 6;

      let distAhead;
      if (this.dir === 1) {
        distAhead = playerLeft - (this.x + this.w);
      } else {
        distAhead = this.x - playerRight;
      }

      let dangerRange = 85;
      if (this.type === 'auto') {
        dangerRange = 105;
      }

      if (distAhead >= -4 && distAhead <= dangerRange) {
        if (sound) sound.playHorn(this.type);
        this.honkedThisPass = true;
      }
    }

    if (this.dir === 1 && this.x > width + this.grid) {
      this.honkedThisPass = false;
      let leftmostX = 0;
      for (let i = 0; i < laneVehicles.length; i++) {
        let other = laneVehicles[i];
        if (other !== this && other.x < leftmostX) {
          leftmostX = other.x;
        }
      }
      this.x = min(-this.w - random(40, 180), leftmostX - this.w - minGap - random(20, 120));
    } else if (this.dir === -1 && this.x < -this.w - this.grid) {
      this.honkedThisPass = false;
      let rightmostRight = width;
      for (let i = 0; i < laneVehicles.length; i++) {
        let other = laneVehicles[i];
        if (other !== this && (other.x + other.w) > rightmostRight) {
          rightmostRight = other.x + other.w;
        }
      }
      this.x = max(width + random(40, 180), rightmostRight + minGap + random(20, 120));
    }
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.grid / 2);

    if (this.dir === -1) {
      scale(-1, 1);
    }

    rectMode(CENTER);
    noStroke();

    if (this.type === 'colectivo') {
      fill(40, 120, 200);
      rect(0, 0, this.w, this.h, 4);

      fill(60, 140, 220);
      rect(0, 0, this.w - 10, this.h - 6, 2);

      fill(50, 200, 255);
      rect(this.w / 2 - 6, 0, 6, this.h - 8);
      rect(-this.w / 2 + 6, 0, 4, this.h - 8);

      fill(200);
      rect(-10, 0, 15, 8, 2);
      rect(15, 0, 15, 8, 2);

      fill(255, 255, 100);
      rect(this.w / 2, -this.h / 2 + 2, 4, 4);
      rect(this.w / 2, this.h / 2 - 2, 4, 4);

      fill(255, 50, 50);
      rect(-this.w / 2, -this.h / 2 + 2, 4, 4);
      rect(-this.w / 2, this.h / 2 - 2, 4, 4);
    } else {
      fill(20);
      rect(-this.w / 4, -this.h / 2, 10, 4);
      rect(this.w / 4, -this.h / 2, 10, 4);
      rect(-this.w / 4, this.h / 2, 10, 4);
      rect(this.w / 4, this.h / 2, 10, 4);

      fill(220, 180, 40);
      rect(0, 0, this.w, this.h, 5);

      fill(200, 150, 20);
      rect(-2, 0, this.w * 0.4, this.h - 4, 3);

      fill(50, 200, 255);
      rect(this.w * 0.2, 0, 6, this.h - 6);
      rect(-this.w * 0.25 - 2, 0, 6, this.h - 6);

      fill(255, 255, 100);
      ellipse(this.w / 2 - 2, -this.h / 2 + 3, 4, 4);
      ellipse(this.w / 2 - 2, this.h / 2 - 3, 4, 4);

      fill(255, 50, 50);
      rect(-this.w / 2 + 2, -this.h / 2 + 2, 3, 4);
      rect(-this.w / 2 + 2, this.h / 2 - 2, 3, 4);
    }

    pop();
  }
}


// clase 5, (ARBOLES Y FAROLES DE VEREDA VISTOS DESDE ARRIBA)

class SceneryProp {
  constructor(x, y, kind) {
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.size = random(22, 28);
  }

  show() {
    push();
    noStroke();
    if (this.kind === 'arbol') {
      fill(0, 0, 0, 45);
      ellipse(this.x + 3, this.y + 4, this.size, this.size * 0.9);
      fill(52, 112, 54);
      ellipse(this.x, this.y, this.size, this.size);
      fill(72, 142, 68);
      ellipse(this.x - 2, this.y - 2, this.size * 0.72, this.size * 0.72);
      fill(98, 172, 86);
      ellipse(this.x - 3, this.y - 4, this.size * 0.4, this.size * 0.4);
    } else {
      fill(255, 235, 140, 45);
      ellipse(this.x, this.y, 24, 24);
      fill(60, 65, 70);
      ellipse(this.x, this.y, 7, 7);
      fill(255, 245, 180);
      ellipse(this.x, this.y, 3.5, 3.5);
    }
    pop();
  }
}


// clase 6, (REPRODUCCIÓN DE AUDIOS CON p5.sound)


class SoundEngine {
  constructor() {
    this.muted = false;
    this.audioEnabled = false;
    this.lastHornTime = 0;
  }

  unlockAndRun() {
    // El navegador habilita el audio a partir de una interaccion del usuario.
    if (typeof userStartAudio === 'function') {
      userStartAudio();
    }
    this.audioEnabled = true;
  }

  toggleMute() {
    this.muted = !this.muted;

    // Al silenciar, detener cualquier sonido que esté reproduciEndose.
    if (this.muted) {
      this.stopAllSounds();
    }
  }

  stopAllSounds() {
    let sounds = [
      sonidoInicio,
      sonidoPasoCaminar,
      sonidoPasoCorrer,
      sonidoSinEstamina,
      sonidoBocinaAuto,
      sonidoBocinaColectivo,
      sonidoChoque,
      sonidoVictoria
    ];

    for (let i = 0; i < sounds.length; i++) {
      if (sounds[i] && sounds[i].isPlaying()) {
        sounds[i].stop();
      }
    }
  }

  playSound(soundFile, volume) {
    if (this.muted || !soundFile) {
      return;
    }

    soundFile.setVolume(volume);
    soundFile.play();
  }

  playStartPS2() {
    this.playSound(sonidoInicio, 0.55);
  }

  playStep(isRunning) {
    if (isRunning) {
      this.playSound(sonidoPasoCorrer, 0.35);
    } else {
      this.playSound(sonidoPasoCaminar, 0.25);
    }
  }

  playNoStamina() {
    this.playSound(sonidoSinEstamina, 0.5);
  }

  playHorn(vehicleType) {
    if (this.muted) {
      return;
    }

    // Evita que las bocinas se repitan demasiado seguido.
    if (millis() - this.lastHornTime < 600) {
      return;
    }
    this.lastHornTime = millis();

    if (vehicleType === 'colectivo') {
      this.playSound(sonidoBocinaColectivo, 0.55);
    } else {
      this.playSound(sonidoBocinaAuto, 0.45);
    }
  }

  playCrash() {
    this.playSound(sonidoChoque, 0.7);
  }

  playWin() {
    this.playSound(sonidoVictoria, 0.6);
  }
}
