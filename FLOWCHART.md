# Diagrama de Flujo - Rubik's Cube 3D

## Flujo Principal: Desde Input hasta Rotación Completada

```
┌──────────────────────────────────────────────────────────────────┐
│                   USUARIO PRESIONA TECLA                          │
│              (U, D, L, R, F, B ± SHIFT modifier)                 │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────────┐
        │   KeyboardController.handleKeyEvent()    │
        │   • Valida la tecla presionada           │
        │   • Detecta modificador SHIFT (-1 = inv)│
        │   • Log: "[MOVE] U" o "[MOVE] D'"       │
        └─────────────────────┬───────────────────┘
                              │
                              ▼
                ┌─────────────────────────────────┐
                │  Verificar isAnimating flag     │
                │  (Prevenir ejecución duplicada) │
                │  Si true: descartar entrada     │
                └─────────────────────┬───────────┘
                                      │
                                      ▼
            ┌────────────────────────────────────────────┐
            │  RotateFaceStrategy.constructor()          │
            │  • face: "U" | "D" | "L" | "R" | "F" | "B" │
            │  • direction: 1 (CW) o -1 (CCW)            │
            └────────────────────┬───────────────────────┘
                                 │
                                 ▼
            ┌────────────────────────────────────────────┐
            │  RotateFaceStrategy.getFaceParams()        │
            │  Determina:                                │
            │  • Eje de rotación (0=X, 1=Y, 2=Z)        │
            │  • Ángulo (π/2 o -π/2)                    │
            │  • Nombre del movimiento ("U", "D'", etc) │
            └────────────────────┬───────────────────────┘
                                 │
                                 ▼
            ┌────────────────────────────────────────────┐
            │  strategy.execute(cube, cubies)            │
            │  Retorna promesa de animación              │
            └────────────────────┬───────────────────────┘
                                 │
                                 ▼
            ┌────────────────────────────────────────────┐
            │  MoveStrategy.animateRotation(layer)       │
            │                                            │
            │  1. getLayerByFace():                      │
            │     Selecciona 9 cubitos:                 │
            │     • U: pos.y > 0.5 (superior)           │
            │     • D: pos.y < -0.5 (inferior)          │
            │     • L: pos.x < -0.5 (izquierda)         │
            │     • R: pos.x > 0.5 (derecha)            │
            │     • F: pos.z > 0.5 (frente)             │
            │     • B: pos.z < -0.5 (atrás)             │
            │                                            │
            │  2. calculateCentroid():                   │
            │     Promedio de 9 posiciones               │
            │                                            │
            │  3. getRotationAxis():                     │
            │     Convierte índice a Vector3             │
            │                                            │
            │  Log: "[ROTATE] U - 9 cubies, centroid:..."│
            └────────────────────┬───────────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
    ┌─────────────────────────────┐   ┌────────────────────────────┐
    │  FOR EACH ANIMATION FRAME    │   │  startTime = Date.now()    │
    │  (300ms total)               │   │  isAnimating = true        │
    │                              │   │  setInterval/RAF loop      │
    │  Progress: 0.0 → 1.0         │   └────────────────────────────┘
    │                              │
    │  currentAngle = angle * prog │
    │  quaternion.setFromAxisAngle │
    │                              │
    │  FOR EACH CUBIE IN LAYER:    │
    │  ═══════════════════════════ │
    │  1. relativePos = cubie.pos  │
    │     - centroid (origen)      │
    │                              │
    │  2. relativePos.apply        │
    │     Quaternion(rotation)     │
    │                              │
    │  3. cubie.pos = relativePos  │
    │     + centroid (mundo)       │
    │                              │
    │  4. cubie.quaternion *=      │
    │     currentQuaternion        │
    │                              │
    │  requestAnimationFrame()     │
    │  si progress < 1.0           │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │  Animación Completada?           │
    │  (progress >= 1.0)               │
    └──────┬──────────────────┬────────┘
           │ NO (loop)        │ SI
           │                  │
        LOOP                   ▼
           │         ┌──────────────────────────┐
           └────────→│  Redondear posiciones:   │
                     │  pos *= 20, round, /20   │
                     │  Evitar errores float    │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │  Log: "[MOVE] U completed"│
                     │  resolve() → promesa OK   │
                     │  isAnimating = false      │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │  moveHistory.addMove()   │
                     │  Registra en undo/redo   │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │  Pantalla se actualiza   │
                     │  Siguiente input permitido│
                     └──────────────────────────┘
```

---

## Algoritmo de Rotación: Translate-Rotate-Translate

