import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Gestor de escena principal
 * Sigue SRP: responsable de la configuración básica de la escena
 */
class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
  }

  /**
   * Inicializa la escena, cámara y renderer
   */
  initialize(backgroundTexture = null) {
    // Scene
    this.scene = new THREE.Scene();
    if (backgroundTexture) {
      this.scene.background = backgroundTexture;
    }

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(4, 3, 6);
    this.camera.lookAt(0, 1, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    return this;
  }

  /**
   * Inicia el loop de animación
   */
  startAnimationLoop(onAnimate) {
    const animate = () => {
      this.controls.update();
      onAnimate?.(this.scene, this.camera);
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
    return this;
  }

  /**
   * Detiene el loop de animación
   */
  stopAnimationLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Agrega un objeto a la escena
   */
  add(object) {
    this.scene.add(object);
    return this;
  }

  /**
   * Obtiene la escena
   */
  getScene() {
    return this.scene;
  }

  /**
   * Obtiene la cámara
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Libera recursos
   */
  dispose() {
    this.stopAnimationLoop();
    this.controls?.dispose();
    this.renderer?.dispose();
    if (this.renderer && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export default SceneManager;
