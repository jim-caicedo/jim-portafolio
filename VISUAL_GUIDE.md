# SISTEMA DE CONTROL - Rubik's Cube 3D

## 🎮 MAPEO DE ENTRADA

```
┌──────────────────────────────────────────────┐
│         TECLADO DEL USUARIO                   │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  KeyboardController.handleKeyEvent()          │
│  ┌────────────────────────────────────────┐  │
│  │ Tecla: U, D, L, R, F, B                │  │
│  │ Modificador: SHIFT                      │  │
│  │ isAnimating? → true = rechazar          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  RotateFaceStrategy.getFaceParams()           │
│  ┌────────────────────────────────────────┐  │
│  │ U → (axis=1, angle=π/2, name="U")     │  │
│  │ D → (axis=1, angle=-π/2, name="D")    │  │
│  │ L → (axis=0, angle=-π/2, name="L")    │  │
│  │ R → (axis=0, angle=π/2, name="R")     │  │
│  │ F → (axis=2, angle=π/2, name="F")     │  │
│  │ B → (axis=2, angle=-π/2, name="B")    │  │
│  │ SHIFT → angle *= -1                    │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  MoveStrategy.execute()                       │
│  ┌────────────────────────────────────────┐  │
│  │ getLayerByFace()                       │  │
│  │ ↓                                      │  │
│  │ Selecciona 9 cubitos                   │  │
│  │ (filtro por coordenadas)               │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  MoveStrategy.animateRotation()               │
│  ┌────────────────────────────────────────┐  │
│  │ Loop 300ms @ 60FPS (18 frames)         │  │
│  │                                        │  │
│  │ Para cada frame:                       │  │
│  │ 1. centroid = promedio(9 posiciones)   │  │
│  │ 2. Para cada cubie:                    │  │
│  │    a) relativePos = pos - centroid     │  │
│  │    b) appliedPos = quat * relativePos  │  │
│  │    c) finalPos = appliedPos + centroid │  │
│  │ 3. requestAnimationFrame()             │  │
│  │                                        │  │
│  │ Al terminar:                           │  │
│  │ - Redondear posiciones                 │  │
│  │ - Resolver promesa                     │  │
│  │ - isAnimating = false                  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  RESULTADO: Cubo rotado + UI actualizada      │
└──────────────────────────────────────────────┘
```

---

## 🔄 CICLO DE ANIMACIÓN

```
Frame 0 (0ms)      Frame 10 (166ms)    Frame 18 (300ms)
Progress: 0%       Progress: 55%       Progress: 100%
Angle: 0°          Angle: 99°          Angle: 90°

┌──────────────┐   ┌──────────────┐    ┌──────────────┐
│ ┌──────────┐ │   │ ┌──────────┐ │    │ ┌──────────┐ │
│ │          │ │   │ │ ◺ ◸ ◹    │ │    │ │          │ │
│ │ (original)│ │   │ │  (intermedio)│ │ │ (rotado) │ │
│ │          │ │   │ │         │ │    │ │          │ │
│ └──────────┘ │   │ └──────────┘ │    │ └──────────┘ │
└──────────────┘   └──────────────┘    └──────────────┘

Easing: Linear con interpolación
Duración: 300ms
FPS Target: 60 (~16.67ms por frame)
```

---

## 📊 ESTRUCTURA DE DATOS

### Cubie (Pieza Individual)

```
Cubie {
  position: Vector3         // (x, y, z) en -1.05 a 1.05
  quaternion: Quaternion    // Rotación 3D
  userData: {
    color: [R,G,B]         // Color del material
    faces: 6                // Máximo 6 caras visibles
    stickers: [...]         // Colores individuales
  }
  geometry: BoxGeometry     // 0.95 unidades
  material: Material        // Material coloreado
}

// Ejemplo: Cubie esquina superior-derecha-frontal
{
  position: (1.05, 1.05, 1.05),
  quaternion: (0, 0, 0, 1),
  userData: {
    color: [255, 255, 255],
    faces: 3,
    stickers: [
      { position: "top", color: [255, 255, 0] },      // Amarillo
      { position: "right", color: [255, 0, 0] },      // Rojo
      { position: "front", color: [255, 165, 0] }     // Naranja
    ]
  }
}
```

### Layer (Capa de 9 Cubitos)

```
Layer: U (Superior)
┌──────────────────────────────────────┐
│  ┌─────┐ ┌─────┐ ┌─────┐            │
│  │ C00 │ │ E00 │ │ C01 │  y > 0.5   │
│  └─────┘ └─────┘ └─────┘            │
│                                      │
│  ┌─────┐ ┌─────┐ ┌─────┐            │
│  │ E30 │ │ C02 │ │ E10 │            │
│  └─────┘ └─────┘ └─────┘            │
│                                      │
│  ┌─────┐ ┌─────┐ ┌─────┐            │
│  │ C03 │ │ E20 │ │ C04 │            │
│  └─────┘ └─────┘ └─────┘            │
└──────────────────────────────────────┘
C = Corner (esquina)
E = Edge (arista)
C02 = Centro (sticker central de face)

Total por layer: 9 cubitos
Cada uno contribuye 1 sticker a la face visible
```

---

## 🎯 SELECCIÓN DE LAYER POR FACE

