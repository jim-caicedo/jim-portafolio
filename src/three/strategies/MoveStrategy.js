import * as THREE from 'three';

class MoveStrategy {
  constructor(config) {
    this.name = config.name;
    this.axis = config.axis;
    this.angle = config.angle;
    this.getLayer = config.getLayer;
    this.duration = 300;
  }

  execute(cube, cubies) {
    const layer = this.getLayer(cubies);
    return this.animateRotation(layer);
  }

  animateRotation(layer) {
    if (layer.length === 0) {
      console.error(`[ERROR] No cubies found for move: ${this.name}`);
      return Promise.reject('Empty layer');
    }

    const centroid = this.calculateCentroid(layer);
    console.log(`[ROTATE] ${this.name} - ${layer.length} cubies, centroid: (${centroid.x.toFixed(2)}, ${centroid.y.toFixed(2)}, ${centroid.z.toFixed(2)})`);

    const axis = this.getRotationAxis();
    const startTime = Date.now();

    const initialPositions = new Map();
    const initialRotations = new Map();
    layer.forEach(cubie => {
      initialPositions.set(cubie, cubie.position.clone());
      initialRotations.set(cubie, cubie.quaternion.clone());
    });

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const currentAngle = this.angle * progress;
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, currentAngle);

        layer.forEach((cubie) => {
          // Rotar posición alrededor del centroide
          const initialPos = initialPositions.get(cubie);
          const relativePos = initialPos.clone().sub(centroid);
          relativePos.applyQuaternion(quaternion);
          const newPos = relativePos.add(centroid);
          cubie.position.copy(newPos);
          
          // Rotar el cubie sobre sí mismo (aplicar al quaternion inicial)
          const initialRot = initialRotations.get(cubie);
          cubie.quaternion.multiplyQuaternions(quaternion, initialRot);
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          layer.forEach((cubie) => {
            cubie.position.x = Math.round(cubie.position.x * 20) / 20;
            cubie.position.y = Math.round(cubie.position.y * 20) / 20;
            cubie.position.z = Math.round(cubie.position.z * 20) / 20;
          });
          console.log(`[MOVE] ${this.name} completed`);
          resolve();
        }
      };

      animate();
    });
  }

  calculateCentroid(layer) {
    if (layer.length === 0) return new THREE.Vector3(0, 0, 0);
    const sum = new THREE.Vector3(0, 0, 0);
    layer.forEach((cubie) => sum.add(cubie.position));
    return sum.divideScalar(layer.length);
  }

  getRotationAxis() {
    const axes = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];
    return axes[this.axis] || new THREE.Vector3(0, 1, 0);
  }
}

export default MoveStrategy;
