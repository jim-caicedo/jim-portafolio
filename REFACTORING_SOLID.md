# Refactorización SOLID - Jim's Portfolio

## 📋 Resumen de Cambios

Se ha refactorizado completamente el código siguiendo principios SOLID y patrones de diseño modernos. El código original estaba monolítico; ahora está modular, mantenible y reutilizable.

---

## 🏗️ Estructura Nueva

```
src/
├── three/
│   ├── materials/
│   │   └── MaterialFactory.js      (Factory Pattern)
│   ├── geometries/
│   │   └── GeometryFactory.js      (Factory Pattern)
│   ├── objects/
│   │   └── HouseBuilder.js         (Builder Pattern)
│   ├── lighting/
│   │   └── LightingSetup.js        (Manager Class)
│   ├── interaction/
│   │   └── RaycastInteraction.js   (Manager Class)
│   └── scene/
│       └── SceneManager.js         (Manager Class)
├── components/
│   ├── House.js                    (Refactorizado)
│   └── Scenne.js → Scene.js        (Refactorizado)
```

---

## 📌 Principios SOLID Aplicados

### 1. **Single Responsibility Principle (SRP)**

**Antes:** `House.js` hacía TODO (scene, camera, materiales, geometrías, luces, interacciones)

**Ahora:** Cada clase tiene una responsabilidad única:

- `MaterialFactory` → Solo crea materiales
- `GeometryFactory` → Solo crea geometrías
- `LightingSetup` → Solo configura iluminación
- `HouseBuilder` → Solo construye la casa
- `SceneManager` → Solo gestiona la escena
- `RaycastInteraction` → Solo maneja interacciones
- `House.js` → Solo orquesta todo

```javascript
// ANTES (SRP violado)
const House = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(...);
    const renderer = new THREE.WebGLRenderer();
    const wallMat = new THREE.MeshStandardMaterial({...});
    // 200+ líneas de código mezclado
  }, []);
};

// AHORA (SRP respetado)
const House = () => {
  useEffect(() => {
    const sceneManager = new SceneManager(mount);
    const materialFactory = new MaterialFactory();
    const houseBuilder = new HouseBuilder(geometryFactory, materialFactory);
    // Código limpio y organizado
  }, []);
};
```

### 2. **Open/Closed Principle (OCP)**

**Antes:** Agregar nuevos materiales requería editar directamente el componente

**Ahora:** Usa `MaterialFactory` - abierto para extensión, cerrado para modificación

```javascript
// Fácil agregar nuevos materiales sin modificar código existente
const materials = materialFactory.createDefaultMaterials();
materials.custom = materialFactory.getMaterial('custom', { color: 0xFF00FF });
```

### 3. **Liskov Substitution Principle (LSP)**

Todas las factories siguen el mismo patrón:

```javascript
class GeometryFactory {
  createBox() { }
  createCone() { }
  createPlane() { }
  dispose() { }
}

class MaterialFactory {
  getMaterial() { }
  createDefaultMaterials() { }
  dispose() { }
}
```

Pueden usarse de forma intercambiable en cualquier lugar que espere estas interfaces.

### 4. **Interface Segregation Principle (ISP)**

**Antes:** Monolito con muchas responsabilidades

**Ahora:** Interfaces específicas y pequeñas:

```javascript
// SceneManager expone solo lo necesario
sceneManager.initialize()
sceneManager.add(object)
sceneManager.startAnimationLoop(callback)
sceneManager.onWindowResize()
sceneManager.dispose()
```

### 5. **Dependency Inversion Principle (DIP)**

**Antes:** Acoplamiento directo a THREE.js en el componente

**Ahora:** El componente depende de abstracciones (factories y managers)

```javascript
// ANTES - Acoplado
const House = () => {
  // THREE.js directamente aquí
  const scene = new THREE.Scene();
  const material = new THREE.MeshStandardMaterial({...});
};

// AHORA - Desacoplado
const House = () => {
  const sceneManager = new SceneManager(mount);
  const materialFactory = new MaterialFactory();
  // Las dependencias están invertidas
};
```

---

## 🎨 Patrones de Diseño Utilizados

### 1. **Factory Pattern**

```javascript
// MaterialFactory.js
class MaterialFactory {
  getMaterial(name, config) {
    if (this.materials[name]) return this.materials[name];
    const material = new THREE.MeshStandardMaterial({ flatShading: true, ...config });
    this.materials[name] = material;
    return material;
  }
}

// Uso:
const materialFactory = new MaterialFactory();
const wallMat = materialFactory.getMaterial('wall', { color: 0xffe0b8 });
```

**Ventajas:**
- Centraliza la creación de objetos
- Cachea materiales para reutilizar
- Fácil de extender

### 2. **Builder Pattern**

