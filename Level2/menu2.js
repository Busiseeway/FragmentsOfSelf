// menu.js
export function createMenu(onStartCallback) {
  // Create menu container
  const menu = document.createElement("div");
  menu.id = "gameMenu";
  menu.style.position = "absolute";
  menu.style.top = "50%";
  menu.style.left = "50%";
  menu.style.transform = "translate(-50%, -50%)";
  menu.style.backgroundColor = "rgba(0,0,0,0.7)";
  menu.style.color = "white";
  menu.style.padding = "20px";
  menu.style.borderRadius = "10px";
  menu.style.textAlign = "center";
  menu.style.zIndex = "1000";

  const title = document.createElement("h1");
  title.textContent = "Level 2";
  menu.appendChild(title);

  const startButton = document.createElement("button");
  startButton.textContent = "Start Game";
  startButton.style.marginTop = "10px";
  startButton.style.padding = "10px 20px";
  startButton.style.fontSize = "16px";
  menu.appendChild(startButton);

const mainmenuButton = document.createElement("button");
  startButton.textContent = "Main Menu";
  startButton.style.marginTop = "10px";
  startButton.style.padding = "10px 20px";
  startButton.style.fontSize = "16px";
  menu.appendChild(startButton);

  document.body.appendChild(menu);

  mainmenuButton.addEventListener("click", () => {
    document.body.removeChild(menu);
    if (onStartCallback) onStartCallback();
  });

}
