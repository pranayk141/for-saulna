const yesButton =
  document.getElementById("yesButton");

const yesButtonText =
  document.getElementById("yesButtonText");

const noButton =
  document.getElementById("noButton");

const attemptMessage =
  document.getElementById("attemptMessage");

const questionCard =
  document.getElementById("questionCard");

const celebration =
  document.getElementById("celebration");

const letterIntro =
  document.getElementById("letterIntro");

const openLetter =
  document.getElementById("openLetter");

const celebrationDate =
  document.getElementById("celebrationDate");

const ambientRain =
  document.querySelector(".ambient-rain");

const roseSecret =
  document.getElementById("roseSecret");

const secretMessage =
  document.getElementById("secretMessage");

const tryAgain =
  document.getElementById("tryAgain");


/* -------------------------------- */
/* Cute sequential YES messages */
/* -------------------------------- */

const yesMessages = [
  "Yes ♡",
  "Please? 🥺",
  "Are you sure?",
  "Like… really sure?",
  "Saülna pls 😭",
  "Pretty please? 🌹",
  "Think about it…",
  "I'll bring you roses 🥺",
  "This button is getting nervous",
  "You know you want to 😌",
  "I'll be very good 🫶",
  "Just one little yes?",
  "I'll make it worth it ♡",
  "Okay now you're just teasing me",
  "The roses are waiting 🌹",
  "I believe in you",
  "Choose happiness 😌",
  "You + me sounds pretty good",
  "Saülnaaaaa 🥺",
  "Okay. Obviously yes ♡"
];


/* -------------------------------- */
/* Little messages below buttons */
/* -------------------------------- */

const reactionMessages = [
  "",
  "Hmm… interesting.",
  "That button seems shy.",
  "It really doesn't want to be clicked.",
  "I promise I didn't tell it to do that.",
  "Okay… maybe I did.",
  "The website has made its opinion clear.",
  "Saülna, please 😭",
  "Even the button is rooting for me.",
  "At this point we're negotiating.",
  "I have roses. Just saying. 🌹",
  "You're very committed to this.",
  "Respectfully… wrong button.",
  "We both know where this is going.",
  "This is getting embarrassing for No.",
  "Yes is looking very comfortable over there.",
  "The universe has spoken.",
  "You can keep trying if you want 😌",
  "No has entered witness protection.",
  "Just press Yes, pretty girl ♡"
];


let attempts = 0;

let lastPosition = null;

let isRunning = false;


/* -------------------------------- */
/* Opening letter sequence */
/* -------------------------------- */

openLetter.addEventListener("click", () => {
  letterIntro.classList.add("is-open");

  window.setTimeout(() => {
    letterIntro.setAttribute("aria-hidden", "true");
  }, 750);
});

roseSecret.addEventListener("click", () => {
  secretMessage.textContent =
    "You found a rose. I would rather give you a real one.";

  secretMessage.classList.remove("is-visible");
  void secretMessage.offsetWidth;
  secretMessage.classList.add("is-visible");
});

tryAgain.addEventListener("click", () => {
  window.location.reload();
});


/* -------------------------------- */
/* Utility helpers */
/* -------------------------------- */

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}


function randomBetween(min, max) {
  return (
    Math.random() *
      (max - min) +
    min
  );
}


/* -------------------------------- */
/* Convert No button to fixed */
/* without visually jumping */
/* -------------------------------- */

function initializeRunningButton() {
  if (isRunning) return;

  /*
    Capture where the button currently appears
    BEFORE moving it in the DOM.
  */
  const rect =
    noButton.getBoundingClientRect();

  /*
    Move the button directly under <body>.

    This is important:
    the question card uses backdrop-filter / transforms,
    which can cause position: fixed children to behave
    as though they're positioned relative to the card
    instead of the browser viewport.
  */
  document.body.appendChild(noButton);

  /*
    Now make it genuinely fixed relative
    to the browser window.
  */
  noButton.classList.add("is-running");

  noButton.style.position = "fixed";

  noButton.style.left =
    `${rect.left}px`;

  noButton.style.top =
    `${rect.top}px`;

  noButton.style.width =
    `${rect.width}px`;

  noButton.style.margin = "0";

  /*
    Very high z-index so it always stays visible.
  */
  noButton.style.zIndex = "9999";

  lastPosition = {
    x: rect.left,
    y: rect.top
  };

  isRunning = true;
}


