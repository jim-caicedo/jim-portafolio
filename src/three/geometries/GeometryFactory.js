import * as THREE from 'three';

/**
 * Factory para crear geometrías reutilizables
 * Sigue SRP: responsable solo de crear geometrías
 */
class GeometryFactory {
  constructor() {
    this.geometries = [];
  }

  /**
   * Crea una geometría de caja
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {THREE.BoxGeometry}
   */
  createBox(width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    this.geometries.push(geometry);
    return geometry;
  }

  /**
   * Crea una geometría de cono (para techos)
   * @param {number} radius
   * @param {number} height
   * @param {number} segments
   * @returns {THREE.ConeGeometry}
   */
  createCone(radius, height, segments) {
    const geometry = new THREE.ConeGeometry(radius, height, segments);
    this.geometries.push(geometry);
    return geometry;
  }

  /**
   * Crea una geometría de plano
   * @param {number} width
   * @param {number} height
   * @returns {THREE.PlaneGeometry}
   */
  createPlane(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    this.geometries.push(geometry);
    return geometry;
  }

  /**
   * Crea una geometría de esfera
   * @param {number} radius
   * @param {number} widthSegments
   * @param {number} heightSegments
   * @returns {THREE.SphereGeometry}
   */
  createSphere(radius, widthSegments, heightSegments) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    this.geometries.push(geometry);
    return geometry;
  }

  /**
   * Crea una geometría de toro
   * @param {number} radius
   * @param {number} tubeRadius
   * @param {number} radialSegments
   * @param {number} tubularSegments
   * @returns {THREE.TorusGeometry}
   */
  createTorus(radius, tubeRadius, radialSegments, tubularSegments) {
    const geometry = new THREE.TorusGeometry(
      radius,
      tubeRadius,
      radialSegments,
      tubularSegments
    );
    this.geometries.push(geometry);
    return geometry;
  }

  /**
   * Libera memoria de todas las geometrías
   */
  dispose() {
    this.geometries.forEach((geometry) => {
      geometry.dispose();
    });
    this.geometries = [];
  }
}

export default GeometryFactory;
