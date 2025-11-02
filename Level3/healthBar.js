let hearts = [];
const heartTypes = [{ symbol: "❤️", name: "Full" }];

// Short invulnerability after getting hit
let canTakeDamage = true;
const damageCooldown = 1000;

export function addHearts(count = 5) {
  const heartsContainer = document.createElement("div");
  heartsContainer.id = "hearts-container";
  heartsContainer.style.position = "absolute";
  heartsContainer.style.top = "20px";
  heartsContainer.style.right = "20px";
  heartsContainer.style.display = "flex";
  heartsContainer.style.gap = "10px";
  heartsContainer.style.zIndex = "1000";

  for (let i = 0; i < count; i++) {
    const type = heartTypes[0];
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = type.symbol;
    heart.style.fontSize = "32px";
    heart.style.filter = "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))";
    heart.style.transition = "transform 0.2s, opacity 0.5s";
    heart.style.cursor = "pointer";

    heart.addEventListener(
      "mouseenter",
      () => (heart.style.transform = "scale(1.2)")
    );
    heart.addEventListener(
      "mouseleave",
      () => (heart.style.transform = "scale(1)")
    );

    heartsContainer.appendChild(heart);
    hearts.push(heart);
  }

  document.body.appendChild(heartsContainer);
}

// Utility: safely flash red for Mesh or GLTF model
function flashHeroRed(heroSphere) {
  heroSphere.traverse
    ? heroSphere.traverse(applyFlash)
    : applyFlash(heroSphere);

  function applyFlash(node) {
    if (node.isMesh && node.material && node.material.color) {
      const originalColor = node.material.color.clone();
      node.material.color.setHex(0xff0000);
      setTimeout(() => node.material.color.copy(originalColor), 200);
    }
  }
}

// MODIFIED: Expose takeDamage so main.js can call it
export function takeDamage(heroSphere, heroBaseY) {
  if (!canTakeDamage) return false;

  removeHeart();
  canTakeDamage = false;

  // Flash red briefly
  flashHeroRed(heroSphere);

  // Reset hero position (prevent floating)
  heroSphere.position.y = heroBaseY;

  // Re-enable damage after cooldown
  setTimeout(() => (canTakeDamage = true), damageCooldown);

  if (getRemainingHearts() === 0) {
    gameOver();
  }

  return true; // Return true if damage was taken
}

// MODIFIED: Just check if we CAN take damage (for main.js to use)
export function canTakeDamageNow() {
  return canTakeDamage;
}

// Hitting edges
export function takeLanePenalty(heroSphere, direction) {
  console.log("Boundary hit! Lost a heart.");

  removeHeart();

  // Flash red safely (works for GLTF too)
  flashHeroRed(heroSphere);

  // Bounce effect (visual feedback)
  const originalX = heroSphere.position.x;
  let velocity = direction * 0.3;
  let damping = 0.85;
  let oscillations = 0;

  function animateShock() {
    heroSphere.position.x += velocity;
    velocity *= -damping;
    oscillations++;
    if (Math.abs(velocity) > 0.01 && oscillations < 10) {
      requestAnimationFrame(animateShock);
    } else {
      heroSphere.position.x = originalX;
    }
  }

  animateShock();

  const remaining = getRemainingHearts();
  if (remaining <= 0) {
    console.log("No hearts left — triggering Game Over!");
    gameOver();
  }
}

export function removeHeart() {
  if (hearts.length > 0) {
    const heart = hearts.pop();
    heart.style.opacity = "0";
    heart.style.transform = "scale(1.5) rotate(20deg)";
    setTimeout(() => heart.remove(), 500);
  }
}

export function getRemainingHearts() {
  return hearts.length;
}

export function resetHearts() {
  hearts.forEach((h) => h.remove());
  hearts = [];
  const container = document.getElementById("hearts-container");
  if (container) container.remove();
  addHearts(5);
}

export function gameOver() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "10000";
  overlay.style.color = "white";
  overlay.style.fontFamily = "Arial, sans-serif";

  const gameOverText = document.createElement("h1");
  gameOverText.textContent = "Game Over!";
  gameOverText.style.fontSize = "64px";
  gameOverText.style.marginBottom = "20px";
  gameOverText.style.textShadow = "4px 4px 8px rgba(0,0,0,0.8)";

  const scoreText = document.createElement("p");
  const scoreElement = document.getElementById("score");
  scoreText.textContent = scoreElement ? scoreElement.textContent : "Score: 0";
  scoreText.style.fontSize = "32px";
  scoreText.style.marginBottom = "30px";

  const restartButton = document.createElement("button");
  restartButton.textContent = "Restart";
  restartButton.style.fontSize = "24px";
  restartButton.style.padding = "15px 40px";
  restartButton.style.backgroundColor = "#ff4444";
  restartButton.style.color = "white";
  restartButton.style.border = "none";
  restartButton.style.borderRadius = "10px";
  restartButton.style.cursor = "pointer";
  restartButton.style.transition = "background-color 0.3s";
  restartButton.addEventListener(
    "mouseenter",
    () => (restartButton.style.backgroundColor = "#ff6666")
  );
  restartButton.addEventListener(
    "mouseleave",
    () => (restartButton.style.backgroundColor = "#ff4444")
  );
  restartButton.addEventListener("click", () => window.location.reload());

  overlay.appendChild(gameOverText);
  overlay.appendChild(scoreText);
  overlay.appendChild(restartButton);
  document.body.appendChild(overlay);
}

export { hearts, heartTypes };