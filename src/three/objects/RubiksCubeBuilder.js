import * as THREE from 'three';

/**
 * Generador de cubo de Rubik 3D simplificado
 * Versión de prueba: Solo UN cubo 3x3x3
 */
class RubiksCubeBuilder {
  constructor(geometryFactory, materialFactory) {
    this.geometryFactory = geometryFactory;
    this.materialFactory = materialFactory;
    this.cube = new THREE.Group();
    this.cubies = [];

    // Definir colores del cubo de Rubik estándar
    this.colors = {
      white: 0xffffff,      // Superior
      yellow: 0xffff00,     // Inferior
      red: 0xff0000,        // Derecha
      orange: 0xff8800,     // Izquierda
      blue: 0x0055ff,       // Frontal
      green: 0x00dd00,      // Posterior
      black: 0x222222,      // Núcleo/bordes
    };
  }

  /**
   * Construye UN cubo de Rubik 3x3x3 simple
   */
  build() {
    const cubeSize = 1;
    const spacing = 1.03;

    // Crear solo los 26 cubos (sin el centro del cubo)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Saltar el centro
          if (x === 0 && y === 0 && z === 0) continue;

          const posX = x * spacing;
          const posY = y * spacing;
          const posZ = z * spacing;

          this.createSimpleCubie(posX, posY, posZ, cubeSize);
        }
      }
    }

    return this.cube;
  }

  /**
   * Crea UN cubito simple con 6 stickers de color
   */
  createSimpleCubie(posX, posY, posZ, cubeSize) {
    const group = new THREE.Group();
    group.position.set(posX, posY, posZ);

    // Crear el núcleo negro
    const coreGeometry = new THREE.BoxGeometry(
      cubeSize * 0.9,
      cubeSize * 0.9,
      cubeSize * 0.9
    );
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.black,
      metalness: 0.3,
      roughness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(coreMesh);

    // Agregar los 6 stickers de color en cada cara
    const stickers = [
      { pos: [0, 0.5, 0], color: this.colors.white, rot: [-Math.PI / 2, 0, 0] },      // Top (arriba)
      { pos: [0, -0.5, 0], color: this.colors.yellow, rot: [Math.PI / 2, 0, 0] },     // Bottom (abajo)
      { pos: [0.5, 0, 0], color: this.colors.red, rot: [0, Math.PI / 2, 0] },        // Right (derecha)
      { pos: [-0.5, 0, 0], color: this.colors.orange, rot: [0, -Math.PI / 2, 0] },   // Left (izquierda)
      { pos: [0, 0, 0.5], color: this.colors.blue, rot: [0, 0, 0] },                 // Front (frente)
      { pos: [0, 0, -0.5], color: this.colors.green, rot: [0, Math.PI, 0] },         // Back (atrás)
    ];

    stickers.forEach((sticker) => {
      // Crear sticker
      const stickerGeometry = new THREE.PlaneGeometry(0.8, 0.8);
      const stickerMaterial = new THREE.MeshStandardMaterial({
        color: sticker.color,
        metalness: 0.2,
        roughness: 0.4,
        emissive: sticker.color,
        emissiveIntensity: 0.3,
      });

      const stickerMesh = new THREE.Mesh(stickerGeometry, stickerMaterial);
      stickerMesh.position.set(...sticker.pos);
      stickerMesh.rotation.set(...sticker.rot);
      stickerMesh.position.z += 0.01; // Llevar al frente
      
      group.add(stickerMesh);
    });

    this.cube.add(group);
    this.cubies.push(group);
  }

  /**
   * Obtiene el cubo
   */
  getCube() {
    return this.cube;
  }
}

export default RubiksCubeBuilder;
