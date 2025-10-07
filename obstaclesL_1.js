import * as THREE from 'three';

export function addRollingLogs(){
 //I want these to  be rolling from left to right
    //Disappear them when they are no longer on the road

        //add Texture
       const texture = new THREE.TextureLoader().load( 'textures.top-view-tree-bark.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 4, 4 );



        const logGeometry = new THREE.CylinderGeometry( 0.3, 0.3, 3, 20 ); 
        const logMaterial = new THREE.MeshStandardMaterial( {color: 0xffff00, map:texture}); 
        const log = new THREE.Mesh( logGeometry, logMaterial ); 
        log.position.x = 5+Math.random() * 10;
        log.position.z =  -20+Math.random() * 8;
        log.name = 'log';
        // cylinder.position.y = 0;
        log.castShadow=true;
        log.receiveShadow = true;
        scene.add( log );
        obstacles.push(log);
    
}
//got code from Pabi
export function spawnBoulder(heroSphere) {
    const lanes = [leftLane, middleLane, rightLane];
    const radius = 0.7; // size of boulder
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const boulder = new THREE.Mesh(geometry, material);
    boulder.name = 'boulder';

   // Pick a random lane
    
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    // Position the obstacle above road so it can "fall"
    boulder.position.set(lane, 6, heroSphere.position.z - 30);

    boulder.castShadow = true;
    boulder.receiveShadow = true;

    scene.add(boulder);
    obstacles.push(boulder);
}
//from pabi
export function checkObsCollisions(heroSphere) {
    const heroBB = new THREE.Box3().setFromObject(heroSphere);

    for (let i = 0; i < obstacles.length; i++) {
        const obsBB = new THREE.Box3().setFromObject(obstacles[i]);
        if (heroBB.intersectsBox(obsBB)) {
            
            return true;
        }
    }
}