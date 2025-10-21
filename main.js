const path = window.location.pathname;

if (path === "/level3") {
  import("./Level3/main3.js")
    .then((level3) => {
      level3.startLevel3();
    })
    .catch((err) => console.error("Failed to load level:", err));
} else {
  console.error("Level not found");
}

function handleKeyDown(keyEvent) {
  if (keyEvent.keyCode === 37) {
    // left
    if (currentLane > leftLane) {
      currentLane -= 2;
    }
  } else if (keyEvent.keyCode === 39) {
    // right
    if (currentLane < rightLane) {
      currentLane += 2;
    }
  }
  //theto
  else if (keyEvent.keyCode === 38 && jump_can == 1) {
    //up
    jump_can = 0;
    velocity_y = 16;
  }
}

//pabi
function resetGame() {
  // remove all obstacles
  obstacles.forEach((o) => scene.remove(o));
  obstacles = [];
  currentLane = middleLane;
  heroSphere.position.set(currentLane, heroBaseY, 0);
  distance = 0;
}
