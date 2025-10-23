const path = window.location.pathname;

if (path === "/level1") {
  import("./Level1/main1.js")
    .then((level1) => {
      level1.startLevel1();
    })
    .catch((err) => console.error("Failed to load level:", err));
} else {
  console.error("Level not found");
}
