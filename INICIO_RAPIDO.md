# 🎓 Guía de Inicio - Refactorización SOLID

## 👋 Bienvenido

Tu proyecto ha sido completamente refactorizado siguiendo los **5 Principios SOLID**. Este archivo te guiará en los primeros pasos.

---

## 🚀 Inicio Rápido

### 1. Ejecutar el proyecto
```bash
npm start
```

### 2. Ver qué cambió
- Tu código ahora está en `src/three/` (módulos reutilizables)
- Los componentes están en `src/components/` (más simples)
- La documentación está en archivos `.md`

### 3. Entender la estructura
```
src/
├── three/                    ← Nuevos módulos SOLID
│   ├── materials/
│   ├── geometries/
│   ├── objects/
│   ├── lighting/
│   ├── interaction/
│   └── scene/
└── components/              ← Componentes (ahora más simples)
    ├── House.js             ← Refactorizado
    └── Scene.js             ← Antes "Scenne.js"
```

---

## 📚 Documentación (Lee en Este Orden)

### 1. **REFACTORING_SUMMARY.md** (5-10 min) ⭐ COMIENZA AQUÍ
   - Visión general de los cambios
   - Resumen ejecutivo
   - Checklist de mejoras

### 2. **ESTRUCTURA_PROYECTO.md** (10-15 min)
   - Diagrama visual de dependencias
   - Árbol de archivos completo
   - Flujo de datos
   - Comparativa antes/después

### 3. **REFACTORING_SOLID.md** (20-30 min)
   - Explicación detallada de cada principio SOLID
   - Patrones de diseño usados
   - Ejemplos prácticos
   - Guide de uso

### 4. **EXEMPLOS_PRACTICOS.js** (15-20 min)
   - 8 ejemplos listos para copiar/pegar
   - Cómo agregar nuevas features
   - Cómo extender cada módulo

---

## 🏗️ Arquitectura de 30 Segundos

### Antes (Monolítico)
```javascript
const House = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(...);
    const renderer = new THREE.WebGLRenderer();
    // ... 130+ líneas de lógica aquí ...
  }, []);
};
```

### Después (Modular)
```javascript
const House = () => {
  useEffect(() => {
    const sceneManager = new SceneManager(mount);
    const materialFactory = new MaterialFactory();
    const geometryFactory = new GeometryFactory();
    
    const house = new HouseBuilder(geometryFactory, materialFactory)
      .buildBase(materials)
      .buildRoof(materials)
      .build();
      
    sceneManager.add(house);
  }, []);
};
```

---

## 📦 Los 6 Módulos Nuevos

### 1. **SceneManager** (`src/three/scene/SceneManager.js`)
Gestiona la escena, cámara y renderer
```javascript
const sceneManager = new SceneManager(container);
sceneManager.initialize();
sceneManager.add(object);
sceneManager.startAnimationLoop(callback);
```

### 2. **MaterialFactory** (`src/three/materials/MaterialFactory.js`)
Crea y cachea materiales
```javascript
const factory = new MaterialFactory();
const materials = factory.createDefaultMaterials();
const customMat = factory.getMaterial('myMat', { color: 0xFF0000 });
```

### 3. **GeometryFactory** (`src/three/geometries/GeometryFactory.js`)
Crea geometrías
```javascript
const factory = new GeometryFactory();
const box = factory.createBox(1, 1, 1);
const cone = factory.createCone(1, 2, 8);
```

### 4. **HouseBuilder** (`src/three/objects/HouseBuilder.js`)
Construye objetos 3D con patrón Builder
```javascript
const house = new HouseBuilder(geometryFactory, materialFactory)
  .buildBase(materials)
  .buildRoof(materials)
  .build();
```

### 5. **LightingSetup** (`src/three/lighting/LightingSetup.js`)
Configura la iluminación
```javascript
const lighting = new LightingSetup(scene);
lighting.setupLighting();
```

### 6. **RaycastInteraction** (`src/three/interaction/RaycastInteraction.js`)
Maneja clicks e interacciones
```javascript
const raycast = new RaycastInteraction(camera, container);
raycast.on(door, () => console.log('Click en puerta'));
```

---

## 🎯 Tareas Comunes

### Agregar un nuevo material
```javascript
// En House.js
const customMat = materialFactory.getMaterial('custom', {
  color: 0xFF0000,
  metalness: 0.5,
});
```

