import * as THREE from 'three';

class EnvironmentBuilder {
  constructor(materialFactory) {
    this.materialFactory = materialFactory;
    this.group = new THREE.Group();
  }

  build() {
    this.createGround();
    this.createTree(-5, 3);
    this.createTree(5, 3);
    this.createCloud(-8, 8, 0);
    this.createCloud(8, 8, -3);
    
    console.log('[EnvironmentBuilder] Environment created successfully');
    return this.group;
  }

  createTree(x, z) {
    const treeGroup = new THREE.Group();

    // Tronco: CylinderGeometry(radius, radiusTop, height, radialSegments)
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
    const trunkMaterial = this.materialFactory.createTrunk();
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.75;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    // Copa: ConeGeometry (8 segmentos para bordes suaves)
    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMaterial = this.materialFactory.createLeaves();
    
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 2.5;
    leaves.castShadow = true;
    leaves.receiveShadow = true;

    treeGroup.add(trunk);
    treeGroup.add(leaves);
    treeGroup.position.set(x, 0, z);
    treeGroup.userData = { type: 'tree' };

    this.group.add(treeGroup);
    return treeGroup;
  }

  createCloud(x, y, z) {
    const cloudGroup = new THREE.Group();
    const cloudMaterial = this.materialFactory.createCloud();

    // Posiciones relativas de cubos que forman la nube
    const cloudShape = [
      { pos: [0, 0, 0], scale: 1 },
      { pos: [0.8, 0.2, 0], scale: 0.9 },
      { pos: [-0.8, 0.1, 0], scale: 0.8 },
      { pos: [0, 0.6, 0], scale: 0.7 },
      { pos: [0.4, 0.5, 0.4], scale: 0.6 },
    ];

    cloudShape.forEach((part) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const mesh = new THREE.Mesh(geometry, cloudMaterial.clone());
      mesh.position.set(...part.pos);
      mesh.scale.setScalar(part.scale);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      cloudGroup.add(mesh);
    });

    cloudGroup.position.set(x, y, z);
    cloudGroup.userData = { type: 'cloud' };
    this.group.add(cloudGroup);
    return cloudGroup;
  }

  createGround() {
    // CircleGeometry o CylinderGeometry para suelo
    const groundGeometry = new THREE.CylinderGeometry(15, 15, 0.2, 32);
    const groundMaterial = this.materialFactory.createGround();
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    ground.userData = { type: 'ground' };

    this.group.add(ground);
    return ground;
  }

  getGroup() {
    return this.group;
  }

  dispose() {
    // Traverse and dispose all geometries and materials
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}

export default EnvironmentBuilder;