```
Cubo visto desde frente:

        ┌─────┐
        │  U  │  y > 0.5
        └─────┘
  ┌─────┬─────┬─────┐
  │ L   │ F   │ R   │  x < -0.5 | z > 0.5 | x > 0.5
  │x<-  │z>   │x>   │
  └─────┼─────┼─────┘
        │  D  │  y < -0.5
        └─────┘

Back (z < -0.5) no visible en esta vista

Selección por umbral:
U: cubies.filter(c => c.position.y > 0.5)   // 9 cubitos
D: cubies.filter(c => c.position.y < -0.5)  // 9 cubitos
L: cubies.filter(c => c.position.x < -0.5)  // 9 cubitos
R: cubies.filter(c => c.position.x > 0.5)   // 9 cubitos
F: cubies.filter(c => c.position.z > 0.5)   // 9 cubitos
B: cubies.filter(c => c.position.z < -0.5)  // 9 cubitos
```

---

## 🔢 MATEMÁTICA DE ROTACIÓN

### Quaternion Setup

```
Para rotar 90° alrededor del eje Y (U = cara superior):

1. Eje de rotación
   axis = (0, 1, 0)

2. Ángulo de rotación
   angle = Math.PI / 2 = 90°

3. Crear quaternion
   q = new Quaternion()
   q.setFromAxisAngle(axis, angle)
   q = {x: 0, y: 0.707, z: 0, w: 0.707}
```

### Translate-Rotate-Translate

```
Rotar cubito alrededor de centroid (0, 0.68, 0):

Cubito en: (1.05, 1.05, 0)
Centroid: (0, 0.68, 0)

PASO 1: Traslade relativo
  rel = (1.05, 1.05, 0) - (0, 0.68, 0)
  rel = (1.05, 0.37, 0)

PASO 2: Aplique quaternion
  rel_rotated = quat * rel
  rel_rotated ≈ (0, 0.37, 1.05)
  
  (Razonamiento: rotación CCW alrededor de Y90°
   transforma (x,z) → (-z,x)
   (1.05, 0) → (0, 1.05) ✓)

PASO 3: Traslade de vuelta
  final = (0, 0.37, 1.05) + (0, 0.68, 0)
  final = (0, 1.05, 1.05)

RESULTADO: Cubito se movió de (1.05, 1.05, 0) a (0, 1.05, 1.05)
```

---

## ⏱️ TIMELINE DE EJECUCIÓN

```
Presión tecla "U" → Rendimiento

 0ms  ├─ keyEvent detected
      ├─ isAnimating check: false ✓
      ├─ RotateFaceStrategy created
      ├─ getFaceParams() calculated
      ├─ getLayerByFace() selected 9 cubitos
      │
 1-2ms├─ animateRotation() iniciado
      ├─ calculateCentroid() computed
      │
 2ms  ├─ Frame 1: progress=0%, angle=0°
16ms  ├─ Frame 2: progress=5%, angle=4.7°
33ms  ├─ Frame 3: progress=11%, angle=9.4°
      │  ...
166ms ├─ Frame 10: progress=55%, angle=49.5°
      │  ...
300ms ├─ Frame 18: progress=100%, angle=90°
      ├─ Position rounding
      ├─ Promise resolved
      ├─ moveHistory.addMove() called
      ├─ isAnimating = false
      │
301ms ├─ User dapat presionar siguiente tecla

Total: ~301ms desde input hasta siguiente input permitido
```

---

## 🔗 DEPENDENCIAS

```
Interior.js (React)
  ├─ useEffect() hook
  ├─ useRef() hook
  │
  ├─ THREE library
  │  ├─ Scene
  │  ├─ Camera
  │  ├─ Renderer
  │  ├─ Lights
  │  ├─ Geometry
  │  ├─ Material
  │  ├─ Quaternion
  │  ├─ Vector3
  │  └─ Group
  │
  ├─ SceneManager
  │  └─ THREE objects
  │
  ├─ RubiksCubeBuilder
  │  ├─ CubieBuilder (26 instances)
  │  └─ THREE.Group
  │
  ├─ KeyboardController
  │  ├─ RotateFaceStrategy
  │  │  ├─ MoveStrategy (base)
  │  │  └─ THREE (quaternion)
  │  │
  │  ├─ MoveHistory
  │  │
  │  └─ DOM (instrucciones panel)
  │
  └─ AnimationLoop (requestAnimationFrame)
     └─ renderer.render()
```

---

## 🎨 FLUJO VISUAL

```
Usuario Input
    ↓
┌───────────────────────────────────────┐
│ KeyboardController                     │
│ ├─ Detecta tecla (U,D,L,R,F,B)        │
│ ├─ Detecta SHIFT (inversa)            │
│ ├─ Log: [MOVE] U                      │
│ └─ Crea RotateFaceStrategy            │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ RotateFaceStrategy                    │
│ ├─ Calcula parámetros de rotación     │
│ ├─ Selecciona 9 cubitos               │
│ └─ Log: [LAYER] Face U: 9 cubies      │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ MoveStrategy (animateRotation)        │
│ ├─ Calcula centroid                   │
│ ├─ Loop 300ms                         │
│ │  ├─ Progress: 0% → 100%             │
│ │  ├─ Angle interpolación             │
│ │  ├─ Translate cubitos               │
│ │  ├─ Rotate cubitos                  │
│ │  ├─ Translate de vuelta             │
│ │  └─ Log: [ROTATE] U - 9 cubies...   │
│ ├─ Redondea posiciones                │
│ └─ Log: [MOVE] U completed            │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ Cubo Actualizado                      │
│ ├─ 9 cubitos rotados 90°              │
│ ├─ Resto sin cambios                  │
│ ├─ Geometría perfecta (no deformada)  │
│ └─ Listo para siguiente rotación      │
└───────────────────────────────────────┘
```

