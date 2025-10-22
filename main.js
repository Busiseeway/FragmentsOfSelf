const path = window.location.pathname;

if (path === "/level2") {
  import("./Level2/main2.js")
    .then((level2) => {
      level2.startLevel2();
    })
    .catch((err) => console.error("Failed to load level:", err));
} else {
  console.error("Level not found");
}
