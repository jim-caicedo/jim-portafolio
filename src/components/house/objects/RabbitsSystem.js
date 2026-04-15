import * as THREE from 'three';

class RabbitsSystem {
  constructor(count = 4) {
    this.count = count;
    this.group = new THREE.Group();
    this.rabbits = [];
    this.startTime = Date.now();

    this.createRabbits();
  }

  createRabbits() {
    for (let i = 0; i < this.count; i++) {
      const rabbit = this.createIndividualRabbit(i);
      this.rabbits.push(rabbit);
      this.group.add(rabbit.mesh);
    }
  }

  createIndividualRabbit(index) {
    const rabbitGroup = new THREE.Group();

    // Materiales low poly
    const furMaterial = new THREE.MeshStandardMaterial({
      color: 0xd2b48c,  // Marrón claro (tan)
      flatShading: true,
      roughness: 0.9,
    });

    const bellyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,  // Beige claro
      flatShading: true,
      roughness: 1.0,
    });

    const earMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb6c1,  // Rosa claro (interior orejas)
      flatShading: true,
    });

    // ========== CUERPO ==========
    // Esfera más delgada y vertical
    const bodyGeometry = new THREE.SphereGeometry(0.3, 6, 5);
    bodyGeometry.scale(0.7, 1.2, 1.0); // Delgado y alto
    const body = new THREE.Mesh(bodyGeometry, furMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    rabbitGroup.add(body);

    // ========== PANZA ==========
    const bellyGeometry = new THREE.SphereGeometry(0.18, 6, 4);
    bellyGeometry.scale(0.8, 0.7, 1.0);
    const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    belly.position.set(0, 0.45, 0.1);
    rabbitGroup.add(belly);

    // ========== CABEZA ==========
    const headGroup = new THREE.Group();
    
    // Cráneo más pequeño y ovalado
    const headGeometry = new THREE.SphereGeometry(0.22, 6, 5);
    headGeometry.scale(0.8, 1.1, 0.9); // Más pequeña y ovalada
    const head = new THREE.Mesh(headGeometry, furMaterial);
    headGroup.add(head);

    // ========== OREJAS ==========
    // Oreja izquierda - más larga y delgada
    const earGeometry = new THREE.ConeGeometry(0.06, 0.8, 4);
    const leftEar = new THREE.Mesh(earGeometry, furMaterial);
    leftEar.position.set(-0.1, 0.5, -0.05);
    leftEar.rotation.z = 0.3; // Inclinada hacia afuera
    leftEar.rotation.x = -0.2;
    headGroup.add(leftEar);

    // Interior oreja izquierda
    const innerEarGeo = new THREE.ConeGeometry(0.03, 0.6, 4);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, earMaterial);
    leftInnerEar.position.set(-0.1, 0.5, -0.03);
    leftInnerEar.rotation.z = 0.3;
    leftInnerEar.rotation.x = -0.2;
    headGroup.add(leftInnerEar);

    // Oreja derecha
    const rightEar = leftEar.clone();
    rightEar.position.set(0.1, 0.5, -0.05);
    rightEar.rotation.z = -0.3;
    headGroup.add(rightEar);

    // Interior oreja derecha
    const rightInnerEar = leftInnerEar.clone();
    rightInnerEar.position.set(0.1, 0.5, -0.03);
    rightInnerEar.rotation.z = -0.3;
    headGroup.add(rightInnerEar);

    // ========== OJOS ==========
    const eyeGeometry = new THREE.SphereGeometry(0.03, 4, 4);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.09, 0.05, 0.18);
    headGroup.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.09, 0.05, 0.18);
    headGroup.add(rightEye);

    // ========== NARIZ ==========
    const noseGeometry = new THREE.SphereGeometry(0.02, 4, 4);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, -0.01, 0.22);
    headGroup.add(nose);

    // ========== BIGOTES (líneas simples) ==========
    const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
    const whiskerPoints = [
      new THREE.Vector3(0, -0.02, 0.25),
      new THREE.Vector3(0.15, -0.02, 0.3),
    ];
    const whiskerGeo = new THREE.BufferGeometry().setFromPoints(whiskerPoints);
    const leftWhisker = new THREE.Line(whiskerGeo, whiskerMaterial);
    headGroup.add(leftWhisker);
    
    const rightWhisker = leftWhisker.clone();
    rightWhisker.rotation.y = Math.PI; // Espejo
    headGroup.add(rightWhisker);

    // Posicionar cabeza más alta
    headGroup.position.set(0, 0.9, 0.3);
    rabbitGroup.add(headGroup);

    // ========== COLA ==========
    const tailGeometry = new THREE.SphereGeometry(0.1, 5, 4);
    const tail = new THREE.Mesh(tailGeometry, furMaterial);
    tail.position.set(0, 0.4, -0.45);
    rabbitGroup.add(tail);

    // ========== PATAS TRASERAS ==========
    // Muslo izquierdo - más estilizado
    const thighGeometry = new THREE.SphereGeometry(0.18, 5, 4);
    thighGeometry.scale(0.6, 1.4, 0.8); // Más estilizado
    const leftThigh = new THREE.Mesh(thighGeometry, furMaterial);
    leftThigh.position.set(-0.2, 0.25, -0.25);
    rabbitGroup.add(leftThigh);

    // Muslo derecho
    const rightThigh = leftThigh.clone();
    rightThigh.position.set(0.2, 0.25, -0.25);
    rabbitGroup.add(rightThigh);

    // Pata trasera izquierda (pie)
    const footGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.22);
    const leftFoot = new THREE.Mesh(footGeometry, furMaterial);
    leftFoot.position.set(-0.2, 0.08, -0.3);
    rabbitGroup.add(leftFoot);

    // Pata trasera derecha
    const rightFoot = leftFoot.clone();
    rightFoot.position.set(0.2, 0.08, -0.3);
    rabbitGroup.add(rightFoot);

    // ========== PATAS DELANTERAS ==========
    // Más largas y delgadas
    const frontLegGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.6, 5);
    
    const leftLeg = new THREE.Mesh(frontLegGeometry, furMaterial);
    leftLeg.position.set(-0.12, 0.15, 0.3);
    rabbitGroup.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.set(0.12, 0.15, 0.3);
    rabbitGroup.add(rightLeg);

    // ========== DATOS DE ANIMACIÓN ==========
    // Posición aleatoria alrededor de la casa
    const angle = (index / this.count) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 4 + Math.random() * 5; // Entre 4 y 9 unidades de la casa

    return {
      mesh: rabbitGroup,
      head: headGroup,
      leftEar,
      rightEar,
      leftThigh,
      rightThigh,
      tail,
      data: {
        baseX: Math.cos(angle) * radius,
        baseZ: Math.sin(angle) * radius,
        baseY: 0,
        jumpOffset: Math.random() * Math.PI * 2,
        jumpSpeed: 1.5 + Math.random() * 1.5, // Saltos cada 1.5-3s aprox
        hopHeight: 0.5 + Math.random() * 0.5, // Salta 0.5-1 unidad
        hopDistance: 0.3 + Math.random() * 0.4, // Avanza al saltar
        lookAngle: angle,
        idleTime: 0,
        state: 'idle', // 'idle', 'hopping', 'eating'
        nextAction: Math.random() * 2,
      }
    };
  }

  update() {
    const elapsed = (Date.now() - this.startTime) / 1000;

    this.rabbits.forEach((rabbit) => {
      const { mesh, head, leftEar, rightEar, leftThigh, rightThigh, tail, data } = rabbit;
      const { baseX, baseZ, jumpOffset, jumpSpeed, hopHeight, hopDistance, lookAngle } = data;

      // ========== ANIMACIÓN DE SALTO (HOPPING) ==========
      const jumpPhase = (elapsed * jumpSpeed + jumpOffset) % (Math.PI * 2);
      const isJumping = jumpPhase < Math.PI; // Primera mitad del ciclo = en el aire

      // Posición Y (salto parabólico)
      let y = data.baseY;
      if (isJumping) {
        // Parábola del salto: sin(phase) * height
        y += Math.sin(jumpPhase) * hopHeight;
      }

      // Posición X/Z (avanzar al saltar)
      let x = baseX;
      let z = baseZ;
      if (isJumping) {
        const hopProgress = Math.sin(jumpPhase / 2); // 0 -> 1 -> 0
        x += Math.cos(lookAngle) * hopDistance * hopProgress;
        z += Math.sin(lookAngle) * hopDistance * hopProgress;
      }

      mesh.position.set(x, y, z);
      mesh.rotation.y = -lookAngle + Math.PI / 2; // Mirar dirección de salto

      // ========== ANIMACIÓN DE PARTES ==========
      if (isJumping) {
        // En el aire: orejas para atrás (aerodinámico)
        leftEar.rotation.x = -0.5;
        rightEar.rotation.x = -0.5;
        
        // Cola vibrando
        tail.rotation.x = Math.sin(elapsed * 20) * 0.3;
        
        // Cabeza ligeramente arriba
        head.rotation.x = -0.2;
        
        // Patas traseras extendidas
        leftThigh.scale.set(1, 1.2, 1);
        rightThigh.scale.set(1, 1.2, 1);
      } else {
        // En el suelo: orejas erguidas (escuchando)
        const earWiggle = Math.sin(elapsed * 3 + data.jumpOffset) * 0.1;
        leftEar.rotation.x = -0.2 + earWiggle;
        rightEar.rotation.x = -0.2 - earWiggle;
        
        // Cola quieto
        tail.rotation.x = 0;
        
        // Cabeza normal
        head.rotation.x = 0;
        
        // Patas normales
        leftThigh.scale.set(1, 1, 1);
        rightThigh.scale.set(1, 1, 1);
        
        // Ocasionalmente "comer" (bajar cabeza)
        if (Math.sin(elapsed * 0.5 + data.jumpOffset) > 0.8) {
          head.rotation.x = 0.4; // Bajar a comer hierba
        }
      }

      // ========== ACTUALIZAR BASE PARA PRÓXIMO SALTO ==========
      if (isJumping && data.wasGrounded) {
        // Acaba de despegar
        data.wasGrounded = false;
      } else if (!isJumping && !data.wasGrounded) {
        // Acaba de aterrizar - actualizar posición base
        data.wasGrounded = true;
        data.baseX = x;
        data.baseZ = z;
        
        // Cambiar dirección aleatoriamente
        if (Math.random() > 0.6) {
          data.lookAngle += (Math.random() - 0.5) * Math.PI;
        }
      }
    });
  }

  getGroup() {
    return this.group;
  }

  dispose() {
    this.rabbits.forEach((rabbit) => {
      rabbit.mesh.traverse((child) => {
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

export default RabbitsSystem;