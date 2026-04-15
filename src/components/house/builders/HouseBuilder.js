import * as THREE from 'three';

class HouseBuilder {
  constructor(materialFactory) {
    this.materialFactory = materialFactory;
    this.group = new THREE.Group();
    this.parts = {};
  }

  build() {
    this.createWalls();
    this.createRoof();
    this.createDoor();
    this.createWindows();
    
    console.log('[HouseBuilder] House created successfully');
    return this.group;
  }

  createWalls() {
    const wallGeometry = new THREE.BoxGeometry(4, 3, 4, 1, 1, 1);
    const wallMaterial = this.materialFactory.createWall();
    
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 1.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    walls.userData = { type: 'wall' };
    
    this.parts.walls = walls;
    this.group.add(walls);
  }

  createRoof() {
    // Pirámide: ConeGeometry con 6 segmentos (bordes más suaves)
    const roofGeometry = new THREE.ConeGeometry(3.5, 2, 6);
    const roofMaterial = this.materialFactory.createRoof();
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4; // 45° para que vea los lados
    roof.castShadow = true;
    roof.receiveShadow = true;
    roof.userData = { type: 'roof' };
    
    this.parts.roof = roof;
    this.group.add(roof);
  }

  createDoor() {
    const doorGeometry = new THREE.BoxGeometry(1.2, 2, 0.2);
    const doorMaterial = this.materialFactory.createDoor();
    
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, 2.1);
    door.castShadow = true;
    door.receiveShadow = true;
    door.userData = { type: 'door' };
    
    this.parts.door = door;
    this.group.add(door);
  }

  createWindows() {
    const windowGeometry = new THREE.BoxGeometry(1, 1, 0.2);
    const windowMaterial = this.materialFactory.createWindow();
    
    // Ventana izquierda
    const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial.clone());
    windowLeft.position.set(-1.5, 1.8, 2.1);
    windowLeft.castShadow = true;
    windowLeft.receiveShadow = true;
    windowLeft.userData = { type: 'window' };
    
    // Ventana derecha
    const windowRight = new THREE.Mesh(windowGeometry, windowMaterial.clone());
    windowRight.position.set(1.5, 1.8, 2.1);
    windowRight.castShadow = true;
    windowRight.receiveShadow = true;
    windowRight.userData = { type: 'window' };
    
    this.parts.windowLeft = windowLeft;
    this.parts.windowRight = windowRight;
    
    this.group.add(windowLeft);
    this.group.add(windowRight);
  }

  getDoor() {
    return this.parts.door;
  }

  getGroup() {
    return this.group;
  }

  dispose() {
    // Dispose geometries
    Object.values(this.parts).forEach((part) => {
      if (part.geometry) part.geometry.dispose();
      if (part.material) {
        if (Array.isArray(part.material)) {
          part.material.forEach((m) => m.dispose());
        } else {
          part.material.dispose();
        }
      }
    });
  }
}

export default HouseBuilder;
