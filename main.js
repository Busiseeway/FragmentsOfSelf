//main.js
const basePath = window.location.pathname.includes('/home/sbitbybit')
  ? '/home/sbitbybit'
  : '';

// Function to navigate with correct base path
function goTo(relativePath) {

  const targetPath = `${basePath}${relativePath}`;
  window.location.href = `${basePath}/index.html?route=${relativePath}`;
}

const fullPath = window.location.pathname;
let path = fullPath;

// Remove base path if present
if (basePath && fullPath.startsWith(basePath)) {
  path = fullPath.substring(basePath.length);
}

// Ensure path starts with /
if (!path.startsWith('/')) {
  path = '/' + path;
}

// Check for query parameter route (for internal navigation)
const urlParams = new URLSearchParams(window.location.search);
const routeParam = urlParams.get('route');

// If we have a route parameter, use that instead
if (routeParam) {
  path = routeParam;
  console.log('Using route parameter:', path);
}

console.log('Full path:', fullPath);
console.log('Base path:', basePath);
console.log('Relative path:', path);

// Route to appropriate level
if (path === '/level3' || path === '/level3.html') {
  console.log('Loading Level 3...');
  import('./Level3/main3.js').then(level3 => level3.startLevel3());
} else if (path === '/level2' || path === '/level2.html') {
  console.log('Loading Level 2...');
  import('./Level2/main2.js').then(level2 => level2.startLevel2());
} else if (path === '/level1' || path === '/level1.html') {
  console.log('Loading Level 1...');
  import('./Level1/main1.js').then(level1 => level1.startLevel1());
} else if (path === '/ending' || path === '/ending.html') {
  console.log('Loading Ending...');
  import('./ending.js').then(ending => ending.startEndingScene());
} else if (path === '/' || path === '/index.html' || path === '' || path === '/index') {
  console.log('Loading Main Menu...');
  import('./mainmenu.js')
    .then(menu => {
      menu.createMenu3(() => goTo('/level1'));
    })
    .catch(err => console.error("Failed to load main menu:", err));
} else {
  console.error("Level not found:", path);
  console.log('Falling back to Main Menu...');
  // Fallback to main menu
  import('./mainmenu.js')
    .then(menu => {
      menu.createMenu3(() => goTo('/level1'));
    })
    .catch(err => console.error("Failed to load main menu:", err));
}