### Crear un nuevo objeto 3D (Árbol)
```javascript
// 1. Crear src/three/objects/TreeBuilder.js
class TreeBuilder {
  buildTrunk() { }
  buildCanopy() { }
  build() { }
}

// 2. Usar en House.js
const tree = new TreeBuilder(geometryFactory, materialFactory)
  .buildTrunk(materials)
  .buildCanopy(materials)
  .build();
sceneManager.add(tree);
```

### Agregar una animación
```javascript
sceneManager.startAnimationLoop(() => {
  house.rotation.y += 0.002;
  tree.position.y += Math.sin(Date.now() * 0.001) * 0.01;
});
```

---

## ✅ Checklist - Qué Aprender

- [ ] Lee REFACTORING_SUMMARY.md
- [ ] Lee ESTRUCTURA_PROYECTO.md
- [ ] Entiende los 5 principios SOLID
- [ ] Entiende los 3 patrones de diseño (Factory, Builder, Manager)
- [ ] Explora los 6 módulos nuevos
- [ ] Intenta agregar un nuevo módulo (Ej: TreeBuilder)
- [ ] Compila sin warnings: `npm run build`

---

## 🔍 Dónde Encontrar Qué

| Necesito... | Donde está |
|------------|-----------|
| Cambiar colores | `src/three/materials/MaterialFactory.js` |
| Agregar geometrías | `src/three/geometries/GeometryFactory.js` |
| Crear nuevo objeto 3D | `src/three/objects/` |
| Cambiar iluminación | `src/three/lighting/LightingSetup.js` |
| Manejar clicks | `src/three/interaction/RaycastInteraction.js` |
| Configurar escena | `src/three/scene/SceneManager.js` |
| Orquestar todo | `src/components/House.js` |

---

## 💡 Principios SOLID Explicados Simplemente

1. **SRP** - Single Responsibility
   - Una clase = Una responsabilidad
   - MaterialFactory solo crea materiales ✓

2. **OCP** - Open/Closed
   - Abierto para extensión, cerrado para cambios
   - Usa factories para agregar nuevos materiales ✓

3. **LSP** - Liskov Substitution
   - Puedes cambiar un tipo por otro sin problemas
   - Todas las factories funcionan igual ✓

4. **ISP** - Interface Segregation
   - Interfaces pequeñas y específicas
   - SceneManager solo expone lo necesario ✓

5. **DIP** - Dependency Inversion
   - Depende de abstracciones
   - No acoplado directamente a THREE.js ✓

---

## 🚀 Próximos Pasos

### Nivel 1 (Fácil)
- [ ] Cambiar colores de materiales
- [ ] Agregar más geometrías
- [ ] Modificar tamaños de objetos

### Nivel 2 (Medio)
- [ ] Crear TreeBuilder similar a HouseBuilder
- [ ] Agregar AnimationManager para animaciones
- [ ] Extender RaycastInteraction para múltiples objetos

### Nivel 3 (Avanzado)
- [ ] Agregar TypeScript (interfaces)
- [ ] Agregar tests unitarios
- [ ] Agregar física (Cannon.js)
- [ ] Agregar post-processing

---

## 🆘 Preguntas Frecuentes

**P: ¿Cómo agrego una geometría nueva?**
R: En `GeometryFactory.js`, agrega un método `createMyShape()`

**P: ¿Cómo creo un objeto 3D nuevo?**
R: Crea un Builder en `src/three/objects/MyObjectBuilder.js`

**P: ¿Puedo usar esto en otro proyecto?**
R: Sí, copia `src/three/` a tu nuevo proyecto

**P: ¿Cómo hago testing?**
R: Cada módulo es independiente, fácil de mockear

**P: ¿Se puede hacer TypeScript?**
R: Sí, agregar tipos es trivial ahora

---

## 📞 Soporte

Todas tus dudas se responden en:
- **REFACTORING_SOLID.md** - Documentación técnica
- **EXEMPLOS_PRACTICOS.js** - Ejemplos reales
- **ESTRUCTURA_PROYECTO.md** - Diagrama y flujos

---

## ✨ Síntesis

Tu código ahora es:
- ✅ **Modular** - Componentes independientes
- ✅ **Testeable** - Fácil de probar
- ✅ **Escalable** - Agregar features sin riesgo
- ✅ **Mantenible** - Fácil de entender
- ✅ **Profesional** - Código de calidad

Felicitaciones, tienes una base sólida para cualquier proyecto 3D. 🎉

---

**¿Listo para empezar?**

```bash
npm start
```

¡Que disfrutes!
