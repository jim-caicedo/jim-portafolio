import * as THREE from 'three';

class BirdsSystem {
  constructor(count = 6) {
    this.count = count;
    this.group = new THREE.Group();
    this.birds = []; // Array de objetos bird individuales (no InstancedMesh para poder animar partes)
    this.startTime = Date.now();

    this.createBirds();
  }

  createBirds() {
    for (let i = 0; i < this.count; i++) {
      const bird = this.createIndividualBird(i);
      this.birds.push(bird);
      this.group.add(bird.mesh);
    }
  }

  createIndividualBird(index) {
    // Grupo contenedor del pájaro completo
    const birdGroup = new THREE.Group();

    // Material común
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,  // Gris más natural
      flatShading: true,
      roughness: 0.9,
      metalness: 0.1,
    });

    const wingMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,  // Alas más oscuras
      flatShading: true,
      roughness: 0.9,
    });

    // ========== CUERPO ==========
    // Cono alargado y achatado (más aerodinámico)
    const bodyGeometry = new THREE.ConeGeometry(0.12, 0.5, 5);
    bodyGeometry.rotateX(Math.PI / 2); // Apuntar hacia adelante (Z)
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    birdGroup.add(body);

    // ========== CABEZA ==========
    const headGeometry = new THREE.ConeGeometry(0.08, 0.2, 5);
    headGeometry.rotateX(Math.PI / 2);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 0.05, 0.35); // Adelante y arriba del cuerpo
    birdGroup.add(head);

    // ========== ALA IZQUIERDA ==========
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.4, 0.15);  // Punta del ala
    wingShape.lineTo(0.3, -0.1);
    wingShape.lineTo(0, -0.05);
    wingShape.lineTo(0, 0);

    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.02,
      bevelEnabled: false,
    });

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(0.05, 0, -0.1);
    leftWing.rotation.x = -Math.PI / 2;
    leftWing.rotation.z = -0.2;
    birdGroup.add(leftWing);

    // ========== ALA DERECHA (espejo) ==========
    const rightWing = leftWing.clone();
    rightWing.position.set(-0.05, 0, -0.1);
    rightWing.rotation.z = 0.2;
    rightWing.scale.x = -1; // Espejo horizontal
    birdGroup.add(rightWing);

    // ========== COLA ==========
    const tailGeometry = new THREE.ConeGeometry(0.08, 0.25, 3);
    tailGeometry.rotateX(-Math.PI / 2); // Apuntar hacia atrás
    const tail = new THREE.Mesh(tailGeometry, wingMaterial);
    tail.position.set(0, 0, -0.35);
    tail.rotation.x = 0.3; // Levantada ligeramente
    birdGroup.add(tail);

    // ========== DATOS DE ANIMACIÓN ==========
    const offset = (index / this.count) * Math.PI * 2;
    
    return {
      mesh: birdGroup,
      leftWing,
      rightWing,
      tail,
      data: {
        offset,
        angle: offset,
        radius: 8 + Math.random() * 4,     // 8-12 radio
        heightBase: 5 + Math.random() * 2, // 5-7 altura base
        speed: 0.3 + Math.random() * 0.4,  // Velocidad variable
        wingSpeed: 8 + Math.random() * 4,  // Velocidad de aleteo
      }
    };
  }

  update() {
    const elapsed = (Date.now() - this.startTime) / 1000;

    this.birds.forEach((bird) => {
      const { leftWing, rightWing, tail, data, mesh } = bird;
      const { offset, speed, radius, heightBase, wingSpeed } = data;

      // ========== MOVIMIENTO ORBITAL ==========
      data.angle += speed * 0.01;
      
      const x = Math.cos(data.angle) * radius;
      const z = Math.sin(data.angle) * radius;
      
      // Altura con ondas suaves
      const y = heightBase + Math.sin(elapsed * 1.5 + offset) * 1.5;

      // Posicionar
      mesh.position.set(x, y, z);

      // ========== ROTACIÓN (mirar dirección de vuelo) ==========
      const tangentAngle = data.angle + Math.PI / 2;
      mesh.rotation.y = -tangentAngle + Math.PI / 2;

      // Inclinación según giro (banking)
      const bankAngle = Math.cos(elapsed * 0.5 + offset) * 0.3;
      mesh.rotation.z = bankAngle;
      mesh.rotation.x = Math.sin(elapsed * 2 + offset) * 0.1; // Cabeceo suave

      // ========== ANIMACIÓN DE ALAS (FLAPPING) ==========
      const flapPhase = elapsed * wingSpeed + offset;
      const flapAngle = Math.sin(flapPhase) * 0.6; // Amplitud del aleteo

      // Alas suben y bajan en oposición (ciclo completo)
      leftWing.rotation.z = -0.2 + flapAngle;
      rightWing.rotation.z = 0.2 - flapAngle;

      // ========== ANIMACIÓN DE COLA ==========
      tail.rotation.y = Math.sin(elapsed * 3 + offset) * 0.2; // Guiñada
      tail.rotation.x = 0.3 + Math.abs(Math.sin(flapPhase)) * 0.2; // Se levanta al aletear
    });
  }

  getGroup() {
    return this.group;
  }

  dispose() {
    this.birds.forEach((bird) => {
      bird.mesh.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
  }
}

export default BirdsSystem;