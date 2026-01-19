import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import SceneManager from '../three/scene/SceneManager';
import GeometryFactory from '../three/geometries/GeometryFactory';
import MaterialFactory from '../three/materials/MaterialFactory';
import RubiksCubeBuilder from '../three/objects/RubiksCubeBuilder';
import './Interior.css';

const Interior = () => {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const rubiksCubeRef = useRef(null);

  /**
   * Inicializa la escena 3D con el cubo de Rubik
   */
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Crear gestor de escena
    const sceneManager = new SceneManager(mountRef.current);
    sceneManagerRef.current = sceneManager;

    // 2. Inicializar escena
    sceneManager.initialize();

    // 3. Configurar cámara
    const camera = sceneManager.getCamera();
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // 4. Configurar iluminación
    const scene = sceneManager.getScene();
    scene.background = new THREE.Color(0x1a1a2e);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 5. Crear factories
    const geometryFactory = new GeometryFactory();
    const materialFactory = new MaterialFactory();

    // 6. Construir cubo de Rubik
    const rubiksCubeBuilder = new RubiksCubeBuilder(
      geometryFactory,
      materialFactory
    );
    const rubiksCube = rubiksCubeBuilder.build();
    rubiksCubeRef.current = rubiksCubeBuilder;

    sceneManager.add(rubiksCube);

    // 7. Iniciar loop de animación (sin rotación automática)
    sceneManager.startAnimationLoop(() => {
      // El cubo solo gira cuando se manipula la cámara
    });

    // 8. Manejo del redimensionamiento
    const handleResize = () => {
      sceneManager.onWindowResize();
    };
    window.addEventListener('resize', handleResize);

    // 9. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      geometryFactory.dispose();
      materialFactory.dispose();
      sceneManager.dispose();
    };
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="interior-container">
      <div className="interior-canvas" ref={mountRef} />
      <button className="back-button-top-right" onClick={handleBack}>
        ← Volver
      </button>
      <div className="interior-controls">
        <h1 className="interior-title">Cubo de Rubik 3D</h1>
      </div>
    </div>
  );
};

export default Interior;
