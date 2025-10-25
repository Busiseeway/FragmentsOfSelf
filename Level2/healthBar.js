import * as THREE from "three";
import { getObstacles, checkCollisions2 } from "./obstacles.js";

let hearts = [];
const heartTypes = [{ symbol: "❤️", name: "Full" }];

// Short invulnerability after getting hit
let canTakeDamage = true;
const damageCooldown = 1000;
let lastCollisionTime = 0;

// Add hearts to the screen
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

    heart.addEventListener("mouseenter", () => {
      heart.style.transform = "scale(1.2)";
    });
    heart.addEventListener("mouseleave", () => {
      heart.style.transform = "scale(1)";
    });

    heartsContainer.appendChild(heart);
    hearts.push(heart);
  }

  document.body.appendChild(heartsContainer);
}

// Check collisions with obstacles
export function checkCollisions(heroSphere, heroBaseY, scene) {
  if (!canTakeDamage) return;

  if (checkCollisions2(heroSphere)) {
    const currentTime = Date.now();

    if (currentTime - lastCollisionTime > 100) {
      handleCollision(heroSphere, heroBaseY, scene);
      lastCollisionTime = currentTime;
    }
  }
}

// Handle collision with an obstacle
function handleCollision(heroSphere, heroBaseY, scene) {
  const obstacles = getObstacles();
  let hitObstacle = null;

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const obsBox = new THREE.Box3().setFromObject(obs);
    const heroBox = new THREE.Box3().setFromCenterAndSize(
      heroSphere.position.clone(),
      new THREE.Vector3(1, 1, 1)
    );

    if (heroBox.intersectsBox(obsBox)) {
      hitObstacle = obs;
      break;
    }
  }

  if (hitObstacle && hitObstacle.parent) {
    createExplosion(hitObstacle.position.clone(), scene);

    const index = obstacles.indexOf(hitObstacle);
    if (index > -1) obstacles.splice(index, 1);
    scene.remove(hitObstacle);
  }

  removeHeart();
  canTakeDamage = false;
  setTimeout(() => {
    canTakeDamage = true;
  }, damageCooldown);

  heroSphere.position.y = heroBaseY;

  // Flash hero red safely
  flashHero(heroSphere);

  if (getRemainingHearts() === 0) {
    gameOver();
  }
}

// Flash the hero red without errors for GLTF Group
function flashHero(heroSphere) {
  heroSphere.traverse((child) => {
    if (child.isMesh && child.material && child.material.color) {
      const originalColor = child.material.color.getHex();
      child.material.color.setHex(0xff0000);
      setTimeout(() => {
        child.material.color.setHex(originalColor);
      }, 200);
    }
  });
}

// Create simple explosion effect
function createExplosion(position, scene) {
  const particles = [];
  const particleCount = 20;
  const geometry = new THREE.SphereGeometry(0.05, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 });

  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);
    particle.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 0.5
    );
    scene.add(particle);
    particles.push(particle);
  }

  const duration = 500;
  const startTime = Date.now();

  function animateExplosion() {
    const elapsed = Date.now() - startTime;
    if (elapsed < duration) {
      particles.forEach((p) => {
        p.position.add(p.velocity);
        p.material.opacity = 1 - elapsed / duration;
        p.material.transparent = true;
      });
      requestAnimationFrame(animateExplosion);
    } else {
      particles.forEach((p) => scene.remove(p));
    }
  }

  animateExplosion();
}

// Remove a heart visually
export function removeHeart() {
  if (hearts.length > 0) {
    const heart = hearts.pop();
    heart.style.opacity = "0";
    heart.style.transform = "scale(1.5) rotate(20deg)";
    setTimeout(() => heart.remove(), 500);
  }
}

// Get remaining hearts count
export function getRemainingHearts() {
  return hearts.length;
}

// Reset hearts
export function resetHearts() {
  hearts.forEach((heart) => heart.remove());
  hearts = [];

  const container = document.getElementById("hearts-container");
  if (container) container.remove();

  addHearts(5);
}

// Game over overlay
function gameOver() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
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

  restartButton.addEventListener("mouseenter", () => {
    restartButton.style.backgroundColor = "#ff6666";
  });
  restartButton.addEventListener("mouseleave", () => {
    restartButton.style.backgroundColor = "#ff4444";
  });
  restartButton.addEventListener("click", () => {
    window.location.reload();
  });

  overlay.appendChild(gameOverText);
  overlay.appendChild(scoreText);
  overlay.appendChild(restartButton);
  document.body.appendChild(overlay);
}

export { hearts, heartTypes };