```javascript
// HouseBuilder.js
const house = houseBuilder
  .buildBase(materials)
  .buildRoof(materials)
  .buildDoor(materials)
  .buildWindows(materials)
  .buildChimney(materials)
  .buildGround(materials)
  .build();
```

**Ventajas:**
- Construcción paso a paso
- Interfaz fluida y legible
- Separación de construcción y representación

### 3. **Manager Pattern**

```javascript
// SceneManager.js
class SceneManager {
  initialize() { }
  add(object) { }
  startAnimationLoop(callback) { }
  onWindowResize() { }
  dispose() { }
}
```

**Ventajas:**
- Encapsula la complejidad de THREE.js
- Interfaz simple y clara
- Gestión centralizada del ciclo de vida

---

## 📊 Comparativa: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Líneas en House.js** | 140 | 100 |
| **Complejidad ciclomática** | Alta | Baja |
| **Mantenibilidad** | Difícil | Fácil |
| **Reutilización** | Nula | Alta |
| **Testabilidad** | Difícil | Fácil |
| **Escalabilidad** | Limitada | Excelente |

---

## 🚀 Cómo Usar

### Crear una nueva escena 3D

```javascript
import SceneManager from '../three/scene/SceneManager';
import MaterialFactory from '../three/materials/MaterialFactory';
import GeometryFactory from '../three/geometries/GeometryFactory';

const MyComponent = () => {
  useEffect(() => {
    const sceneManager = new SceneManager(container);
    const materialFactory = new MaterialFactory();
    const geometryFactory = new GeometryFactory();

    sceneManager.initialize();
    
    const box = geometryFactory.createBox(1, 1, 1);
    const material = materialFactory.getMaterial('myMat', { color: 0xFF0000 });
    const mesh = new THREE.Mesh(box, material);
    
    sceneManager.add(mesh);
    sceneManager.startAnimationLoop(() => {
      mesh.rotation.x += 0.01;
    });
  }, []);
};
```

### Agregar nuevos materiales

```javascript
const materialFactory = new MaterialFactory();
const customMat = materialFactory.getMaterial('steel', {
  color: 0x888888,
  metalness: 0.8,
  roughness: 0.2,
});
```

### Crear nuevos objetos 3D

```javascript
class TreeBuilder {
  constructor(geometryFactory, materialFactory) {
    this.geometryFactory = geometryFactory;
    this.materialFactory = materialFactory;
    this.tree = new THREE.Group();
  }

  buildTrunk(materials) {
    const trunk = new THREE.Mesh(
      this.geometryFactory.createCone(0.2, 2, 8),
      materials.wood
    );
    this.tree.add(trunk);
    return this;
  }

  buildCanopy(materials) {
    const canopy = new THREE.Mesh(
      this.geometryFactory.createSphere(1, 32, 32),
      materials.green
    );
    canopy.position.y = 1.5;
    this.tree.add(canopy);
    return this;
  }

  build() {
    return this.tree;
  }
}

// Uso:
const tree = new TreeBuilder(geometryFactory, materialFactory)
  .buildTrunk(materials)
  .buildCanopy(materials)
  .build();
```

---

## 🧪 Beneficios Adicionales

### ✅ Testabilidad

```javascript
// Fácil de probar
test('MaterialFactory debe cachear materiales', () => {
  const factory = new MaterialFactory();
  const mat1 = factory.getMaterial('test', { color: 0xFF0000 });
  const mat2 = factory.getMaterial('test', { color: 0x00FF00 });
  expect(mat1).toBe(mat2); // Mismo objeto
});
```

### ✅ Mantenimiento

```javascript
// Cambiar la iluminación es trivial
const lighting = new LightingSetup(scene);
lighting.setupLighting(); // Limpio y organizado
```

### ✅ Escalabilidad

Agregar nuevas características (partículas, física, etc.) sin tocar código existente:

```javascript
class ParticleSystem { }
class PhysicsEngine { }

// Se integran fácilmente sin modificar House.js
```

---

## 📝 Notas

1. **Scenne.js** fue renombrado a **Scene.js** (se corrigió el typo)
2. Se corrigió el error `TorusKnotGreometry` → `TorusGeometry`
3. Se corrigió el color hexadecimal inválido `0x00ff023` → `0x00ff00`
4. Todas las factories incluyen método `dispose()` para limpieza de memoria
5. Los componentes ahora usan `useCallback` para optimizar rendimiento

---

## 🔄 Migration Guide

Si tienes otros componentes que usan THREE.js:

```javascript
// ANTES
const MyComponent = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(...);
  // ... más código ...
};

// DESPUÉS
const MyComponent = () => {
  const sceneManager = new SceneManager(container);
  sceneManager.initialize();
  // Usa sceneManager para todo
};
```

---

## 📚 Recursos

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns in JavaScript](https://www.patterns.dev/posts/design-patterns/)
- [Three.js Documentation](https://threejs.org/docs/)
