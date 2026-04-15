import * as THREE from 'three';

/**
 * Easing functions
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolar entre dos vectores
 */
function lerp(start, end, t) {
  return new THREE.Vector3(
    start.x + (end.x - start.x) * t,
    start.y + (end.y - start.y) * t,
    start.z + (end.z - start.z) * t
  );
}

/**
 * Transición suave de cámara
 * @param {THREE.Camera} camera - Cámara a animar
 * @param {OrbitControls} controls - Controls de cámara
 * @param {THREE.Vector3} targetPosition - Posición final de la cámara
 * @param {THREE.Vector3} targetLookAt - Punto a donde mirar
 * @param {number} duration - Duración en milisegundos
 * @returns {Promise} Resuelve cuando la transición termina
 */
export function transitionCamera(camera, controls, targetPosition, targetLookAt, duration = 1200) {
  return new Promise((resolve) => {
    const startPosition = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      // Interpolar posición de cámara
      const newPosition = lerp(startPosition, targetPosition, easedProgress);
      camera.position.copy(newPosition);

      // Interpolar punto focal (controls.target)
      const newLookAt = lerp(startLookAt, targetLookAt, easedProgress);
      controls.target.copy(newLookAt);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Asegurar que terminamos exactamente en la posición final
        camera.position.copy(targetPosition);
        controls.target.copy(targetLookAt);
        controls.update();
        resolve();
      }
    };

    animate();
  });
}

/**
 * Transición de cámara a la puerta
 */
export function transitionToDoor(camera, controls) {
  const targetPosition = new THREE.Vector3(0, 2, 5);
  const targetLookAt = new THREE.Vector3(0, 2, 0);
  return transitionCamera(camera, controls, targetPosition, targetLookAt, 1000);
}

/**
 * Transición de cámara a la vista lateral (SOBRE MÍ)
 */
export function transitionToSideView(camera, controls) {
  const targetPosition = new THREE.Vector3(10, 3, 8);
  const targetLookAt = new THREE.Vector3(0, 1.5, 0);
  return transitionCamera(camera, controls, targetPosition, targetLookAt, 1000);
}

/**
 * Transición de cámara a la vista frontal (CONTACTO)
 */
export function transitionToFrontView(camera, controls) {
  const targetPosition = new THREE.Vector3(0, 4, -10);
  const targetLookAt = new THREE.Vector3(0, 2, 0);
  return transitionCamera(camera, controls, targetPosition, targetLookAt, 1000);
}

/**
 * Efecto shake (temblor) de cámara
 */
export function shakeCamera(camera, intensity = 0.5, duration = 300) {
  const startTime = Date.now();
  const originalPosition = camera.position.clone();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    if (progress < 1) {
      const strength = (1 - progress) * intensity;
      camera.position.x = originalPosition.x + (Math.random() - 0.5) * strength;
      camera.position.y = originalPosition.y + (Math.random() - 0.5) * strength;
      camera.position.z = originalPosition.z + (Math.random() - 0.5) * strength;
      requestAnimationFrame(animate);
    } else {
      camera.position.copy(originalPosition);
    }
  };

  animate();
}
