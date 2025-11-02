// menu3.js
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

export function createLevel3CompleteMenu() {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "level3-complete-menu";
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
    z-index: 2000;
  `;

  // Container - Same gradient as start menu
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
  title.textContent = "🎉 Level 3 Complete!";
  title.style.cssText = `
    color: white;
    font-size: 32px;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;

  // Message
  const message = document.createElement("div");
  message.innerHTML = `
    <p style="color: #FFD700; font-size: 18px; margin: 15px 0;">
      Congratulations! You've conquered the final lap! 🏁<br>
      You have found yourself.
    </p>
  `;

  // Restart button
  const restartBtn = document.createElement("button");
  restartBtn.textContent = "RESTART LEVEL 3";
  restartBtn.style.cssText = `
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
    display: block;
    width: 100%;
  `;

  restartBtn.addEventListener("mouseover", () => {
    restartBtn.style.transform = "scale(1.1)";
    restartBtn.style.boxShadow = "0 5px 20px rgba(255, 215, 0, 0.5)";
  });

  restartBtn.addEventListener("mouseout", () => {
    restartBtn.style.transform = "scale(1)";
    restartBtn.style.boxShadow = "none";
  });

  restartBtn.addEventListener("click", () => {
    window.location.reload();
  });

  // Main Menu button
  const mainMenuBtn = document.createElement("button");
  mainMenuBtn.textContent = "MAIN MENU";
  mainMenuBtn.style.cssText = `
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

  mainMenuBtn.addEventListener("mouseover", () => {
    mainMenuBtn.style.transform = "scale(1.1)";
    mainMenuBtn.style.boxShadow = "0 5px 20px rgba(255, 215, 0, 0.5)";
  });

  mainMenuBtn.addEventListener("mouseout", () => {
    mainMenuBtn.style.transform = "scale(1)";
    mainMenuBtn.style.boxShadow = "none";
  });

  mainMenuBtn.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // Assemble menu
  menuContainer.appendChild(title);
  menuContainer.appendChild(message);
  menuContainer.appendChild(restartBtn);
  menuContainer.appendChild(mainMenuBtn);
  overlay.appendChild(menuContainer);
  document.body.appendChild(overlay);
}
