import * as THREE from 'three';

class CVInteractionManager {
  constructor(camera, renderer, cvPlane) {
    this.camera = camera;
    this.renderer = renderer;
    this.cvPlane = cvPlane;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Estados de animación
    this.isFocused = false;
    this.isAnimating = false;
    this.animationProgress = 0;
    this.animationDuration = 0.8; // segundos
    
    // Posiciones de cámara: lejos al inicio, cerca cuando enfoca
    this.initialCameraZ = 12;
    this.focusedCameraZ = 8; // Aumentado para menos acercamiento
    
    // Rotaciones iniciales y finales
    this.initialRotation = { x: 0.3, y: 0, z: 0 }; // Ligera inclinación inicial
    this.focusedRotation = { x: 0, y: 0, z: 0 };   // Completamente de frente
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.renderer.domElement.addEventListener('click', (event) => {
      this.handleClick(event);
    });
  }

  handleClick(event) {
    // Calcular posición del mouse en coordenadas normalizadas
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.cvPlane.plane);

    if (intersects.length > 0) {
      // Clickeó en el plano
      this.toggleFocus();
    } else {
      // Clickeó en el vacío
      if (this.isFocused) {
        this.toggleFocus();
      }
    }
  }

  toggleFocus() {
    if (this.isAnimating) return;
    
    this.isFocused = !this.isFocused;
    this.isAnimating = true;
    this.animationProgress = 0;
    this.cvPlane.setFocused(this.isFocused);
    
    console.log(`[INTERACTION] ${this.isFocused ? 'Focus ON' : 'Focus OFF'}`);
  }

  updateAnimation(deltaTime) {
    if (!this.isAnimating) return;

    this.animationProgress += deltaTime / this.animationDuration;
    
    if (this.animationProgress >= 1) {
      this.animationProgress = 1;
      this.isAnimating = false;
    }

    // Easing: ease-in-out cúbico
    const t = this.animationProgress;
    const easeProgress = t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Interpolar posición Z de la cámara
    const targetCameraZ = this.isFocused ? this.focusedCameraZ : this.initialCameraZ;
    const startCameraZ = this.isFocused ? this.initialCameraZ : this.focusedCameraZ;
    
    this.camera.position.z = startCameraZ + (targetCameraZ - startCameraZ) * easeProgress;

    // Interpolar rotación del plano
    const targetRot = this.isFocused ? this.focusedRotation : this.initialRotation;
    const startRot = this.isFocused ? this.initialRotation : this.focusedRotation;
    
    this.cvPlane.group.rotation.x = startRot.x + (targetRot.x - startRot.x) * easeProgress;
    this.cvPlane.group.rotation.y = startRot.y + (targetRot.y - startRot.y) * easeProgress;
    this.cvPlane.group.rotation.z = startRot.z + (targetRot.z - startRot.z) * easeProgress;
  }

  dispose() {
    this.renderer.domElement.removeEventListener('click', (event) => this.handleClick(event));
  }
}

export default CVInteractionManager;
