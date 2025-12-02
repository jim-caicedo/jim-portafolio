/**
 * EJEMPLOS PRÁCTICOS - Cómo Extender tu Código Refactorizado
 * 
 * Este archivo muestra cómo agregar nuevas características sin modificar
 * el código existente, demostrando los beneficios de SOLID
 */

// ============================================================================
// 1. AGREGAR UN NUEVO TIPO DE GEOMETRÍA
// ============================================================================

// En src/three/geometries/GeometryFactory.js - agrega este método:

/*
createPyramid(width, height, depth) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -width/2, 0, -depth/2,  // v0
     width/2, 0, -depth/2,  // v1
     width/2, 0,  depth/2,  // v2
    -width/2, 0,  depth/2,  // v3
    0, height, 0,           // v4 (ápice)
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  this.geometries.push(geometry);
  return geometry;
}
*/

// Uso:
/*
const pyramidGeom = geometryFactory.createPyramid(1, 1.5, 1);
const pyramid = new THREE.Mesh(pyramidGeom, materials.wall);
sceneManager.add(pyramid);
*/

// ============================================================================
// 2. AGREGAR NUEVOS MATERIALES PREDEFINIDOS
// ============================================================================

// En src/three/materials/MaterialFactory.js - modifica createDefaultMaterials():

/*
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
    // NUEVOS MATERIALES
    metal: this.getMaterial('metal', {
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.1,
    }),
    plastic: this.getMaterial('plastic', {
      color: 0xff6600,
      metalness: 0,
      roughness: 0.5,
    }),
  };
}
*/

// ============================================================================
// 3. CREAR UN BUILDER PARA OTROS OBJETOS (Árbol, Cerca, etc)
// ============================================================================

// Crear archivo: src/three/objects/TreeBuilder.js

/*
import * as THREE from 'three';

class TreeBuilder {
  constructor(geometryFactory, materialFactory) {
    this.geometryFactory = geometryFactory;
    this.materialFactory = materialFactory;
    this.tree = new THREE.Group();
  }

  buildTrunk(materials, height = 2) {
    const trunkGeom = this.geometryFactory.createCone(0.3, height, 8);
    const trunk = new THREE.Mesh(trunkGeom, materials.wood);
    this.tree.add(trunk);
    return this;
  }

  buildCanopy(materials, radius = 1.5) {
    const canopyGeom = this.geometryFactory.createSphere(radius, 32, 32);
    const canopy = new THREE.Mesh(canopyGeom, materials.green);
    canopy.position.y = 1.5;
    this.tree.add(canopy);
    return this;
  }

  buildCanopyAlt(materials, radius = 1.5) {
    // Variación: dos copas
    const canopy1 = new THREE.Mesh(
      this.geometryFactory.createSphere(radius, 32, 32),
      materials.green
    );
    canopy1.position.set(-0.5, 2, 0);
    
    const canopy2 = new THREE.Mesh(
      this.geometryFactory.createSphere(radius, 32, 32),
      materials.green
    );
    canopy2.position.set(0.5, 2, 0);
    
    this.tree.add(canopy1, canopy2);
    return this;
  }

  build() {
    return this.tree;
  }
}

export default TreeBuilder;
*/

// Uso en House.js:
/*
import TreeBuilder from '../three/objects/TreeBuilder';

const tree1 = new TreeBuilder(geometryFactory, materialFactory)
  .buildTrunk(materials)
  .buildCanopy(materials)
  .build();
tree1.position.set(3, 0, 0);
sceneManager.add(tree1);

const tree2 = new TreeBuilder(geometryFactory, materialFactory)
  .buildTrunk(materials, 1.5)
  .buildCanopyAlt(materials)
  .build();
tree2.position.set(-3, 0, 0);
sceneManager.add(tree2);
*/

// ============================================================================
// 4. CREAR UN NUEVO MANAGER PARA ANIMACIONES
// ============================================================================

// Crear archivo: src/three/animation/AnimationManager.js

/*
import * as THREE from 'three';

class AnimationManager {
  constructor() {
    this.animations = [];
    this.mixer = null;
  }

  createRotationAnimation(object, axis = 'y', speed = 0.01) {
    this.animations.push({
      type: 'rotation',
      object,
      axis,
      speed,
    });
    return this;
  }

  createBobAnimation(object, amplitude = 0.5, speed = 0.02) {
    this.animations.push({
      type: 'bob',
      object,
      amplitude,
      speed,
      time: 0,
      originalY: object.position.y,
    });
    return this;
  }

  update(deltaTime = 0.016) {
    this.animations.forEach((anim) => {
      if (anim.type === 'rotation') {
        anim.object.rotation[anim.axis] += anim.speed;
      } else if (anim.type === 'bob') {
        anim.time += anim.speed;
        anim.object.position.y = 
          anim.originalY + Math.sin(anim.time) * anim.amplitude;
      }
    });
  }

  dispose() {
    this.animations = [];
  }
}

export default AnimationManager;
*/

