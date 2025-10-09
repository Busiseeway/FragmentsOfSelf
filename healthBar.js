import { getObstacles, checkObstacleCollision } from './obstaclesL3.js';

let hearts = [];
const heartTypes = [{ symbol: '❤️', name: "Full" }];

// Short invulnerability after getting hit
let canTakeDamage = true;
const damageCooldown = 1000;
let lastCollisionTime = 0;

export function addHearts(count = 5) {
  const heartsContainer = document.createElement('div');
  heartsContainer.id = 'hearts-container';
  heartsContainer.style.position = 'absolute';
  heartsContainer.style.top = '20px';
  heartsContainer.style.right = '20px';
  heartsContainer.style.display = 'flex';
  heartsContainer.style.gap = '10px';
  heartsContainer.style.zIndex = '1000';

  for (let i = 0; i < count; i++) {
    const type = heartTypes[0];
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = type.symbol;
    heart.style.fontSize = '32px';
    heart.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
    heart.style.transition = 'transform 0.2s, opacity 0.5s';
    heart.style.cursor = 'pointer';

    // Hover effect
    heart.addEventListener('mouseenter', () => (heart.style.transform = 'scale(1.2)'));
    heart.addEventListener('mouseleave', () => (heart.style.transform = 'scale(1)'));

    heartsContainer.appendChild(heart);
    hearts.push(heart);
  }

  document.body.appendChild(heartsContainer);
}

function takeDamage(heroSphere, heroBaseY, scene) {
  if (!canTakeDamage) return;

  removeHeart();
  canTakeDamage = false;

  // Flash red briefly
  const originalColor = heroSphere.material.color.getHex();
  heroSphere.material.color.setHex(0xff0000);
  setTimeout(() => heroSphere.material.color.setHex(originalColor), 200);

  // Reset hero position (prevent floating)
  heroSphere.position.y = heroBaseY;

  // Re-enable damage after cooldown
  setTimeout(() => (canTakeDamage = true), damageCooldown);

  if (getRemainingHearts() === 0) {
    gameOver();
  }
}

//For obstacles
export function checkCollisions(heroSphere, heroBaseY, scene) {
  if (!canTakeDamage) return;

  if (checkObstacleCollision(heroSphere, heroBaseY)) {
    const currentTime = Date.now();
    if (currentTime - lastCollisionTime > 100) {
      const obstacles = getObstacles();

      // Find and remove obstacle that was hit
      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        const dx = heroSphere.position.x - obs.position.x;
        const dy = heroSphere.position.y - obs.position.y;
        const dz = heroSphere.position.z - obs.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 1.2) {
          scene.remove(obs);
          obstacles.splice(i, 1);
          break;
        }
      }

      takeDamage(heroSphere, heroBaseY, scene);
      lastCollisionTime = currentTime;
    }
  }
}

//hitting edges
export function takeLanePenalty(heroSphere, direction) {
  console.log("Boundary hit! Lost a heart.");

  removeHeart();

  // Flash red
  const originalColor = heroSphere.material.color.getHex();
  heroSphere.material.color.setHex(0xff0000);
  setTimeout(() => heroSphere.material.color.setHex(originalColor), 200);

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
    heart.style.opacity = '0';
    heart.style.transform = 'scale(1.5) rotate(20deg)';
    setTimeout(() => heart.remove(), 500);
  }
}

export function getRemainingHearts() {
  return hearts.length;
}

export function resetHearts() {
  hearts.forEach(h => h.remove());
  hearts = [];
  const container = document.getElementById('hearts-container');
  if (container) container.remove();
  addHearts(5);
}

export function gameOver() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '10000';
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'Arial, sans-serif';

  const gameOverText = document.createElement('h1');
  gameOverText.textContent = 'Game Over!';
  gameOverText.style.fontSize = '64px';
  gameOverText.style.marginBottom = '20px';
  gameOverText.style.textShadow = '4px 4px 8px rgba(0,0,0,0.8)';

  const scoreText = document.createElement('p');
  const scoreElement = document.getElementById('score');
  scoreText.textContent = scoreElement ? scoreElement.textContent : 'Score: 0';
  scoreText.style.fontSize = '32px';
  scoreText.style.marginBottom = '30px';

  const restartButton = document.createElement('button');
  restartButton.textContent = 'Restart';
  restartButton.style.fontSize = '24px';
  restartButton.style.padding = '15px 40px';
  restartButton.style.backgroundColor = '#ff4444';
  restartButton.style.color = 'white';
  restartButton.style.border = 'none';
  restartButton.style.borderRadius = '10px';
  restartButton.style.cursor = 'pointer';
  restartButton.style.transition = 'background-color 0.3s';
  restartButton.addEventListener('mouseenter', () => (restartButton.style.backgroundColor = '#ff6666'));
  restartButton.addEventListener('mouseleave', () => (restartButton.style.backgroundColor = '#ff4444'));
  restartButton.addEventListener('click', () => window.location.reload());

  overlay.appendChild(gameOverText);
  overlay.appendChild(scoreText);
  overlay.appendChild(restartButton);
  document.body.appendChild(overlay);
}

export { hearts, heartTypes };
