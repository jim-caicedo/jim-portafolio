import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import cieloImg from '../assets/CieloAsset.jpg';
import SceneManager from '../three/scene/SceneManager';
import MaterialFactory from '../three/materials/MaterialFactory';
import GeometryFactory from '../three/geometries/GeometryFactory';
import HouseBuilder from '../three/objects/HouseBuilder';
import LightingSetup from '../three/lighting/LightingSetup';
import RaycastInteraction from '../three/interaction/RaycastInteraction';
import './House.css';

/**
 * Componente House
 * Sigue SRP: responsable solo de orquestar la escena y manejar el ciclo de vida
 */
const House = () => {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const doorRef = useRef(null);

  /**
   * Inicializa toda la escena 3D
   */
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Crear gestor de escena
    const sceneManager = new SceneManager(mountRef.current);
    sceneManagerRef.current = sceneManager;

    // 2. Cargar textura de fondo
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load(cieloImg);

    // 3. Inicializar escena
    sceneManager.initialize(bgTexture);

    // 4. Configurar iluminación
    const lighting = new LightingSetup(sceneManager.getScene());
    lighting.setupLighting();

    // 5. Crear factories
    const materialFactory = new MaterialFactory();
    const geometryFactory = new GeometryFactory();
    const materials = materialFactory.createDefaultMaterials();

    // 6. Construir casa con patrón Builder
    const houseBuilder = new HouseBuilder(geometryFactory, materialFactory);
    const house = houseBuilder
      .buildBase(materials)
      .buildRoof(materials)
      .buildDoor(materials)
      .buildWindows(materials)
      .buildChimney(materials)
      .buildGround(materials)
      .build();

    doorRef.current = houseBuilder.getDoor();
    sceneManager.add(house);

    // 7. Iniciar loop de animación
    sceneManager.startAnimationLoop((scene) => {
      house.rotation.y += 0.002;
    });

    // 8. Manejo del redimensionamiento
    const handleResize = () => {
      sceneManager.onWindowResize();
    };
    window.addEventListener('resize', handleResize);

    // 9. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      lighting.dispose();
      materialFactory.dispose();
      geometryFactory.dispose();
      sceneManager.dispose();
    };
  }, []);

  /**
   * Maneja la interacción con la puerta (click)
   */
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || !sceneManagerRef.current || !doorRef.current) {
      return;
    }

    const sceneManager = sceneManagerRef.current;
    const raycast = new RaycastInteraction(
      sceneManager.getCamera(),
      currentMount
    );

    // Registrar callback para la puerta
    raycast.on(doorRef.current, () => {
      console.log('¡Tocando el timbre!');
      // Aquí puedes agregar más lógica de interacción
    });

    const handleClick = (event) => {
      raycast.handleClick(event);
    };

    currentMount.addEventListener('click', handleClick);

    return () => {
      currentMount.removeEventListener('click', handleClick);
    };
  }, []);

  /**
   * Maneja el botón de entrada
   */
  const handleEnter = useCallback(() => {
    console.log('Entrando a la casa...');
    navigate('/interior');
  }, [navigate]);

  const handleCV = useCallback(() => {
    navigate('/cv');
  }, [navigate]);

  return (
    <div className="container3d">
      <div className="overlay">
        <h1 className="title">Jim's House</h1>
        <div className="overlay-buttons">
          <button className="enter-button" onClick={handleEnter}>
            Enter
          </button>
          <button className="cv-button" onClick={handleCV}>
            Mi CV
          </button>
        </div>
      </div>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default House;