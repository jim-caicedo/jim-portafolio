import React, { useEffect, useRef } from 'react';
import CVSceneManager from '../three/scene/CVSceneManager';
import CVPlane from '../three/objects/CVPlane';
import CVInteractionManager from '../three/interaction/CVInteractionManager';
import '../pages/CVViewer.css';

function CVViewer() {
  const containerRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const cvPlaneRef = useRef(null);
  const interactionManagerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicializar escena
    const sceneManager = new CVSceneManager(containerRef.current);
    sceneManagerRef.current = sceneManager;

    // Crear plano de CV
    const cvPlane = new CVPlane();
    cvPlaneRef.current = cvPlane;
    
    // Establecer rotación inicial (ligera inclinación)
    cvPlane.group.rotation.x = 0.3;
    
    sceneManager.getScene().add(cvPlane.getGroup());

    console.log('[CV] Scene initialized');
    console.log('[CV] Plane position:', cvPlane.getGroup().position);
    console.log('[CV] Camera position:', sceneManager.getCamera().position);

    // Crear gestor de interacción
    const interactionManager = new CVInteractionManager(
      sceneManager.getCamera(),
      sceneManager.getRenderer(),
      cvPlane
    );
    interactionManagerRef.current = interactionManager;

    // Loop de animación
    sceneManager.animate((deltaTime) => {
      // Actualizar rotación del plano (siempre, incluso cuando enfocado)
      cvPlane.updateRotation(deltaTime);

      // Actualizar animación de interacción
      interactionManager.updateAnimation(deltaTime);
    });

    // Manejo de resize
    const handleResize = () => {
      sceneManager.onWindowResize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cvPlane.dispose();
      interactionManager.dispose();
      sceneManager.dispose();
    };
  }, []);

  return (
    <div className="cv-viewer-container">
      <div ref={containerRef} className="cv-canvas"></div>
      <div className="cv-info">
        <h2>Haz click para explorar</h2>
        <p>Click en la hoja para acercarte | Click fuera para alejar</p>
      </div>
    </div>
  );
}

export default CVViewer;
