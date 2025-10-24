const path = window.location.pathname;

if (path === '/level3') {
    import('./Level3/main3.js').then(level3 => {
        level3.startLevel3();
    }).catch(err => console.error("Failed to load level:", err));
} 

else if (path === "/level1") {
  import("./Level1/main1.js")
    .then((level1) => {
      level1.startLevel1();
    })
    .catch((err) => console.error("Failed to load level:", err));
} else {
  console.error("Level not found");
}
