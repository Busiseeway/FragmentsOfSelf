// menu3.js

// Detect base path
const basePath = window.location.pathname.includes('/home/sbitbybit')
  ? '/home/sbitbybit'
  : '';

// Helper function for navigation
function navigateTo(route) {
  const baseUrl = basePath ? `${basePath}/index.html` : '/index.html';
  window.location.href = `${baseUrl}?route=${route}`;
}

export function createMenu3(onStartCallback) {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "start-menu";
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
  const menuContainer = document.createElement("div");
  menuContainer.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      max-width: 400px;
  `;

  // Title
  const title = document.createElement("h1");
  title.textContent = "Level 3: The Final Lap";
  title.style.cssText = `
      color: white;
      font-size: 32px;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;

  // Instructions
  const instructions = document.createElement("div");
  instructions.innerHTML = `
      <p style="color: white; font-size: 16px; margin: 15px 0;">
          <strong>Controls:</strong><br>
          ← → Arrow keys to change lanes<br>
          ↑ Arrow key to jump<br>
          ↓ Arrow key to slide<br>
          v To change camera view<br>
      </p>
      <p style="color: #FFD700; font-size: 18px; margin: 15px 0;">
          The picture is getting more clear, the monster is starting to remember. It's getting harder to collect the emotions. FOCUS, collect them all!
      </p>
  `;

  // Start button
  const startButton = document.createElement("button");
  startButton.textContent = "START LEVEL 3";
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

  startButton.addEventListener("mouseover", () => {
    startButton.style.transform = "scale(1.1)";
    startButton.style.boxShadow = "0 5px 20px rgba(255, 215, 0, 0.5)";
  });

  startButton.addEventListener("mouseout", () => {
    startButton.style.transform = "scale(1)";
    startButton.style.boxShadow = "none";
  });

  startButton.addEventListener("click", () => {
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

export function createLevel1CompleteMenu() {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "level1-complete-menu";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;

  // Container
  const menuContainer = document.createElement("div");
  menuContainer.style.cssText = `
    background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    max-width: 400px;
  `;

  // Title
  const title = document.createElement("h1");
  title.textContent = "🎉 Level 1 Complete!";
  title.style.cssText = `
    color: white;
    font-size: 36px;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;

  // Message
  const message = document.createElement("p");
  message.innerHTML = `
    <span style="color: #FFD700; font-size: 18px;">
      You've conquered the storm! 🌩️<br>
      Ready for the next challenge?
    </span>
  `;
  message.style.marginBottom = "30px";

  // Buttons
  const nextLevelBtn = document.createElement("button");
  nextLevelBtn.textContent = "GO TO LEVEL 2";
  styleMenuButton(nextLevelBtn);
  nextLevelBtn.addEventListener("click", () => {
    navigateTo('/level2');
  });

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "RESTART LEVEL 1";
  styleMenuButton(restartBtn);
  restartBtn.addEventListener("click", () => {
    navigateTo('/level1');
  });

  const mainMenuBtn = document.createElement("button");
  mainMenuBtn.textContent = "MAIN MENU";
  styleMenuButton(mainMenuBtn);
  mainMenuBtn.addEventListener("click", () => {
    const baseUrl = basePath ? `${basePath}/index.html` : '/index.html';
    window.location.href = baseUrl;
  });

  // Assemble menu
  menuContainer.appendChild(title);
  menuContainer.appendChild(message);
  menuContainer.appendChild(nextLevelBtn);
  menuContainer.appendChild(restartBtn);
  menuContainer.appendChild(mainMenuBtn);
  overlay.appendChild(menuContainer);
  document.body.appendChild(overlay);

  // Helper for consistent button style
  function styleMenuButton(btn) {
    btn.style.cssText = `
      background: #FFD700;
      color: #333;
      border: none;
      padding: 15px 40px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 15px;
      transition: transform 0.2s, box-shadow 0.2s;
      display: block;
      width: 100%;
    `;
    btn.addEventListener("mouseover", () => {
      btn.style.transform = "scale(1.1)";
      btn.style.boxShadow = "0 5px 20px rgba(255, 215, 0, 0.5)";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "none";
    });
  }
}

// Export for Level 2 Complete Menu
export function createLevel2CompleteMenu() {
  const overlay = document.createElement("div");
  overlay.id = "level2-complete-menu";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;

  const menuContainer = document.createElement("div");
  menuContainer.style.cssText = `
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    max-width: 400px;
  `;

  const title = document.createElement("h1");
  title.textContent = "🎉 Level 2 Complete!";
  title.style.cssText = `
    color: white;
    font-size: 36px;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;

  const message = document.createElement("p");
  message.innerHTML = `
    <span style="color: #FFD700; font-size: 18px;">
      Excellent work! 🔥<br>
      One more level to go!
    </span>
  `;
  message.style.marginBottom = "30px";

  const nextLevelBtn = document.createElement("button");
  nextLevelBtn.textContent = "GO TO LEVEL 3";
  styleMenuButton(nextLevelBtn);
  nextLevelBtn.addEventListener("click", () => {
    navigateTo('/level3');
  });

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "RESTART LEVEL 2";
  styleMenuButton(restartBtn);
  restartBtn.addEventListener("click", () => {
    navigateTo('/level2');
  });

  const mainMenuBtn = document.createElement("button");
  mainMenuBtn.textContent = "MAIN MENU";
  styleMenuButton(mainMenuBtn);
  mainMenuBtn.addEventListener("click", () => {
    const baseUrl = basePath ? `${basePath}/index.html` : '/index.html';
    window.location.href = baseUrl;
  });

  menuContainer.appendChild(title);
  menuContainer.appendChild(message);
  menuContainer.appendChild(nextLevelBtn);
  menuContainer.appendChild(restartBtn);
  menuContainer.appendChild(mainMenuBtn);
  overlay.appendChild(menuContainer);
  document.body.appendChild(overlay);

  function styleMenuButton(btn) {
    btn.style.cssText = `
      background: #FFD700;
      color: #333;
      border: none;
      padding: 15px 40px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 15px;
      transition: transform 0.2s, box-shadow 0.2s;
      display: block;
      width: 100%;
    `;
    btn.addEventListener("mouseover", () => {
      btn.style.transform = "scale(1.1)";
      btn.style.boxShadow = "0 5px 20px rgba(255, 215, 0, 0.5)";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "none";
    });
  }
}

// Export for Level 3 Complete Menu
export function createLevel3CompleteMenu() {
  const overlay = document.createElement("div");
  overlay.id = "level3-complete-menu";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;

  const menuContainer = document.createElement("div");
  menuContainer.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    max-width: 400px;
  `;

  const title = document.createElement("h1");
  title.textContent = "🎉 Level 3 Complete!";
  title.style.cssText = `
    color: white;
    font-size: 36px;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;

  const message = document.createElement("p");
  message.innerHTML = `
    <span style="color: #FFD700; font-size: 18px;">
      Amazing! You've completed all levels! 🏆<br>
      The monster remembers everything now.
    </span>
  `;
  message.style.marginBottom = "30px";

  const endingBtn = document.createElement("button");
  endingBtn.textContent = "VIEW ENDING";
  styleMenuButton(endingBtn);
  endingBtn.addEventListener("click", () => {
    navigateTo('/ending');
  });

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "RESTART LEVEL 3";
  styleMenuButton(restartBtn);
  restartBtn.addEventListener("click", () => {
    navigateTo('/level3');
  });

  const mainMenuBtn = document.createElement("button");
  mainMenuBtn.textContent = "MAIN MENU";
  styleMenuButton(mainMenuBtn);
  mainMenuBtn.addEventListener("click", () => {
    const baseUrl = basePath ? `${basePath}/index.html` : '/index.html';
    window.location.href = baseUrl;
  });

  menuContainer.appendChild(title);
  menuContainer.appendChild(message);
  menuContainer.appendChild(endingBtn);
  menuContainer.appendChild(restartBtn);
  menuContainer.appendChild(mainMenuBtn);
  overlay.appendChild(menuContainer);
  document.body.appendChild(overlay);

  function styleMenuButton(btn) {
    btn.style.cssText = `
      background: #FFD700;
      color: #333;
      border: none;
      padding: 15px 40px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 15px;
      transition: transform 0.2s, box-shadow 0.2s;
      display: block;
      width: 100%;
    `;
    btn.addEventListener("mouseover", () => {
      btn.style.transform = "scale(1.1)";
      btn.style.boxShadow = "0 5px 20px rgba(255, 215, 0, 0.5)";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "none";
    });
  }
}