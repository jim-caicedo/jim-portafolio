import * as THREE from 'three';

/**
 * Configuración de luces
 * Sigue SRP: responsable solo de crear y configurar luces
 */
class LightingSetup {
  constructor(scene) {
    this.scene = scene;
    this.lights = [];
  }

  /**
   * Agrega iluminación ambiental y direccional
   */
  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    this.lights.push(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);
    this.lights.push(dirLight);

    return this;
  }

  /**
   * Libera memoria de las luces
   */
  dispose() {
    this.lights.forEach((light) => {
      light.dispose?.();
    });
    this.lights = [];
  }
}

export default LightingSetup;