/* -------------------------------- */
/* Find a safe new position */
/* -------------------------------- */

function findSafePosition(pointerX, pointerY) {
  /*
    offsetWidth / offsetHeight give us the button's
    actual layout dimensions without rotation confusing
    the measurements.
  */
  const buttonWidth = noButton.offsetWidth;
  const buttonHeight = noButton.offsetHeight;

  /*
    Extra padding is intentionally generous because
    the button can be scaled and slightly rotated.
  */
  const edgePadding =
    window.innerWidth < 600
      ? 40
      : 50;

  /*
    Account for the maximum amount the button can
    visually grow after scaling.
  */
  const maxScale = 1;

  const safeButtonWidth =
    buttonWidth * maxScale;

  const safeButtonHeight =
    buttonHeight * maxScale;

  const minX = edgePadding;
  const minY = edgePadding;

  const maxX =
    Math.max(
      minX,
      window.innerWidth -
        safeButtonWidth -
        edgePadding
    );

  const maxY =
    Math.max(
      minY,
      window.innerHeight -
        safeButtonHeight -
        edgePadding
    );

  let bestCandidate = null;
  let bestScore = -Infinity;

  /*
    Try many random positions and choose the one
    furthest away from the pointer.
  */
  for (let i = 0; i < 50; i++) {
    const x =
      randomBetween(minX, maxX);

    const y =
      randomBetween(minY, maxY);

    const centerX =
      x + safeButtonWidth / 2;

    const centerY =
      y + safeButtonHeight / 2;

    const pointerDistance =
      Math.hypot(
        centerX - pointerX,
        centerY - pointerY
      );

    let movementDistance = 0;

    if (lastPosition) {
      movementDistance =
        Math.hypot(
          x - lastPosition.x,
          y - lastPosition.y
        );
    }

    /*
      Prefer somewhere far away from:
      1. the mouse/finger
      2. the previous button position
    */
    const score =
      pointerDistance +
      movementDistance * 0.3;

    if (score > bestScore) {
      bestScore = score;

      bestCandidate = {
        x,
        y
      };
    }
  }

  return bestCandidate;
}



/* -------------------------------- */
/* Move button */
/* -------------------------------- */

function moveNoButton(pointerX, pointerY) {
  initializeRunningButton();

  const destination =
    findSafePosition(
      pointerX,
      pointerY
    );

  if (!destination) return;

  /*
    Keep the rotation subtle.

    Large rotations can visually push the corners
    outside the viewport even if left/top are valid.
  */
  const rotation =
    randomBetween(-5, 5);

  /*
    Clamp one final time before positioning.

    This acts as a second layer of protection.
  */
  const padding =
    window.innerWidth < 600
      ? 40
      : 50;

  const buttonWidth =
    noButton.offsetWidth;

  const buttonHeight =
    noButton.offsetHeight;

  const safeX =
    clamp(
      destination.x,
      padding,
      Math.max(
        padding,
        window.innerWidth -
          buttonWidth -
          padding
      )
    );

  const safeY =
    clamp(
      destination.y,
      padding,
      Math.max(
        padding,
        window.innerHeight -
          buttonHeight -
          padding
      )
    );

  noButton.style.left =
    `${safeX}px`;

  noButton.style.top =
    `${safeY}px`;

  noButton.style.transform =
    `rotate(${rotation}deg)`;

  lastPosition = {
    x: safeX,
    y: safeY
  };
}


/* -------------------------------- */
/* Update playful progression */
/* -------------------------------- */

