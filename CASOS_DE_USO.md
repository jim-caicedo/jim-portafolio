# 🎨 Casos de Uso - Ejemplos Reales

Este archivo muestra cómo usar la arquitectura refactorizada para diferentes escenarios.

---

## 📋 Índice de Casos

1. [Crear un nuevo objeto 3D](#crear-un-nuevo-objeto-3d)
2. [Agregar interactividad](#agregar-interactividad)
3. [Crear animaciones complejas](#crear-animaciones-complejas)
4. [Sistema de partículas](#sistema-de-partículas)
5. [Múltiples escenas](#múltiples-escenas)
6. [Exportar/Importar datos](#exportarimportar-datos)

---

## 🏗️ Crear un Nuevo Objeto 3D

### Caso 1: Agregar un Árbol a la Casa

**Paso 1:** Crear `src/three/objects/TreeBuilder.js`

```javascript
import * as THREE from 'three';

class TreeBuilder {
  constructor(geometryFactory, materialFactory) {
    this.geometryFactory = geometryFactory;
    this.materialFactory = materialFactory;
    this.tree = new THREE.Group();
  }

  buildTrunk(materials, height = 2, radius = 0.3) {
    const trunkGeom = this.geometryFactory.createCone(radius, height, 8);
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

  setPosition(x, y, z) {
    this.tree.position.set(x, y, z);
    return this;
  }

  build() {
    return this.tree;
  }
}

export default TreeBuilder;
```

**Paso 2:** Usar en `src/components/House.js`

```javascript
import TreeBuilder from '../three/objects/TreeBuilder';

// En el useEffect
const tree = new TreeBuilder(geometryFactory, materialFactory)
  .buildTrunk(materials, 2.5)
  .buildCanopy(materials, 1.8)
  .setPosition(3, 0, 0)
  .build();

sceneManager.add(tree);
```

**Resultado:** Árbol agregado sin modificar código existente ✓

---

## 🖱️ Agregar Interactividad

### Caso 2: Puerta que se abre al hacer click

**Crear `src/three/interaction/DoorInteraction.js`**

```javascript
class DoorInteraction {
  constructor(door) {
    this.door = door;
    this.isOpen = false;
    this.targetRotation = 0;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.targetRotation = this.isOpen ? Math.PI / 2 : 0;
    return this;
  }

  update() {
    const currentRotation = this.door.rotation.y;
    const diff = this.targetRotation - currentRotation;
    
    // Interpolación suave
    this.door.rotation.y += diff * 0.1;
  }
}

export default DoorInteraction;
```

**Usar en `House.js`**

```javascript
import DoorInteraction from '../three/interaction/DoorInteraction';

const doorInteraction = new DoorInteraction(doorRef.current);

// En el raycast callback
raycast.on(doorRef.current, () => {
  console.log('Abriendo puerta...');
  doorInteraction.toggle();
});

// En el animation loop
sceneManager.startAnimationLoop(() => {
  doorInteraction.update();
});
```

**Resultado:** Puerta que se abre/cierra con animación suave ✓

---

## 🎬 Crear Animaciones Complejas

### Caso 3: AnimationManager para múltiples objetos

**Crear `src/three/animation/AnimationManager.js`**

```javascript
class AnimationManager {
  constructor() {
    this.animations = [];
    this.time = 0;
  }

  /**
   * Animar rotación en un eje
   */
  createRotation(object, axis = 'y', speed = 0.01) {
    this.animations.push({
      type: 'rotation',
      object,
      axis,
      speed,
    });
    return this;
  }

  /**
   * Animar bobbing (flotante hacia arriba/abajo)
   */
  createBobbing(object, amplitude = 0.5, speed = 0.02) {
    this.animations.push({
      type: 'bobbing',
      object,
      amplitude,
      speed,
      time: 0,
      originalY: object.position.y,
    });
    return this;
  }

  /**
   * Animar movimiento orbital
   */
  createOrbit(object, center, radius = 3, speed = 0.01) {
    this.animations.push({
      type: 'orbit',
      object,
      center,
      radius,
      speed,
      time: 0,
    });
    return this;
  }

  /**
   * Actualizar todas las animaciones
   */
  update() {
    this.time += 0.016; // ~60fps

    this.animations.forEach((anim) => {
      if (anim.type === 'rotation') {
        anim.object.rotation[anim.axis] += anim.speed;
      }

      if (anim.type === 'bobbing') {
        anim.time += anim.speed;
        anim.object.position.y =
          anim.originalY + Math.sin(anim.time) * anim.amplitude;
      }

      if (anim.type === 'orbit') {
        anim.time += anim.speed;
        const x = anim.center.x + Math.cos(anim.time) * anim.radius;
        const z = anim.center.z + Math.sin(anim.time) * anim.radius;
        anim.object.position.set(x, anim.object.position.y, z);
      }
    });
  }

  dispose() {
    this.animations = [];
  }
}

export default AnimationManager;
```

**Usar en `House.js`**

```javascript
import AnimationManager from '../three/animation/AnimationManager';

const animationManager = new AnimationManager();

// Agregar animaciones
animationManager
  .createRotation(house, 'y', 0.002)
  .createBobbing(door, 0.1, 0.02)
  .createOrbit(tree, new THREE.Vector3(0, 0, 0), 5, 0.01);

// En animation loop
sceneManager.startAnimationLoop(() => {
  animationManager.update();
});
```

**Resultado:** Animaciones complejas y fluidas ✓

---

## ✨ Sistema de Partículas

### Caso 4: Lluvia o Nieve

**Crear `src/three/effects/ParticleSystem.js`**

```javascript
import * as THREE from 'three';

class ParticleSystem {
  constructor(count = 1000, bounds = 50) {
    this.count = count;
    this.bounds = bounds;
    this.particles = null;
    this.velocities = null;
  }

  createSnow(sceneManager) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * this.bounds;
      positions[i + 1] = Math.random() * this.bounds;
      positions[i + 2] = (Math.random() - 0.5) * this.bounds;

      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = -Math.random() * 0.05; // Cae hacia abajo
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

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += this.velocities[i];
      positions[i + 1] += this.velocities[i + 1];
      positions[i + 2] += this.velocities[i + 2];

      // Reiniciar si sale de los límites
      if (positions[i + 1] < -this.bounds) {
        positions[i + 1] = this.bounds;
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
```

**Usar en `House.js`**

```javascript
const particleSystem = new ParticleSystem(500);
particleSystem.createSnow(sceneManager);

sceneManager.startAnimationLoop(() => {
  particleSystem.update();
});
```

**Resultado:** Efecto de lluvia/nieve realista ✓

---

## 🎪 Múltiples Escenas

### Caso 5: Cambiar entre escenas (Casa vs Parque)

**Crear `src/three/scene/SceneSwitch.js`**

```javascript
class SceneSwitch {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scenes = {};
    this.currentScene = null;
  }

  addScene(name, sceneObject) {
    this.scenes[name] = sceneObject;
    return this;
  }

  switchTo(name) {
    if (!this.scenes[name]) {
      console.error(`Escena ${name} no existe`);
      return false;
    }

    // Limpiar escena anterior
    if (this.currentScene) {
      const scene = this.sceneManager.getScene();
      this.currentScene.children.forEach((child) => {
        scene.remove(child);
      });
    }

    // Cargar nueva escena
    this.currentScene = this.scenes[name];
    this.sceneManager.getScene().add(this.currentScene);

    return true;
  }

  getCurrentScene() {
    return this.currentScene;
  }
}

export default SceneSwitch;
```

**Usar en `House.js`**

```javascript
const sceneSwitch = new SceneSwitch(sceneManager);

// Crear escena 1: Casa
const house = new HouseBuilder(geometryFactory, materialFactory)
  .buildBase(materials)
  .buildRoof(materials)
  .build();

// Crear escena 2: Parque
const park = new THREE.Group();
// ... agregar árboles, banco, etc ...

sceneSwitch.addScene('house', house);
sceneSwitch.addScene('park', park);

// Cambiar a casa
sceneSwitch.switchTo('house');

// Cambiar a parque
// sceneSwitch.switchTo('park');
```

**Resultado:** Sistema de escenas intercambiables ✓

---

## 💾 Exportar/Importar Datos

### Caso 6: Guardar configuración de la casa

**Crear `src/three/utils/ConfigManager.js`**

```javascript
class ConfigManager {
  constructor() {
    this.config = {};
  }

  /**
   * Guardar configuración
   */
  save(name, data) {
    this.config[name] = {
      timestamp: new Date(),
      data: JSON.parse(JSON.stringify(data)),
    };
    this.persistToLocalStorage();
    return this;
  }

  /**
   * Cargar configuración
   */
  load(name) {
    return this.config[name]?.data || null;
  }

  /**
   * Guardar en localStorage
   */
  persistToLocalStorage() {
    localStorage.setItem(
      'sceneConfig',
      JSON.stringify(this.config)
    );
  }

  /**
   * Cargar desde localStorage
   */
  loadFromLocalStorage() {
    const saved = localStorage.getItem('sceneConfig');
    if (saved) {
      this.config = JSON.parse(saved);
    }
    return this;
  }

  /**
   * Exportar como JSON
   */
  exportJSON(name) {
    const data = this.load(name);
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importar desde JSON
   */
  importJSON(name, jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.save(name, data);
      return true;
    } catch (error) {
      console.error('Error importando JSON:', error);
      return false;
    }
  }
}

export default ConfigManager;
```

**Usar en `House.js`**

```javascript
const configManager = new ConfigManager();

// Guardar configuración
const config = {
  materials: {
    wall: 0xffe0b8,
    roof: 0x8b2f2f,
  },
  objects: {
    house: { position: [0, 0, 0], scale: [1, 1, 1] },
    tree: { position: [3, 0, 0], scale: [1, 1, 1] },
  },
};

configManager.save('myScene', config);

// Cargar configuración
const loaded = configManager.load('myScene');

// Exportar como JSON
const json = configManager.exportJSON('myScene');
console.log(json);
```

**Resultado:** Sistema de configuración persistente ✓

---

## 🧪 Casos de Prueba

```javascript
// Test: MaterialFactory cachea correctamente
test('MaterialFactory caches materials', () => {
  const factory = new MaterialFactory();
  const mat1 = factory.getMaterial('test', { color: 0xFF0000 });
  const mat2 = factory.getMaterial('test');
  expect(mat1).toBe(mat2); // Mismo objeto
});

// Test: HouseBuilder construye en orden
test('HouseBuilder constructs correctly', () => {
  const builder = new HouseBuilder(geomFactory, matFactory);
  const house = builder
    .buildBase(materials)
    .buildRoof(materials)
    .build();
  expect(house.children.length).toBe(2);
});

// Test: AnimationManager actualiza posiciones
test('AnimationManager updates positions', () => {
  const obj = new THREE.Object3D();
  const anim = new AnimationManager();
  anim.createBobbing(obj, 1, 0.1);
  const originalY = obj.position.y;
  anim.update();
  anim.update();
  expect(obj.position.y).not.toBe(originalY);
});
```

---

## 🎯 Resumen de Casos

| Caso | Dificultad | Tiempo | Archivo |
|------|-----------|--------|---------|
| Agregar árbol | ⭐ Fácil | 5 min | TreeBuilder.js |
| Puerta interactiva | ⭐ Fácil | 10 min | DoorInteraction.js |
| Animaciones | ⭐⭐ Media | 20 min | AnimationManager.js |
| Partículas | ⭐⭐ Media | 30 min | ParticleSystem.js |
| Múltiples escenas | ⭐⭐⭐ Difícil | 40 min | SceneSwitch.js |
| Configuración | ⭐⭐ Media | 20 min | ConfigManager.js |

---

## ✨ Conclusión

La arquitectura SOLID permite:
- ✅ Reutilizar código fácilmente
- ✅ Agregar features sin romper nada
- ✅ Testear componentes independientemente
- ✅ Escalar el proyecto sin problemas
- ✅ Mantener código limpio y profesional

¡Ahora estás listo para cualquier proyecto 3D! 🚀
