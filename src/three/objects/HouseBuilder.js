import * as THREE from 'three';

/**
 * Constructor de objetos 3D para la casa
 * Sigue Builder Pattern y SRP
 */
class HouseBuilder {
  constructor(geometryFactory, materialFactory) {
    this.geometryFactory = geometryFactory;
    this.materialFactory = materialFactory;
    this.house = new THREE.Group();
    this.door = null;
  }

  /**
   * Construye la base (paredes) de la casa
   */
  buildBase(materials) {
    const baseGeom = this.geometryFactory.createBox(2.2, 1.2, 2.0);
    const baseMesh = new THREE.Mesh(baseGeom, materials.wall);
    baseMesh.position.y = 0.6;
    baseMesh.name = 'house-base';
    this.house.add(baseMesh);
    return this;
  }

  /**
   * Construye el techo
   */
  buildRoof(materials) {
    const roofGeom = this.geometryFactory.createCone(1.5, 0.9, 4);
    roofGeom.translate(0, 0.45, 0);
    const roofMesh = new THREE.Mesh(roofGeom, materials.roof);
    roofMesh.position.y = 1.2;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.name = 'roof';
    this.house.add(roofMesh);
    return this;
  }

  /**
   * Construye la puerta
   */
  buildDoor(materials) {
    const doorGeom = this.geometryFactory.createBox(0.5, 0.8, 0.05);
    const door = new THREE.Mesh(doorGeom, materials.wood);
    door.position.set(0, 0.4, 1.02);
    door.name = 'door';
    this.door = door;
    this.house.add(door);
    return this;
  }

  /**
   * Construye las ventanas
   */
  buildWindows(materials) {
    const positions = [
      { x: -0.7, y: 0.75 },
      { x: 0.7, y: 0.75 },
    ];

    positions.forEach((pos, index) => {
      const winGeom = this.geometryFactory.createPlane(0.45, 0.45);
      const win = new THREE.Mesh(winGeom, materials.glass);
      win.position.set(pos.x, pos.y, 1.01);
      win.name = `window-${index}`;
      this.house.add(win);
    });

    return this;
  }

  /**
   * Construye la chimenea
   */
  buildChimney(materials) {
    const chimGeom = this.geometryFactory.createBox(0.18, 0.5, 0.18);
    const chim = new THREE.Mesh(chimGeom, materials.wood);
    chim.position.set(-0.6, 1.8, -0.3);
    chim.name = 'chimney';
    this.house.add(chim);
    return this;
  }

  /**
   * Construye el suelo
   */
  buildGround(materials) {
    const groundGeom = this.geometryFactory.createPlane(5, 5);
    const ground = new THREE.Mesh(groundGeom, materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.name = 'ground';
    this.house.add(ground);
    return this;
  }

  /**
   * Obtiene el grupo de la casa construida
   */
  build() {
    return this.house;
  }

  /**
   * Obtiene la referencia a la puerta
   */
  getDoor() {
    return this.door;
  }
}

export default HouseBuilder;
