import React, { useRef, useEffect } from 'react';
import SceneManager from '../three/scene/SceneManager';
import MaterialFactory from '../three/materials/MaterialFactory';
import GeometryFactory from '../three/geometries/GeometryFactory';
import LightingSetup from '../three/lighting/LightingSetup';
import * as THREE from 'three';

/**
 * Componente Scene (corregido de "Scenne")
 * Sigue SRP: responsable solo de orquestar la escena de demostración
 */
const Scene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Crear gestor de escena
    const sceneManager = new SceneManager(mountRef.current);
    sceneManager.initialize();

    // 2. Configurar iluminación
    const lighting = new LightingSetup(sceneManager.getScene());
    lighting.setupLighting();

    // 3. Crear factories
    const materialFactory = new MaterialFactory();
    const geometryFactory = new GeometryFactory();

    // 4. Crear objetos 3D
    const objects = [];

    // Cubo
    const cubeGeom = geometryFactory.createBox(1, 1, 1);
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const cube = new THREE.Mesh(cubeGeom, cubeMat);
    cube.position.y = 0.5;
    cube.name = 'cube';
    sceneManager.add(cube);
    objects.push({ mesh: cube, material: cubeMat });

    // Esfera
    const sphereGeom = geometryFactory.createSphere(0.8, 32, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.set(2, 2, 0);
    sphere.name = 'sphere';
    sceneManager.add(sphere);
    objects.push({ mesh: sphere, material: sphereMat });

    // Toro
    const torusGeom = geometryFactory.createTorus(0.3, 0.1, 100, 16);
    const torusMat = new THREE.MeshNormalMaterial();
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.position.set(-2, -0.5, 0);
    torus.name = 'torus';
    sceneManager.add(torus);
    objects.push({ mesh: torus, material: torusMat });

    // 5. Iniciar loop de animación con rotaciones
    sceneManager.startAnimationLoop(() => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      sphere.rotation.y += 0.01;
      torus.rotation.x += 0.01;
    });

    // 6. Manejo del redimensionamiento
    const handleResize = () => {
      sceneManager.onWindowResize();
    };
    window.addEventListener('resize', handleResize);

    // 7. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      objects.forEach(({ material }) => {
        material.dispose?.();
      });
      lighting.dispose();
      materialFactory.dispose();
      geometryFactory.dispose();
      sceneManager.dispose();
    };
  }, []);

  return (
    <div
      className="container3d"
      ref={mountRef}
      style={{
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};

export default Scene;