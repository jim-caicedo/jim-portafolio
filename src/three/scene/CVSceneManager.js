import * as THREE from 'three';

class CVSceneManager {
  constructor(container) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!this.container) {
      throw new Error('CVSceneManager: Container not found');
    }

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    
    console.log('[CVSceneManager] Container size:', this.width, 'x', this.height);
    
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLighting();
    
    this.lastTime = Date.now();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
  }

  initCamera() {
    const aspect = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(
      60,
      aspect,
      0.1,
      1000
    );
    this.camera.position.z = 8;
    console.log('[CVSceneManager] Camera position:', this.camera.position);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      precision: 'highp'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = false;
    
    this.container.appendChild(this.renderer.domElement);
  }

  initLighting() {
    // Luz ambiental simplificada
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);
    console.log('[CVSceneManager] Lighting initialized');
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  getRenderer() {
    return this.renderer;
  }

  onWindowResize() {
    const newWidth = this.container.clientWidth;
    const newHeight = this.container.clientHeight;

    this.camera.aspect = newWidth / newHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(newWidth, newHeight);
  }

  animate(callback) {
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (callback) {
        callback(deltaTime);
      }

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    };

    animate();
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export default CVSceneManager;
