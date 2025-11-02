// endingScene.js - Using separate hero file
import * as THREE from 'three';
import { addEndingHero, updateEndingHero, endingHero } from './endingHero.js';

// Detect base path
const basePath = window.location.pathname.includes('/home/sbitbybit')
  ? '/home/sbitbybit'
  : '';

// Helper function for navigation
function navigateTo(route) {
  const baseUrl = basePath ? `${basePath}/index.html` : '/index.html';
  window.location.href = `${baseUrl}?route=${route}`;
}

export function startEndingScene() {
    let scene, camera, renderer;
    let clock;

    init();
    animate();

    const listener = new THREE.AudioListener();
    const camera2 = new THREE.PerspectiveCamera();
    camera2.add(listener);
    const menuMusic = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/sounds/fast-rocky-loop-275535.mp3', buffer => {
        menuMusic.setBuffer(buffer);
        menuMusic.setLoop(true);
        menuMusic.setVolume(1.0);
        menuMusic.play();
    });

    function init() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a0a2e);
        scene.fog = new THREE.Fog(0x1a0a2e, 10, 100);

        // Setup camera - positioned to show hero looking at ocean
        camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(-3, 2, 3); // Behind and to the side of hero
        camera.lookAt(0, 1.5, -10); // Looking towards the ocean

        // Setup renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        clock = new THREE.Clock();

        // Add lighting
        addLights();

        // Create beach
        createBeach();

        // Create ocean
        createOcean();

        // Create planetary sky
        createPlanetarySky();

        // Add stars
        createStars();

        // Load hero with Standing clap animation
        addEndingHero(scene, () => {
            console.log("Hero ready for ending scene!");
        });

        // Add completion UI
        createCompletionUI();

        window.addEventListener('resize', onWindowResize);
    }

    function addLights() {
        // Ambient light for overall illumination
        const ambient = new THREE.AmbientLight(0x404080, 0.6);
        scene.add(ambient);

        // Directional light (moonlight)
        const moonLight = new THREE.DirectionalLight(0x9090ff, 0.8);
        moonLight.position.set(-5, 10, -5);
        moonLight.castShadow = true;
        moonLight.shadow.camera.left = -20;
        moonLight.shadow.camera.right = 20;
        moonLight.shadow.camera.top = 20;
        moonLight.shadow.camera.bottom = -20;
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        scene.add(moonLight);

        // Rim light for hero
        const rimLight = new THREE.DirectionalLight(0xffd700, 0.5);
        rimLight.position.set(3, 3, 3);
        scene.add(rimLight);

        // Ocean glow
        const oceanGlow = new THREE.PointLight(0x00ffff, 1, 30);
        oceanGlow.position.set(0, 1, -15);
        scene.add(oceanGlow);
    }

    function createBeach() {
        // Sand texture
        const sandGeometry = new THREE.PlaneGeometry(50, 30);
        const sandMaterial = new THREE.MeshStandardMaterial({
            color: 0xc2b280,
            roughness: 0.9,
            metalness: 0.1
        });
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        sand.rotation.x = -Math.PI / 2;
        sand.position.z = 5;
        sand.receiveShadow = true;
        scene.add(sand);

        // Add some beach rocks
        for (let i = 0; i < 40; i++) {
            const rockSize = Math.random() * 0.3 + 0.1;
            const rockGeometry = new THREE.DodecahedronGeometry(rockSize);
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.95
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                Math.random() * 20 - 10,
                rockSize * 0.5,
                Math.random() * 15 - 5
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);
        }
    }

    function createOcean() {
        const oceanGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const oceanMaterial = new THREE.MeshStandardMaterial({
            color: 0x0066aa,
            roughness: 0.2,
            metalness: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.z = -30;
        ocean.position.y = 0;
        scene.add(ocean);

        // Animate ocean waves
        ocean.userData.animate = (time) => {
            const positions = ocean.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                positions[i + 1] = Math.sin(x * 0.2 + time) * 0.3 + 
                                   Math.cos(z * 0.3 + time * 0.7) * 0.2;
            }
            ocean.geometry.attributes.position.needsUpdate = true;
            ocean.geometry.computeVertexNormals();
        };

        scene.userData.ocean = ocean;
    }

    function createPlanetarySky() {
        // Create multiple planets with emotion faces
        const planets = [
            { 
                size: 3, 
                color: 0xff6b9d, 
                position: [-15, 20, -40], 
                glow: 0xff1493,
                emotion: 'happy' // 😊
            },
            { 
                size: 2.5, 
                color: 0x9d8cff, 
                position: [10, 25, -45], 
                glow: 0x8a2be2,
                emotion: 'excited' // 😄
            },
            { 
                size: 1.8, 
                color: 0xffd700, 
                position: [0, 30, -50], 
                glow: 0xffa500,
                emotion: 'love' // 😍
            },
            { 
                size: 1.2, 
                color: 0x00ffff, 
                position: [-8, 18, -35], 
                glow: 0x00bfff,
                emotion: 'cool' // 😎
            }
        ];

        planets.forEach(planetData => {
            const planetGroup = new THREE.Group();
            
            // Create planet sphere
            const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
            const planetMaterial = new THREE.MeshStandardMaterial({
                color: planetData.color,
                emissive: planetData.color,
                emissiveIntensity: 0.3,
                roughness: 0.7
            });
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            planetGroup.add(planet);

            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(planetData.size * 1.3, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: planetData.glow,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            planet.add(glow);

            // Add emotion face
            addEmotionFace(planet, planetData.emotion, planetData.size);

            planetGroup.position.set(...planetData.position);
            scene.add(planetGroup);

            // Slow rotation
            planetGroup.userData.rotationSpeed = Math.random() * 0.0005 + 0.0002;
            planetGroup.userData.animate = (time) => {
                planetGroup.rotation.y += planetGroup.userData.rotationSpeed;
                // Gentle bobbing motion
                planetGroup.position.y = planetData.position[1] + Math.sin(time * 0.5 + planetData.position[0]) * 0.5;
            };

            scene.userData.planets = scene.userData.planets || [];
            scene.userData.planets.push(planetGroup);
        });
    }

    function addEmotionFace(planet, emotion, size) {
        const faceGroup = new THREE.Group();
        const scale = size / 3; // Scale features based on planet size
        
        // Create eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15 * scale, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        // Position eyes based on emotion
        if (emotion === 'happy' || emotion === 'love') {
            leftEye.position.set(-0.3 * scale, 0.3 * scale, size + 0.05);
            rightEye.position.set(0.3 * scale, 0.3 * scale, size + 0.05);
        } else if (emotion === 'excited') {
            leftEye.position.set(-0.3 * scale, 0.4 * scale, size + 0.05);
            rightEye.position.set(0.3 * scale, 0.4 * scale, size + 0.05);
            leftEye.scale.set(1.2, 1.2, 1);
            rightEye.scale.set(1.2, 1.2, 1);
        } else if (emotion === 'cool') {
            // Sunglasses style
            leftEye.scale.set(1.5, 0.8, 1);
            rightEye.scale.set(1.5, 0.8, 1);
            leftEye.position.set(-0.35 * scale, 0.3 * scale, size + 0.05);
            rightEye.position.set(0.35 * scale, 0.3 * scale, size + 0.05);
        }
        
        faceGroup.add(leftEye);
        faceGroup.add(rightEye);

        // Create mouth based on emotion
        const mouthCurve = new THREE.EllipseCurve(
            0, 0,
            0.5 * scale, 0.3 * scale,
            0, Math.PI,
            false,
            0
        );
        
        const mouthPoints = mouthCurve.getPoints(20);
        const mouthGeometry = new THREE.BufferGeometry().setFromPoints(mouthPoints);
        const mouthMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, 
            linewidth: 3 
        });
        const mouth = new THREE.Line(mouthGeometry, mouthMaterial);
        
        if (emotion === 'happy') {
            // Big smile
            mouth.position.set(0, -0.3 * scale, size + 0.05);
            mouth.rotation.z = Math.PI;
        } else if (emotion === 'excited') {
            // Wide open mouth
            mouth.position.set(0, -0.3 * scale, size + 0.05);
            mouth.rotation.z = Math.PI;
            mouth.scale.set(1.3, 1.5, 1);
        } else if (emotion === 'love') {
            // Smile with heart eyes
            mouth.position.set(0, -0.3 * scale, size + 0.05);
            mouth.rotation.z = Math.PI;
            
            // Replace eyes with hearts
            leftEye.visible = false;
            rightEye.visible = false;
            
            // Create heart shapes for eyes
            const heartShape = new THREE.Shape();
            heartShape.moveTo(0, 0);
            heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
            heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
            heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
            heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
            
            const heartGeometry = new THREE.ShapeGeometry(heartShape);
            const heartMaterial = new THREE.MeshBasicMaterial({ color: 0xff0066 });
            
            const leftHeart = new THREE.Mesh(heartGeometry, heartMaterial);
            leftHeart.scale.set(0.15 * scale, 0.15 * scale, 1);
            leftHeart.position.set(-0.3 * scale, 0.3 * scale, size + 0.05);
            leftHeart.rotation.z = Math.PI;
            
            const rightHeart = new THREE.Mesh(heartGeometry, heartMaterial);
            rightHeart.scale.set(0.15 * scale, 0.15 * scale, 1);
            rightHeart.position.set(0.3 * scale, 0.3 * scale, size + 0.05);
            rightHeart.rotation.z = Math.PI;
            
            faceGroup.add(leftHeart);
            faceGroup.add(rightHeart);
        } else if (emotion === 'cool') {
            // Cool smirk
            const smirkCurve = new THREE.QuadraticBezierCurve(
                new THREE.Vector2(-0.3 * scale, 0),
                new THREE.Vector2(0, -0.1 * scale),
                new THREE.Vector2(0.3 * scale, -0.2 * scale)
            );
            const smirkPoints = smirkCurve.getPoints(20);
            const smirkGeometry = new THREE.BufferGeometry().setFromPoints(smirkPoints);
            const smirk = new THREE.Line(smirkGeometry, mouthMaterial);
            smirk.position.set(0, -0.2 * scale, size + 0.05);
            faceGroup.add(smirk);
        }
        
        if (emotion !== 'cool') {
            faceGroup.add(mouth);
        }

        // Add eyebrows for excited emotion
        if (emotion === 'excited') {
            const browGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector2(-0.2 * scale, 0),
                new THREE.Vector2(0.2 * scale, 0.1 * scale)
            ]);
            const browMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
            
            const leftBrow = new THREE.Line(browGeometry, browMaterial);
            leftBrow.position.set(-0.3 * scale, 0.6 * scale, size + 0.05);
            
            const rightBrow = new THREE.Line(browGeometry, browMaterial);
            rightBrow.position.set(0.3 * scale, 0.6 * scale, size + 0.05);
            rightBrow.rotation.z = Math.PI / 6;
            
            faceGroup.add(leftBrow);
            faceGroup.add(rightBrow);
        }

        planet.add(faceGroup);
    }

    function createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = Math.random() * 100 + 10;
            positions[i + 2] = (Math.random() - 0.5) * 200 - 50;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
    }

    function createCompletionUI() {
        // Create overlay for completion message
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1000;
            animation: fadeIn 2s ease-in;
        `;

        const title = document.createElement('h1');
        title.textContent = 'JOURNEY COMPLETE';
        title.style.cssText = `
            color: #FFD700;
            font-size: 64px;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
                         0 0 40px rgba(255, 215, 0, 0.5);
            font-weight: bold;
            animation: glow 2s ease-in-out infinite alternate;
            font-family: Arial, sans-serif;
        `;

        const subtitle = document.createElement('p');
        subtitle.textContent = 'You conquered all challenges and found your path';
        subtitle.style.cssText = `
            color: white;
            font-size: 24px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            margin-bottom: 40px;
            font-family: Arial, sans-serif;
        `;

        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'PLAY AGAIN';
        restartBtn.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 50px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            font-family: Arial, sans-serif;
        `;

        restartBtn.addEventListener('mouseover', () => {
            restartBtn.style.transform = 'scale(1.1)';
            restartBtn.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)';
        });

        restartBtn.addEventListener('mouseout', () => {
            restartBtn.style.transform = 'scale(1)';
            restartBtn.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.4)';
        });

        restartBtn.addEventListener('click', () => {
            console.log('Current pathname:', window.location.pathname);
            console.log('Detected basePath:', basePath);
            const baseUrl = basePath ? `${basePath}/index.html` : '/index.html';
            const fullUrl = `${baseUrl}?route=/level1`;
            console.log('Navigating to:', fullUrl);
            window.location.href = fullUrl;
        });

        overlay.appendChild(title);
        overlay.appendChild(subtitle);
        overlay.appendChild(restartBtn);
        document.body.appendChild(overlay);

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes glow {
                from { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5); }
                to { text-shadow: 0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.8); }
            }
        `;
        document.head.appendChild(style);
    }

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Update hero animation
        updateEndingHero(delta);

        // Animate ocean waves
        if (scene.userData.ocean) {
            scene.userData.ocean.userData.animate(time);
        }

        // Rotate planets
        if (scene.userData.planets) {
            scene.userData.planets.forEach(planet => {
                planet.userData.animate(time);
            });
        }

        // Gentle camera sway
        camera.position.x = -3 + Math.sin(time * 0.2) * 0.3;
        camera.position.y = 2 + Math.sin(time * 0.3) * 0.2;

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}