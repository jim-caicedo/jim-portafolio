# 📖 QUICK REFERENCE - Rubik's Cube 3D

## 🎮 CONTROLES

| Tecla | Acción |
|-------|--------|
| **U** | Rota cara superior (Up) |
| **D** | Rota cara inferior (Down) |
| **L** | Rota cara izquierda (Left) |
| **R** | Rota cara derecha (Right) |
| **F** | Rota cara frontal (Front) |
| **B** | Rota cara trasera (Back) |
| **SHIFT + U/D/L/R/F/B** | Rotación inversa |

---

## 📁 ESTRUCTURA DE CARPETAS

```
src/
├── pages/
│   └── Interior.js ........................ Componente React principal
├── three/
│   ├── SceneManager.js ................... Gestor de escena Three.js
│   ├── CubieBuilder.js ................... Crea piezas individuales
│   ├── RubiksCubeBuilder.js .............. Ensambla el cubo
│   └── strategies/
│       ├── MoveStrategy.js ............... Base abstracta (77 líneas)
│       ├── moves/
│       │   └── RotateFaceStrategy.js ..... Implementa U,D,L,R,F,B (81 líneas)
│       ├── input/
│       │   └── KeyboardController.js ..... Gestor de teclado (110 líneas)
│       └── history/
│           └── MoveHistory.js ............ Undo/Redo stack (87 líneas)
```

---

## 🔍 CLASSES

### MoveStrategy (Base Abstracta)
```javascript
class MoveStrategy {
  constructor(config)          // { name, axis, angle, getLayer }
  execute(cube, cubies)        // Retorna promesa
  animateRotation(layer)       // Loop 300ms
  calculateCentroid(layer)     // Promedio de posiciones
  getRotationAxis()            // Vector3 de eje
}
```

### RotateFaceStrategy (Hereda MoveStrategy)
```javascript
class RotateFaceStrategy extends MoveStrategy {
  constructor(config)          // { face, direction }
  static getFaceParams(face, dir)      // Mapea U→axis
  static getLayerByFace(cubies, face)  // Selecciona 9
}
```

### KeyboardController (Input Manager)
```javascript
class KeyboardController {
  setupKeyboardListener()      // Registra eventos
  handleKeyEvent(event)        // Procesa tecla
  executeMove(face, dir)       // Crea y ejecuta estrategia
}
```

### MoveHistory (Undo/Redo)
```javascript
class MoveHistory {
  addMove(moveData)           // Agrega historial
  undo()                      // Deshace
  redo()                      // Rehace
}
```

---

## 📊 VARIABLES CLAVE

| Variable | Tipo | Rango | Notas |
|----------|------|-------|-------|
| `position` | Vector3 | -1.05 a 1.05 | Posición de cubito |
| `quaternion` | Quaternion | (0,0,0,1) | Rotación 3D |
| `centroid` | Vector3 | -1 a 1 | Centro de rotación |
| `angle` | Number | π/2 ≈ 1.57 | 90° en radianes |
| `progress` | Number | 0.0 a 1.0 | Frame animation % |
| `isAnimating` | Boolean | true/false | Flag de prevención |

---

## 🔧 CONSTANTES

```javascript
// Timing
ANIMATION_DURATION = 300      // ms
FPS_TARGET = 60               // Frames por segundo
FRAME_TIME = 16.67            // ms por frame

// Geometry
CUBIE_SIZE = 0.95             // Tamaño de pieza
CUBIE_SPACING = 1.05          // Separación entre piezas
CUBIES_TOTAL = 26             // Piezas totales

// Rounding
ROUND_PRECISION = 20          // Divisor para redondeo
// Uso: Math.round(value * 20) / 20

// Axes
AXIS_X = 0                    // X axis
AXIS_Y = 1                    // Y axis (Up/Down)
AXIS_Z = 2                    // Z axis

// Directions
CW = 1                        // Clockwise (horario)
CCW = -1                      // Counter-clockwise (antihorario)
```

---

## 💻 CONSOLE LOGS

### Formato
```
[PREFIX] message
```

### Prefijos
- `[MOVE]` - Movimiento iniciado/completado
- `[ROTATE]` - Debug de rotación
- `[LAYER]` - Debug de selección
- `[ERROR]` - Errores

### Ejemplos
```javascript
// User presiona U
[MOVE] U

// Animación inicia
[ROTATE] U - 9 cubies, centroid: (0.00, 0.68, 0.00)

// Selección de capa
[LAYER] Face U: 9 cubies

// Completado
[MOVE] U completed

// Error
[ERROR] No cubies found for move: U
```

---

## 🧮 MATEMÁTICA RÁPIDA

### Rotación con Quaternion
```javascript
// Crear rotación 90° sobre eje Y
const axis = new Vector3(0, 1, 0);
const angle = Math.PI / 2;
const q = new Quaternion();
q.setFromAxisAngle(axis, angle);

// Aplicar a posición
pos.applyQuaternion(q);
```

### Translate-Rotate-Translate
```javascript
// Rotar alrededor de punto arbitrario
const relPos = pos.clone().sub(centroid);    // Traslade
relPos.applyQuaternion(quaternion);           // Rote
const finalPos = relPos.add(centroid);        // Traslade de vuelta
```

### Centroide
```javascript
// Promedio de 9 posiciones
const centroid = new Vector3(0, 0, 0);
layer.forEach(cubie => centroid.add(cubie.position));
centroid.divideScalar(layer.length);
```

---

## 🎯 SELECCIÓN DE LAYER POR FACE

