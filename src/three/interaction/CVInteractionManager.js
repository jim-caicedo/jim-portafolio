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
    this.animationDuration = 0.6; // segundos
    
    // Posiciones y rotaciones iniciales/finales
    this.initialPosition = new THREE.Vector3(0, 0, 0);
    this.focusedPosition = new THREE.Vector3(0, 0, -2);
    this.initialRotation = new THREE.Euler(0, 0, 0);
    this.focusedScale = 1.05;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.renderer.domElement.addEventListener('click', (event) => {
      this.handleClick(event);
    });

    window.addEventListener('resize', () => {
      this.updateMousePosition();
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

    // Interpolar posición
    const position = this.cvPlane.group.position;
    const targetPos = this.isFocused ? this.focusedPosition : this.initialPosition;
    const startPos = this.isFocused ? this.initialPosition : this.focusedPosition;
    
    position.x = startPos.x + (targetPos.x - startPos.x) * easeProgress;
    position.y = startPos.y + (targetPos.y - startPos.y) * easeProgress;
    position.z = startPos.z + (targetPos.z - startPos.z) * easeProgress;

    // Interpolar escala
    const targetScale = this.isFocused ? this.focusedScale : 1;
    const startScale = this.isFocused ? 1 : this.focusedScale;
    const currentScale = startScale + (targetScale - startScale) * easeProgress;
    
    this.cvPlane.group.scale.set(currentScale, currentScale, currentScale);

    // Cambiar opacidad de sombra
    const shadowOpacity = this.isFocused ? 0.05 : 0.1;
    const currentOpacity = (this.isFocused ? 0.1 : 0.05) + (shadowOpacity - (this.isFocused ? 0.1 : 0.05)) * easeProgress;
    this.cvPlane.shadow.material.opacity = currentOpacity;
  }

  updateMousePosition() {
    // Usar la última posición del mouse si es necesario
  }

  dispose() {
    this.renderer.domElement.removeEventListener('click', (event) => this.handleClick(event));
  }
}

export default CVInteractionManager;