// Uso:
/*
const animationManager = new AnimationManager();
animationManager
  .createRotationAnimation(house, 'y', 0.002)
  .createBobAnimation(door, 0.1, 0.05);

sceneManager.startAnimationLoop(() => {
  animationManager.update();
});
*/

// ============================================================================
// 5. AGREGAR INTERACTIVIDAD CON EVENTOS PERSONALIZADOS
// ============================================================================

// En House.js - mejorar el handleEnter:

/*
const handleEnter = useCallback(() => {
  console.log('Entrando a la casa...');
  
  // Animación: zoom in
  const camera = sceneManagerRef.current.getCamera();
  const targetPosition = new THREE.Vector3(0, 1.5, 2);
  const duration = 1000; // ms
  const startTime = Date.now();
  
  const animateCamera = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    camera.position.lerp(targetPosition, progress * 0.05);
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      console.log('¡Entraste a la casa!');
    }
  };
  
  animateCamera();
}, []);
*/

// ============================================================================
// 6. AGREGAR ILUMINACIÓN DINÁMICA
// ============================================================================

// En src/three/lighting/LightingSetup.js - agregar nuevo método:

/*
addPointLight(position, color = 0xffffff, intensity = 1, distance = 100) {
  const light = new THREE.PointLight(color, intensity, distance);
  light.position.copy(position);
  this.scene.add(light);
  this.lights.push(light);
  return light;
}

addSpotLight(position, target, color = 0xffffff, intensity = 1) {
  const light = new THREE.SpotLight(color, intensity);
  light.position.copy(position);
  light.target.position.copy(target);
  this.scene.add(light);
  this.scene.add(light.target);
  this.lights.push(light);
  return light;
}
*/

// Uso:
/*
const lighting = new LightingSetup(sceneManager.getScene());
lighting.setupLighting();
lighting.addPointLight(new THREE.Vector3(2, 2, 2), 0xffff00, 1, 50);
lighting.addSpotLight(
  new THREE.Vector3(0, 5, 0),
  new THREE.Vector3(0, 0, 0)
);
*/

// ============================================================================
// 7. CREAR UN PARTICLE SYSTEM
// ============================================================================

// Crear archivo: src/three/effects/ParticleSystem.js

/*
import * as THREE from 'three';

class ParticleSystem {
  constructor(count = 1000) {
    this.count = count;
    this.particles = null;
  }

  createSnow(sceneManager, bounds = 50) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * bounds;
      positions[i + 1] = Math.random() * bounds;
      positions[i + 2] = (Math.random() - 0.5) * bounds;

      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = -Math.random() * 0.1;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    this.particles = new THREE.Points(geometry, material);
    this.velocities = velocities;
    
    sceneManager.add(this.particles);
    return this;
  }

  update() {
    if (!this.particles) return;
    
    const positions = this.particles.geometry.attributes.position.array;
    const bounds = 50;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += this.velocities[i];
      positions[i + 1] += this.velocities[i + 1];
      positions[i + 2] += this.velocities[i + 2];

      // Reiniciar si sale de los límites
      if (positions[i + 1] < -bounds) {
        positions[i + 1] = bounds;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.particles?.geometry.dispose();
    this.particles?.material.dispose();
  }
}

export default ParticleSystem;
*/

// Uso:
/*
const particleSystem = new ParticleSystem(500);
particleSystem.createSnow(sceneManager);

sceneManager.startAnimationLoop(() => {
  particleSystem.update();
});
*/

// ============================================================================
// 8. AGREGAR CONTROLES PERSONALIZADOS
// ============================================================================

// En House.js - agregar keyboard controls:

/*
useEffect(() => {
  const handleKeyPress = (e) => {
    const camera = sceneManagerRef.current.getCamera();
    const speed = 0.5;

    switch (e.key) {
      case 'ArrowUp':
        camera.position.z -= speed;
        break;
      case 'ArrowDown':
        camera.position.z += speed;
        break;
      case 'ArrowLeft':
        camera.position.x -= speed;
        break;
      case 'ArrowRight':
        camera.position.x += speed;
        break;
      default:
        break;
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
*/

// ============================================================================
// CONCLUSIÓN
// ============================================================================

/*
La arquitectura refactorizada permite:

✅ Agregar nuevas geometrías sin modificar GeometryFactory
✅ Agregar nuevos materiales sin modificar House.js
✅ Crear builders para otros objetos siguiendo el mismo patrón
✅ Crear nuevos managers para animaciones, física, etc.
✅ Extender la funcionalidad sin tocar código existente

Esto es el poder de SOLID - código que crece sin quebrarse.
*/
