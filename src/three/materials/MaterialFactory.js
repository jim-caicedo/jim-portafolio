import * as THREE from 'three';

/**
 * Factory para crear materiales reutilizables
 * Sigue SRP: responsable solo de crear y cachear materiales
 */
class MaterialFactory {
  constructor() {
    this.materials = {};
  }

  /**
   * Obtiene o crea un material
   * @param {string} name - Nombre identificador del material
   * @param {object} config - Configuración del material
   * @returns {THREE.Material}
   */
  getMaterial(name, config = {}) {
    if (this.materials[name]) {
      return this.materials[name];
    }

    const material = new THREE.MeshStandardMaterial({
      flatShading: true,
      ...config,
    });

    this.materials[name] = material;
    return material;
  }

  /**
   * Crea materiales predefinidos comunes
   */
  createDefaultMaterials() {
    return {
      wall: this.getMaterial('wall', { color: 0xffe0b8 }),
      roof: this.getMaterial('roof', { color: 0x8b2f2f }),
      wood: this.getMaterial('wood', { color: 0x6b3e26 }),
      glass: this.getMaterial('glass', {
        color: 0x89c3ff,
        emissive: 0x1a6fb3,
      }),
      ground: this.getMaterial('ground', { 
        color: 0x6fbf73,
        side: THREE.DoubleSide 
      }),
    };
  }

  /**
   * Libera memoria de todos los materiales
   */
  dispose() {
    Object.values(this.materials).forEach((material) => {
      material.dispose();
    });
    this.materials = {};
  }
}

export default MaterialFactory;
