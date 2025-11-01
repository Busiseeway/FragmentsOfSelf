const path = window.location.pathname;

function goTo(path) {
    // Update the URL without reloading
    history.pushState({}, "", path);
    loadCurrentPath();
}

function loadCurrentPath() {
    const path = window.location.pathname;

    if (path.endsWith('/level3')) {
        import('./Level3/main3.js').then(level3 =>
            level3.startLevel3(() => goTo('/ending'))
        );
    } else if (path.endsWith('/level2')) {
        import('./Level2/main2.js').then(level2 =>
            level2.startLevel2(() => goTo('/level3'))
        );
    } else if (path.endsWith('/level1')) {
        import('./Level1/main1.js').then(level1 =>
            level1.startLevel1(() => goTo('/level2'))
        );
    } else if (path.endsWith('/ending')) {
        import('./ending.js').then(ending => ending.startEndingScene());
    } else if (path.endsWith('/') || path.endsWith('/index.html')) {
        import('./mainmenu.js').then(menu => {
            menu.createMenu3(() => {
                goTo('/level1');
            });
        });
    } else {
        console.error("Level not found:", path);
    }
}

// Handle browser back/forward
window.addEventListener('popstate', loadCurrentPath);

// Initial load
loadCurrentPath();
