const path = window.location.pathname;

if (path === '/level3') {
    import('./Level3/main3.js').then(level3 => {
        level3.startLevel3();
    }).catch(err => console.error("Failed to load level:", err));
} else if (path === '/level2') {
    import('./Level2/main2.js').then(level2 => {
        level2.startLevel2();
    }).catch(err => console.error("Failed to load level:", err));
} else if (path === '/level1') {
    import('./Level1/main1.js').then(level1 => {
        level1.startLevel1();
    }).catch(err => console.error("Failed to load level:", err));
}
else if (path === '/' || path === '/index.html') {
  import('./mainmenu.js')
    .then(menu => {
      menu.createMenu3(() => {
        // when user clicks "START LEVEL 1"
        window.location.href = '/level1';
      });
    })
    .catch(err => console.error("Failed to load main menu:", err));

}  else {
  console.error("Level not found");
}
