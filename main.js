const path = window.location.pathname;

if (path === '/level3') {
    import('./Level3/main3.js').then(level3 => {
        level3.startLevel3();
    }).catch(err => console.error("Failed to load level:", err));
} else {
    console.error("Level not found");
}

if (path === '/level2') {
    import('./Level2/main2.js').then(level2 => {
        level2.startLevel2();
    }).catch(err => console.error("Failed to load level:", err));
} else {
    console.error("Level not found");
}