```javascript
U: cubies.filter(c => c.position.y > 0.5)   // 9 cubitos
D: cubies.filter(c => c.position.y < -0.5)  // 9 cubitos
L: cubies.filter(c => c.position.x < -0.5)  // 9 cubitos
R: cubies.filter(c => c.position.x > 0.5)   // 9 cubitos
F: cubies.filter(c => c.position.z > 0.5)   // 9 cubitos
B: cubies.filter(c => c.position.z < -0.5)  // 9 cubitos
```

---

## ⚙️ PARÁMETROS DE ROTACIÓN

| Face | Axis | Angle | Dirección |
|------|------|-------|-----------|
| **U** | Y (1) | +π/2 | CCW vista desde arriba |
| **U'** | Y (1) | -π/2 | CW vista desde arriba |
| **D** | Y (1) | -π/2 | CW vista desde abajo |
| **D'** | Y (1) | +π/2 | CCW vista desde abajo |
| **L** | X (0) | -π/2 | CW vista desde izq. |
| **L'** | X (0) | +π/2 | CCW vista desde izq. |
| **R** | X (0) | +π/2 | CW vista desde der. |
| **R'** | X (0) | -π/2 | CCW vista desde der. |
| **F** | Z (2) | +π/2 | CCW vista desde frente |
| **F'** | Z (2) | -π/2 | CW vista desde frente |
| **B** | Z (2) | -π/2 | CW vista desde atrás |
| **B'** | Z (2) | +π/2 | CCW vista desde atrás |

---

## 🐛 DEBUGGING

### Ver Logs en Console
1. Abre DevTools: F12 o Ctrl+Shift+I
2. Ve a Console tab
3. Presiona tecla (ej: U)
4. Observa los logs:
   ```
   [MOVE] U
   [ROTATE] U - 9 cubies, centroid: (0.00, 0.68, 0.00)
   [MOVE] U completed
   ```

### Verificar Estado
```javascript
// En console
// Ver si está animando
console.log(window.keyboardController.isAnimating);

// Ver historial
console.log(window.moveHistory.getHistory());

// Ver posición de cubito
console.log(window.rubiksCube.children[0].position);
```

### Puntos de Debug Importantes
1. KeyboardController.handleKeyEvent() → entrada
2. RotateFaceStrategy.getLayerByFace() → selección
3. MoveStrategy.calculateCentroid() → pivot
4. MoveStrategy.animateRotation() → animación

---

## 🚀 PERFORMANCE

### Métricas Target
- **Input latency**: 0-5ms
- **Animation**: 60 FPS (16.67ms per frame)
- **Animation duration**: 300ms
- **Total per move**: ~301ms
- **Memory**: <10MB durante ejecución
- **Memory after 1000 moves**: Sin cambios (no hay leaks)

### Optimizaciones Activas
1. RAF Loop (requestAnimationFrame)
2. Reutilización de Vector3/Quaternion
3. isAnimating flag (previene overlaps)
4. Redondeo inteligente (evita acumulación)

---

## ✅ TESTING RÁPIDO

Prueba estas secuencias para validar el cubo:

```
// Secuencia 1: Volver a estado original
U U U U       // Debería volver al inicio

// Secuencia 2: Inversa
U SHIFT+U     // U seguido de U' (inversa)

// Secuencia 3: Todas las caras
U D L R F B   // Las 6 caras funcionan

// Secuencia 4: Stress test
U U U D D D L L L R R R F F F B B B
// 24 rotaciones sin problemas

// Secuencia 5: Input durante animación
U (presiona rápido otra tecla) 
// Debería ignorar la segunda input
```

---

## 📚 DOCUMENTACIÓN COMPLETA

| Archivo | Propósito | Líneas |
|---------|----------|--------|
| **README.md** | Descripción general | 50 |
| **ARCHITECTURE.md** | Diseño técnico | 390 |
| **FLOWCHART.md** | Diagrama de flujo | 410 |
| **VISUAL_GUIDE.md** | Guías visuales | 380 |
| **STATUS.md** | Resumen ejecutivo | 340 |
| **SUMMARY.md** | Resumen de cambios | 280 |
| **QUICK_REFERENCE.md** | Este archivo | 350 |

---

## 🔗 ENLACES RÁPIDOS

**Código Principal**
- MoveStrategy.js: Animación base
- RotateFaceStrategy.js: Mapeo de faces
- KeyboardController.js: Input

**Documentación Técnica**
- ARCHITECTURE.md: Patrones y diseño
- FLOWCHART.md: Flujo de ejecución
- VISUAL_GUIDE.md: Diagramas

**Resúmenes**
- STATUS.md: Estado actual
- SUMMARY.md: Cambios realizados
- QUICK_REFERENCE.md: Este archivo

---

## ❓ FAQ RÁPIDA

**P: ¿Cómo agregar un nuevo movimiento?**  
R: Extender MoveStrategy, implementar getLayerByFace(), registrar en KeyboardController.

**P: ¿Dónde están los comentarios?**  
R: El código es autodocumentado. Ver ARCHITECTURE.md para explicaciones.

**P: ¿Por qué 300ms la animación?**  
R: Balance entre suave (60fps) y rápido. Adjustable en MoveStrategy.duration.

**P: ¿Cómo debugar un problema?**  
R: Ver console logs [MOVE], [ROTATE], [ERROR]. Ver FLOWCHART.md para timeline.

**P: ¿Dónde está el undo/redo?**  
R: MoveHistory.js implementado pero sin UI. Ver ARCHITECTURE.md sección extensibilidad.

---

**Última actualización**: 20 de Enero de 2025  
**Versión**: 1.0 (Production Ready)  
**Estado**: ✅ Completado

