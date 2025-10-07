
let obstacles = [];
export function addRollingLogs(scene){
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
export function spawnBoulder(scene,heroSphere,leftLane,middleLane,rightLane) {
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
    

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
    
    // Calculate distance between hero and obstacle
    const dx = heroSphere.position.x - obs.position.x;
    const dy = heroSphere.position.y - obs.position.y;
    const dz = heroSphere.position.z - obs.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    //console.log(distance);
    if (distance<=1){
        return true;
    }
    }
    return false;
}
// Helper exports
export function getObstacles() {
  return obstacles;
}
export function updateObstacles(scene, rollingSpeed,heroBaseY){
         // Move and animate obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            //console.log(obs);
            // Logs (cylinders)
            if (obs.name==="boulder") {
               // console.log(obs);
              
               // Falling effect until it hits the ground
                if (obs.position.y > heroBaseY) {
                    obs.position.y -= 0.1;
                }
                obs.position.z += rollingSpeed;
                // // Make log roll
                // obs.rotation.x += 0.1;
            }
    
            // // Barricades (boxes) - they just sit still (no animation needed)
    
            // // Boulders (spheres) - roll faster than road
            
             else if(obs.name==="log"){
            obs.position.x -= (rollingSpeed*0.6); //rolling to the side but I want them to repeat
            obs.position.z += (rollingSpeed*1.25);
           // obs.position.z -= (rollingSpeed*1.5);
            }
            else{
                // Logs + barricades move at normal road speed
                obs.position.z += rollingSpeed;
            }
    
            // Remove obstacle if it goes past the camera
             if (obs.position.z > 10) {
                scene.remove(obs);
                obstacles.splice(i, 1);
            }
        }
}
export function clearObstacles(scene) {
  obstacles.forEach(obj => scene.remove(obj));
  obstacles = [];
}