```
Para cada cubito en la capa durante cada frame:

    posición original del cubito
            │
            ▼
    ┌───────────────────────────────────┐
    │ Traslade RELATIVO al centroide:   │
    │ relativePos = cubiePos - centroid │
    │ (Ubica el cubito relativo al eje) │
    └───────────────────────────────────┘
            │
            ▼
    ┌───────────────────────────────────┐
    │ Aplique rotación quaternion:      │
    │ Rota alrededor del origen relativ │
    │ relativePos *= quaternion         │
    └───────────────────────────────────┘
            │
            ▼
    ┌───────────────────────────────────┐
    │ Traslade DE VUELTA al mundo:      │
    │ newPos = relativePos + centroid   │
    │ (Devuelve al espacio mundial)     │
    └───────────────────────────────────┘
            │
            ▼
    Nueva posición final (cubito rotado)


NOTA: Este patrón previene deformación del cubo.
Sin él, rotar alrededor del origen global (0,0,0) 
causaría que las capas se distorsionen.
```

---

## Componentes Clave

### 1. **KeyboardController.js**
- **Responsabilidad**: Capturar entrada de teclado
- **Métodos**:
  - `setupKeyboardListener()`: Registra listener de eventos
  - `handleKeyEvent(key)`: Procesa la tecla, detecta SHIFT
  - `executeMove()`: Crea estrategia y la ejecuta
- **Log Format**: `[MOVE] U`, `[ERROR] message`

### 2. **RotateFaceStrategy.js**
- **Responsabilidad**: Mapear caras (U,D,L,R,F,B) a rotaciones
- **Métodos**:
  - `getFaceParams()`: Retorna axis, angle, name
  - `getLayerByFace()`: Selecciona 9 cubitos por coordenadas
- **Log Format**: `[LAYER] Face U: 9 cubies`

### 3. **MoveStrategy.js** (Base)
- **Responsabilidad**: Ejecutar animación suave
- **Métodos**:
  - `execute()`: Dispara animación
  - `animateRotation()`: Loop de 300ms con requestAnimationFrame
  - `calculateCentroid()`: Promedio de posiciones
  - `getRotationAxis()`: Convierte índice a Vector3
- **Log Format**: `[ROTATE] U - 9 cubies, centroid: ...`

### 4. **MoveHistory.js**
- **Responsabilidad**: Stack undo/redo
- **Métodos**:
  - `addMove()`: Registra movimiento
  - `undo()`: Deshace último
  - `redo()`: Rehace

---

## Timing y Performance

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| Input a ejecución | 0ms | Instantáneo |
| Animación de rotación | 300ms | 60 FPS = ~18 frames |
| Redondeo de posiciones | 1-2ms | Al finalizar |
| Total por movimiento | ~301ms | Usuario puede presionar siguiente inmediatamente después |

---

## Estados Posibles

### isAnimating Flag
- **false**: Permite aceptar nuevos inputs
- **true**: Rechaza inputs, previene overlaps

### Progress (0.0 → 1.0)
- **0.0**: Inicio (ángulo 0°)
- **0.5**: Mitad (ángulo π/4 o -π/4)
- **1.0**: Final (ángulo π/2 o -π/2)

---

## Manejo de Errores

```
Si layer.length === 0
    → Console: "[ERROR] No cubies found for move: U"
    → Reject promesa
    → Permite siguiente input

Si face no válido
    → throw Error: "Invalid face: X"
    → Capturado en KeyboardController
    → Log: "[ERROR] Invalid face"
```

---

## Ejemplo Completo: Usuario presiona "U"

```
Tiempo: 0ms
├─ KeyboardController recibe evento 'U'
├─ isAnimating = false → puede ejecutar
├─ RotateFaceStrategy created: face='U', direction=1
├─ getFaceParams() → axis=1 (Y), angle=π/2, name='U'
├─ strategy.execute() inicia promesa
│
Tiempo: 0-300ms
├─ calculateCentroid() = (0, 0.68, 0)
├─ 9 cubitos seleccionados (pos.y > 0.5)
├─ Frame 1 (0ms): progress=0.0, angle=0°, cubitos en pos original
├─ Frame 10 (166ms): progress=0.55, angle=103.5°, cubitos rotando
├─ Frame 18 (300ms): progress=1.0, angle=90°, cubitos en pos final
├─ Redondeo: x,y,z *= 20, round, /20
├─ Log: "[MOVE] U completed"
│
Tiempo: 300ms+
├─ moveHistory.addMove('U')
├─ isAnimating = false
├─ Usuario puede presionar siguiente tecla
```

---

## Notas de Implementación

1. **Centroide**: Calculado como promedio de 9 posiciones originales
2. **Quaternion**: THREE.Quaternion.setFromAxisAngle para rotación suave
3. **Easing**: Linear (sin función easing compleja, pero suave con interpolación)
4. **Redondeo**: Múltiplos de 0.05 para evitar acumulación de error
5. **Console Logging**: Deshabilitado comentarios, logs claros con prefijos [MOVE], [ERROR], [ROTATE], [LAYER]