function updateProgression() {
  attempts += 1;

  const messageIndex =
    Math.min(
      attempts,
      yesMessages.length - 1
    );

  yesButtonText.textContent =
    yesMessages[messageIndex];

  const reactionIndex =
    Math.min(
      attempts,
      reactionMessages.length - 1
    );

  attemptMessage.textContent =
    reactionMessages[reactionIndex];

  attemptMessage.classList.remove(
    "message-pop"
  );

  /*
    Restart CSS animation.
  */
  void attemptMessage.offsetWidth;

  attemptMessage.classList.add(
    "message-pop"
  );


  /* ---------------------------- */
  /* Grow Yes gradually */
  /* ---------------------------- */

  const yesScale =
    Math.min(
      1 + attempts * 0.025,
      1.32
    );

  yesButton.style.transform =
    `scale(${yesScale})`;


  /* ---------------------------- */
  /* Shrink No gradually */
  /* ---------------------------- */

  if (attempts >= 5) {
    const noScale =
      Math.max(
        1 -
          (attempts - 4) *
            0.035,
        0.68
      );

    noButton.style.scale =
      noScale;
  }


  /* ---------------------------- */
  /* Change No text later */
  /* ---------------------------- */

  if (attempts === 7) {
    noButton.textContent =
      "Wait";
  }

  if (attempts === 10) {
    noButton.textContent =
      "No? 😭";
  }

  if (attempts === 13) {
    noButton.textContent =
      "Catch me";
  }

  if (attempts >= 17) {
    noButton.textContent =
      "Still no";
  }


  /* Phase 2 escalation cues. */
  if (attempts >= 4) {
    yesButton.classList.add("is-rose-lit");
  }

  if (attempts >= 9) {
    questionCard.classList.add("is-dramatic");
    ambientRain.classList.add("is-energized");
  }
}


/* -------------------------------- */
/* Desktop mouse behavior */
/* -------------------------------- */

noButton.addEventListener(
  "pointerenter",
  (event) => {

    /*
      Mouse and trackpad users.
      Touch does not meaningfully
      "hover", so handle it separately.
    */

    if (
      event.pointerType === "touch"
    ) {
      return;
    }

    updateProgression();

    moveNoButton(
      event.clientX,
      event.clientY
    );
  }
);


/* -------------------------------- */
/* Mobile behavior */
/* -------------------------------- */

noButton.addEventListener(
  "pointerdown",
  (event) => {

    /*
      On phones/tablets, move the
      button before a tap can finish.
    */

    if (
      event.pointerType !== "touch" &&
      event.pointerType !== "pen"
    ) {
      return;
    }

    event.preventDefault();

    updateProgression();

    moveNoButton(
      event.clientX,
      event.clientY
    );
  }
);


/* -------------------------------- */
/* Last-resort click protection */
/* -------------------------------- */

noButton.addEventListener(
  "click",
  (event) => {
    event.preventDefault();

    updateProgression();

    const rect =
      noButton.getBoundingClientRect();

    moveNoButton(
      rect.left +
        rect.width / 2,

      rect.top +
        rect.height / 2
    );
  }
);


/* -------------------------------- */
/* Keep button on screen */
/* after resize/orientation changes */
/* -------------------------------- */

window.addEventListener(
  "resize",
  () => {
    if (!isRunning) return;

    const padding =
      window.innerWidth < 600
        ? 40
        : 50;

    const buttonWidth =
      noButton.offsetWidth;

    const buttonHeight =
      noButton.offsetHeight;

    /*
      Read the CSS left/top values rather than
      getBoundingClientRect(), because transforms
      can distort the latter.
    */
    const currentX =
      parseFloat(noButton.style.left) ||
      padding;

    const currentY =
      parseFloat(noButton.style.top) ||
      padding;

    const safeX =
      clamp(
        currentX,
        padding,
        Math.max(
          padding,
          window.innerWidth -
            buttonWidth -
            padding
        )
      );

    const safeY =
      clamp(
        currentY,
        padding,
        Math.max(
          padding,
          window.innerHeight -
            buttonHeight -
            padding
        )
      );

    noButton.style.left =
      `${safeX}px`;

    noButton.style.top =
      `${safeY}px`;

    lastPosition = {
      x: safeX,
      y: safeY
    };
  }
);


/* -------------------------------- */
/* YES celebration */
/* -------------------------------- */

