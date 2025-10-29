import * as THREE from 'three';

let treeGroups = [];

export function addSideTrees(scene) {
    // Add variety of trees along the sides of the road
    for (let i = 0; i < 50; i++) {
        // Left side trees
        const leftTreeType = Math.floor(Math.random() * 4);
        const leftTree = createTree(leftTreeType);
        leftTree.position.x = -8 - Math.random() * 10;
        leftTree.position.z = -i * 4 + Math.random() * 8;
        leftTree.position.y = 0;
        scene.add(leftTree);
        treeGroups.push(leftTree);
        
        // Right side trees
        const rightTreeType = Math.floor(Math.random() * 4);
        const rightTree = createTree(rightTreeType);
        rightTree.position.x = 8 + Math.random() * 10;
        rightTree.position.z = -i * 4 + Math.random() * 8;
        rightTree.position.y = 0;
        scene.add(rightTree);
        treeGroups.push(rightTree);
    }
}

function createTree(treeType = 0) {
    const tree = new THREE.Group();
    const scale = 0.8 + Math.random() * 0.5; // more variation

    // Trunk with slight bend
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B5A2B, 
        roughness: 0.9,
        metalness: 0.0 
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.rotation.z = (Math.random() - 0.5) * 0.1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    switch (treeType) {
        case 0: // Round bushy tree
            for (let i = 0; i < 3; i++) {
                const leavesGeometry = new THREE.SphereGeometry(1.2, 10, 8);
                const leavesMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(0.33 + Math.random() * 0.05, 0.7, 0.4 + Math.random() * 0.2) 
                });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.set(
                    (Math.random() - 0.5) * 0.5,
                    2 + i * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                leaves.scale.setScalar(0.8 + Math.random() * 0.4);
                leaves.castShadow = true;
                leaves.receiveShadow = true;
                tree.add(leaves);
            }
            break;

        case 1: // Pine tree
            for (let i = 0; i < 4; i++) {
                const coneGeometry = new THREE.ConeGeometry(1.5 - i * 0.3, 1.5, 8);
                const coneMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(0.33, 0.6, 0.3 + i * 0.05) 
                });
                const cone = new THREE.Mesh(coneGeometry, coneMaterial);
                cone.position.y = 1.5 + i * 1.0;
                cone.castShadow = true;
                cone.receiveShadow = true;
                tree.add(cone);
            }
            break;

        case 2: // Palm tree
            trunk.scale.set(0.6, 2, 0.6);
            trunk.position.y = 2;

            for (let i = 0; i < 6; i++) {
                const frondGeometry = new THREE.PlaneGeometry(0.2, 2.5);
                const frondMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x32CD32, side: THREE.DoubleSide 
                });
                const frond = new THREE.Mesh(frondGeometry, frondMaterial);
                frond.position.y = 4;
                frond.rotation.x = -Math.PI / 3;
                frond.rotation.z = (i / 6) * Math.PI * 2;
                frond.scale.y = 1 + Math.random() * 0.3;
                frond.castShadow = true;
                frond.receiveShadow = true;
                tree.add(frond);
            }
            break;

        case 3: // Tall thin tree with oval top
            const thinTrunk = trunk.clone();
            thinTrunk.scale.set(0.5, 3, 0.5);
            thinTrunk.position.y = 3;
            tree.add(thinTrunk);

            const ovalLeavesGeometry = new THREE.SphereGeometry(1.2, 10, 8);
            ovalLeavesGeometry.scale(1, 1.5, 1);
            const ovalLeavesMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
            const ovalLeaves = new THREE.Mesh(ovalLeavesGeometry, ovalLeavesMaterial);
            ovalLeaves.position.y = 6;
            ovalLeaves.castShadow = true;
            ovalLeaves.receiveShadow = true;
            tree.add(ovalLeaves);
            break;
    }

    tree.scale.set(scale, scale, scale);
    return tree;
}

export { treeGroups };