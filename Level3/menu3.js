// menu3.js
export function createMenu3(onStartCallback) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'start-menu';
  overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  `;

  // Create menu container
  const menuContainer = document.createElement('div');
  menuContainer.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      max-width: 400px;
  `;

  // Title
  const title = document.createElement('h1');
  title.textContent = 'Level 3: The Final Lap';
  title.style.cssText = `
      color: white;
      font-size: 32px;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;

  // Instructions
  const instructions = document.createElement('div');
  instructions.innerHTML = `
      
      <p style="color: #FFD700; font-size: 18px; margin: 15px 0;">
          The picture is getting more clear, the monster is starting to remember. It's getting harder to collect the emotions. FOCUS, collect them all!
      </p>
  `;

  // Start button
  const startButton = document.createElement('button');
  startButton.textContent = 'START LEVEL 3';
  startButton.style.cssText = `
      background: #FFD700;
      color: #333;
      border: none;
      padding: 15px 40px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
  `;

  startButton.addEventListener('mouseover', () => {
      startButton.style.transform = 'scale(1.1)';
      startButton.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.5)';
  });

  startButton.addEventListener('mouseout', () => {
      startButton.style.transform = 'scale(1)';
      startButton.style.boxShadow = 'none';
  });

  startButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      if (onStartCallback) onStartCallback();
  });

  // Assemble menu
  menuContainer.appendChild(title);
  menuContainer.appendChild(instructions);
  menuContainer.appendChild(startButton);
  overlay.appendChild(menuContainer);
  document.body.appendChild(overlay);
}
