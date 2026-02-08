import * as THREE from 'three';

class CVPlane {
  constructor(materialFactory) {
    this.materialFactory = materialFactory;
    this.group = new THREE.Group();
    this.isAnimating = false;
    this.isFocused = false;
    
    this.createPlane();
    this.createShadow();
  }

  createPlane() {
    // Crear geometría con proporción A4 (210x297mm = ratio 0.707)
    const width = 6;
    const height = width / 0.707;
    
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.position.z = 0;
    this.plane.castShadow = false;
    this.plane.receiveShadow = false;
    
    console.log('[CVPlane] Plane created:', {
      width,
      height,
      position: this.plane.position,
      material: material.color.getHexString(),
    });
    
    // Agregar borde sutil
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 })
    );
    line.position.z = 0.01;
    
    this.group.add(this.plane);
    this.group.add(line);
  }

  createShadow() {
    // Sombra sutil bajo el plano
    const shadowGeometry = new THREE.PlaneGeometry(4.2, 5.8);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.1,
    });
    
    this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    this.shadow.position.z = -0.5;
    this.shadow.scale.y = 0.3;
    this.group.add(this.shadow);
  }

  getGroup() {
    return this.group;
  }

  setFocused(focused) {
    this.isFocused = focused;
  }

  updateRotation(deltaTime) {
    // Solo rotar cuando no está enfocado
    if (!this.isFocused) {
      this.group.rotation.y += deltaTime * 0.3;
    }
  }

  dispose() {
    this.plane.geometry.dispose();
    this.plane.material.dispose();
    this.shadow.geometry.dispose();
    this.shadow.material.dispose();
  }
}

export default CVPlane;
