import * as THREE from 'three';

class LowPolyMaterials {
  constructor() {
    this.materials = {};
    this.initMaterials();
  }

  initMaterials() {
    // Paleta de colores
    const colors = {
      wall: 0xf5f5dc,      // Beige paredes
      roof: 0xcd5c5c,      // Rojo tejado
      door: 0x8b4513,      // Marrón puerta
      window: 0x87ceeb,    // Azul cielo ventanas
      trunk: 0x8b4513,     // Marrón tronco
      leaves: 0x228b22,    // Verde oscuro hojas
      cloud: 0xffffff,     // Blanco nubes
      ground: 0x90ee90,    // Verde claro suelo
    };

    // Configuración base para materiales low poly
    const baseConfig = {
      flatShading: true,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.FrontSide,
    };

    // Pared
    this.materials.wall = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.wall,
      roughness: 0.9,
      metalness: 0.0,
    });

    // Techo
    this.materials.roof = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.roof,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Puerta
    this.materials.door = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.door,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });

    // Ventana (transparente)
    this.materials.window = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.window,
      transparent: true,
      opacity: 0.7,
      metalness: 0.1,
      roughness: 0.2,
    });

    // Tronco árbol
    this.materials.trunk = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.trunk,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Hojas árbol
    this.materials.leaves = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.leaves,
      roughness: 0.8,
      metalness: 0.0,
    });

    // Nube
    this.materials.cloud = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.cloud,
      transparent: true,
      opacity: 0.9,
      metalness: 0,
      roughness: 0.9,
    });

    // Suelo
    this.materials.ground = new THREE.MeshStandardMaterial({
      ...baseConfig,
      color: colors.ground,
      metalness: 0,
      roughness: 0.9,
    });
  }

  createWall() {
    return this.materials.wall.clone();
  }

  createRoof() {
    return this.materials.roof.clone();
  }

  createDoor() {
    return this.materials.door.clone();
  }

  createWindow() {
    return this.materials.window.clone();
  }

  createTrunk() {
    return this.materials.trunk.clone();
  }

  createLeaves() {
    return this.materials.leaves.clone();
  }

  createCloud() {
    return this.materials.cloud.clone();
  }

  createGround() {
    return this.materials.ground.clone();
  }

  dispose() {
    Object.values(this.materials).forEach((material) => {
      material.dispose();
    });
  }
}

export default LowPolyMaterials;