yesButton.addEventListener(
  "click",
  () => {

    createCelebrationBurst();
    createCelebrationRain();
    createCelebrationAtmosphere();

    noButton.hidden = true;
    noButton.setAttribute("aria-hidden", "true");

    celebrationDate.textContent =
      "September 26, 2026";

    document.body.classList.add("is-celebrating");

    yesButton.textContent =
      "She said yes ♡";

    /*
      Slight delay lets the first
      burst register visually.
    */

    setTimeout(() => {
      celebration.scrollTop = 0;

      celebration.classList.add(
        "is-visible"
      );

      celebration.setAttribute(
        "aria-hidden",
        "false"
      );

      questionCard.setAttribute(
        "aria-hidden",
        "true"
      );
    }, 430);
  }
);


/* -------------------------------- */
/* Celebration particles */
/* -------------------------------- */

function createCelebrationBurst() {
  const symbols = [
    "♡",
    "♥",
    "🌹",
    "✦",
    "♡",
    "✧"
  ];

  const origin =
    yesButton.getBoundingClientRect();

  const originX =
    origin.left +
    origin.width / 2;

  const originY =
    origin.top +
    origin.height / 2;

  for (
    let i = 0;
    i < 34;
    i++
  ) {
    const particle =
      document.createElement("span");

    particle.className =
      "celebration-particle";

    particle.textContent =
      symbols[
        Math.floor(
          Math.random() *
          symbols.length
        )
      ];

    particle.style.left =
      `${originX}px`;

    particle.style.top =
      `${originY}px`;

    particle.style.fontSize =
      `${randomBetween(
        14,
        27
      )}px`;

    const angle =
      randomBetween(
        0,
        Math.PI * 2
      );

    const distance =
      randomBetween(
        90,
        290
      );

    const x =
      Math.cos(angle) *
      distance;

    const y =
      Math.sin(angle) *
      distance;

    particle.style.setProperty(
      "--x",
      `${x}px`
    );

    particle.style.setProperty(
      "--y",
      `${y}px`
    );

    particle.style.setProperty(
      "--r",
      `${randomBetween(
        -260,
        260
      )}deg`
    );

    document.body.appendChild(
      particle
    );

    setTimeout(() => {
      particle.remove();
    }, 1600);
  }
}


/* A dramatic but still romantic shower over the celebration reveal. */
function createCelebrationRain() {
  const symbols = [
    "\u{1F339}",
    "\u{2740}",
    "\u{1F339}",
    "\u{2661}",
    "\u{1F339}",
    "\u{2764}",
    "\u{1F339}",
    "\u{1F339}",
    "\u{2747}"
  ];

  for (let i = 0; i < 144; i++) {
    const petal = document.createElement("span");
    const symbol = symbols[
      Math.floor(Math.random() * symbols.length)
    ];

    petal.className = "celebration-rain-petal";
    petal.textContent = symbol;

    if (symbol === "\u{2740}") {
      petal.classList.add("is-white");
    }

    petal.style.left = `${randomBetween(-4, 104)}vw`;
    petal.style.fontSize = `${randomBetween(17, 34)}px`;
    petal.style.setProperty(
      "--petal-drift",
      `${randomBetween(-130, 130)}px`
    );
    petal.style.setProperty(
      "--petal-rotate",
      `${randomBetween(-540, 540)}deg`
    );
    petal.style.setProperty(
      "--petal-duration",
      `${randomBetween(3.2, 6.2)}s`
    );
    petal.style.setProperty(
      "--petal-delay",
      `${randomBetween(0, 1.4)}s`
    );

    document.body.appendChild(petal);

    window.setTimeout(() => {
      petal.remove();
    }, 9000);
  }
}


/* The celebration has its own copy so its opaque stacking context cannot
   hide the ambient movement from the first page. */
function createCelebrationAtmosphere() {
  if (celebration.querySelector(".celebration-ambient")) return;

  const atmosphere = document.createElement("div");
  atmosphere.className = "celebration-ambient";
  atmosphere.setAttribute("aria-hidden", "true");

  const ambientDecor = document
    .querySelector(".ambient-decor")
    .cloneNode(true);

  const ambientRain = document
    .querySelector(".ambient-rain")
    .cloneNode(true);

  atmosphere.append(ambientDecor, ambientRain);
  celebration.prepend(atmosphere);
}
