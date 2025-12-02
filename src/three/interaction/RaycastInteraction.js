import * as THREE from 'three';

/**
 * Maneja interacciones con raycasting
 * Sigue SRP: responsable solo de detectar intersecciones
 */
class RaycastInteraction {
  constructor(camera, container) {
    this.camera = camera;
    this.container = container;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = []; // Array de {object, callback}
  }

  /**
   * Registra un callback para un objeto
   * @param {THREE.Object3D} object - Objeto a interactuar
   * @param {function} callback - Función a ejecutar
   */
  on(object, callback) {
    if (!object || typeof callback !== 'function') {
      console.warn('RaycastInteraction.on: objeto o callback inválidos');
      return;
    }
    this.interactiveObjects.push({ object, callback });
  }

  /**
   * Maneja el evento de click
   */
  handleClick(event) {
    if (!this.camera || !this.container) {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Detectar intersecciones
    this.interactiveObjects.forEach(({ object, callback }) => {
      if (object && typeof callback === 'function') {
        try {
          const intersects = this.raycaster.intersectObject(object);
          if (intersects.length > 0) {
            callback();
          }
        } catch (error) {
          console.error('Error en raycast:', error);
        }
      }
    });
  }

  /**
   * Limpia los objetos interactivos
   */
  clear() {
    this.interactiveObjects = [];
  }

  /**
   * Agrega el event listener
   */
  attachListener(handler) {
    this.container.addEventListener('click', handler);
  }

  /**
   * Remueve el event listener
   */
  detachListener(handler) {
    this.container.removeEventListener('click', handler);
  }
}

export default RaycastInteraction;
