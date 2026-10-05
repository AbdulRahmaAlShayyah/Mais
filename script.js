
/* =========================================================
   HEART PARTICLE SYSTEM
========================================================= */

const canvas = document.getElementById("heart-canvas");
const ctx = canvas.getContext("2d", { alpha: true });

let heartsArray = [];
let ambientTimer;

let viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(window.devicePixelRatio || 1, 2)
};


/* =========================================================
   CANVAS RESIZE
========================================================= */

function resizeCanvas() {

  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  viewport.dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = viewport.width * viewport.dpr;
  canvas.height = viewport.height * viewport.dpr;

  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  ctx.setTransform(
    viewport.dpr,
    0,
    0,
    viewport.dpr,
    0,
    0
  );
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


/* =========================================================
   HEART CLASS
========================================================= */

class FloatingHeart {

  constructor(x = null, y = null, explosion = false) {

    this.explosion = explosion;

    this.x =
      x !== null
        ? x
        : Math.random() * viewport.width;

    this.y =
      y !== null
        ? y
        : viewport.height + 30;

    const mobile =
      viewport.width < 600;

    this.size = explosion
      ? Math.random() * 22 + 9
      : Math.random() * (mobile ? 9 : 13) + 6;

    if (explosion) {

      const angle =
        Math.random() * Math.PI * 2;

      const force =
        Math.random() * 9 + 4;

      this.vx =
        Math.cos(angle) * force;

      this.vy =
        Math.sin(angle) * force;

    } else {

      this.vx =
        (Math.random() - .5) * .7;

      this.vy =
        -Math.random() * 1.3 - .35;
    }

    this.gravity =
      explosion
        ? .12
        : 0;

    this.rotation =
      Math.random() * Math.PI * 2;

    this.rotationSpeed =
      (Math.random() - .5) * .08;

    this.opacity = 0;

    this.life = 0;

    this.maxLife =
      explosion
        ? Math.random() * 70 + 60
        : Infinity;

    this.fadeIn =
      explosion
        ? .08
        : .025;

    this.fadeOut =
      explosion
        ? .015
        : 0;

    const colors = [
      "#ff3f87",
      "#ff5799",
      "#ff79ae",
      "#ffc1d9",
      "#ffd76a"
    ];

    this.color =
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ];
  }


  draw() {

    ctx.save();

    ctx.translate(this.x, this.y);

    ctx.rotate(this.rotation);

    ctx.globalAlpha = this.opacity;

    ctx.shadowBlur =
      this.explosion ? 15 : 8;

    ctx.shadowColor = this.color;

    ctx.fillStyle = this.color;

    const s = this.size;

    ctx.beginPath();

    ctx.moveTo(0, s * .25);

    ctx.bezierCurveTo(
      -s * .55,
      -s * .15,
      -s * .65,
      s * .55,
      0,
      s
    );

    ctx.bezierCurveTo(
      s * .65,
      s * .55,
      s * .55,
      -s * .15,
      0,
      s * .25
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }


  update() {

    this.life++;

    this.x += this.vx;
    this.y += this.vy;

    if (this.explosion) {

      this.vy += this.gravity;

      this.vx *= .985;
      this.vy *= .985;

      this.rotation += this.rotationSpeed;

      if (this.life < 15) {
        this.opacity += this.fadeIn;
      }

      if (this.life >
          this.maxLife * .65) {

        this.opacity -= this.fadeOut;
      }

    } else {

      this.rotation += this.rotationSpeed * .25;

      if (this.opacity < .8) {
        this.opacity += this.fadeIn;
      }
    }
  }


  dead() {

    return (
      this.opacity <= 0 ||
      this.y < -50 ||
      this.life > this.maxLife
    );
  }
}


/* =========================================================
   AMBIENT HEARTS
========================================================= */

function getMaxHearts() {

  if (viewport.width < 500) {
    return 18;
  }

  if (viewport.width < 900) {
    return 25;
  }

  return 35;
}


function createAmbientHeart() {

  if (
    heartsArray.length <
    getMaxHearts()
  ) {

    heartsArray.push(
      new FloatingHeart()
    );
  }
}


function initAmbientHearts() {

  clearInterval(ambientTimer);

  ambientTimer = setInterval(
    createAmbientHeart,
    viewport.width < 600
      ? 450
      : 300
  );
}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animateCanvas() {

  ctx.clearRect(
    0,
    0,
    viewport.width,
    viewport.height
  );

  for (
    let i = heartsArray.length - 1;
    i >= 0;
    i--
  ) {

    const heart =
      heartsArray[i];

    heart.update();
    heart.draw();

    if (heart.dead()) {

      heartsArray.splice(i, 1);
    }
  }

  requestAnimationFrame(
    animateCanvas
  );
}


/* =========================================================
   SURPRISE TRANSITION
========================================================= */

function triggerSurprise() {

  const welcomeScreen =
    document.getElementById(
      "welcome-screen"
    );

  const celebrationScreen =
    document.getElementById(
      "celebration-screen"
    );

  const cakeContainer =
    document.getElementById(
      "cake-container"
    );

  const finalCard =
    document.getElementById(
      "final-card"
    );


  if (
    !welcomeScreen ||
    !celebrationScreen ||
    !cakeContainer ||
    !finalCard
  ) {
    return;
  }


  /* Hide welcome */

  welcomeScreen.classList.remove(
    "active"
  );


  /* Show celebration */

  setTimeout(() => {

    celebrationScreen.classList.add(
      "active"
    );

  }, 500);


  /* Cake explosion */

  setTimeout(() => {

    explodeCake(
      cakeContainer,
      finalCard
    );

  }, 1500);
}


/* =========================================================
   CAKE EXPLOSION
========================================================= */

function explodeCake(
  cakeEl,
  cardEl
) {

  if (!cakeEl || !cardEl) {
    return;
  }


  cakeEl.classList.add(
    "cake-explode"
  );


  /* Find cake center */

  const rect =
    cakeEl.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const centerY =
    rect.top + rect.height / 2;


  /* Particle count adapts to screen */

  const particleCount =
    viewport.width < 500
      ? 45
      : viewport.width < 900
        ? 60
        : 80;


  for (
    let i = 0;
    i < particleCount;
    i++
  ) {

    heartsArray.push(
      new FloatingHeart(
        centerX,
        centerY,
        true
      )
    );
  }


  /* Confetti */

  if (
    typeof confetti === "function"
  ) {

    const isMobile =
      viewport.width < 600;

    confetti({

      particleCount:
        isMobile ? 70 : 120,

      spread:
        isMobile ? 85 : 110,

      startVelocity:
        isMobile ? 30 : 40,

      scalar:
        isMobile ? .8 : 1,

      origin: {
        x: .5,
        y: .5
      },

      colors: [
        "#ff3f87",
        "#ff79ae",
        "#ffc1d9",
        "#ffd76a",
        "#ffffff"
      ]
    });
  }


  /* Show final card */

  setTimeout(() => {

    cakeEl.style.display = "none";

    cardEl.classList.add(
      "show"
    );

  }, 700);
}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

  initAmbientHearts();

  animateCanvas();

  /* Initial hearts */

  const initialCount =
    viewport.width < 600
      ? 8
      : 15;

  for (
    let i = 0;
    i < initialCount;
    i++
  ) {

    const heart =
      new FloatingHeart();

    heart.y =
      Math.random() *
      viewport.height;

    heartsArray.push(
      heart
    );
  }
}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();
}

