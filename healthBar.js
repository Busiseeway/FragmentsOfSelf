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
    heart.addEventListener('mouseenter', () => {
      heart.style.transform = 'scale(1.2)';
    });
    heart.addEventListener('mouseleave', () => {
      heart.style.transform = 'scale(1)';
    });

    heartsContainer.appendChild(heart);
    hearts.push(heart);
  }

  document.body.appendChild(heartsContainer);
}


export function checkCollisions(heroSphere, heroBaseY, scene) {
  if (!canTakeDamage) return;

  // Use the collision detection from obstaclesL3.js
  if (checkObstacleCollision(heroSphere, heroBaseY)) {
    const currentTime = Date.now();
    
    // Ensure we don't process the same collision multiple times
    if (currentTime - lastCollisionTime > 100) { // 100ms debounce
      handleCollision(heroSphere, heroBaseY, scene);
      lastCollisionTime = currentTime;
    }
  }
}

function handleCollision(heroSphere, heroBaseY, scene) {
  // Get obstacles array and find which one we hit
  const obstacles = getObstacles();
  let hitObstacle = null;

  // Find the closest obstacle that we're colliding with
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const dx = heroSphere.position.x - obs.position.x;
    const dy = heroSphere.position.y - obs.position.y;
    const dz = heroSphere.position.z - obs.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance < 1.5) { // Close enough to be the collision
      hitObstacle = obs;
      break;
    }
  }

  // Remove the obstacle that was hit
  if (hitObstacle && hitObstacle.parent) {
    scene.remove(hitObstacle);
    const index = obstacles.indexOf(hitObstacle);
    if (index > -1) {
      obstacles.splice(index, 1);
    }
  }

  // Remove a heart
  removeHeart();

  // Trigger invulnerability for a short period
  canTakeDamage = false;
  setTimeout(() => {
    canTakeDamage = true;
  }, damageCooldown);

  // Reset hero Y position to ground
  heroSphere.position.y = heroBaseY;

  // Visual feedback - make hero flash
  // const originalColor = heroSphere.material.color.getHex();
  // heroSphere.material.color.setHex(0xff0000); // Flash red
  // setTimeout(() => {
  //   heroSphere.material.color.setHex(originalColor);
  // }, 200);

  // Visual feedback - make hero flash (for GLTF models)
heroSphere.traverse(node => {
  if (node.isMesh && node.material && node.material.color) {
    const originalColor = node.material.color.clone();
    node.material.color.setHex(0xff0000);
    setTimeout(() => {
      node.material.color.copy(originalColor);
    }, 200);
  }
});


  //Game over
  if (getRemainingHearts() === 0) {
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
  // Remove all existing hearts from DOM
  hearts.forEach(heart => heart.remove());
  hearts = [];
  
  // Remove container if it exists
  const container = document.getElementById('hearts-container');
  if (container) {
    container.remove();
  }
  
  // Re-add hearts
  addHearts(5);
}

function gameOver() {
  // Create game over overlay
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

  restartButton.addEventListener('mouseenter', () => {
    restartButton.style.backgroundColor = '#ff6666';
  });
  restartButton.addEventListener('mouseleave', () => {
    restartButton.style.backgroundColor = '#ff4444';
  });
  restartButton.addEventListener('click', () => {
    window.location.reload();
  });

  overlay.appendChild(gameOverText);
  overlay.appendChild(scoreText);
  overlay.appendChild(restartButton);
  document.body.appendChild(overlay);
}

export { hearts, heartTypes };