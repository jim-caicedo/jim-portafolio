import React, { useEffect, useRef } from 'react';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import CVSceneManager from '../three/scene/CVSceneManager';
import CVPlane from '../three/objects/CVPlane';
import CVInteractionManager from '../three/interaction/CVInteractionManager';
import CVContent from '../components/cv/CVContent';
import cvData from '../data/cv-data.json';
import './CVViewer.css';

// Resolución 2x para mantener nitidez al hacer zoom (1200px -> 6 unidades en 3D)
const CV_WIDTH = 1200;

const CV_SCALE = 6 / CV_WIDTH;

function CVViewer() {
  const containerRef = useRef(null);
  const cvContentWrapperRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const cvPlaneRef = useRef(null);
  const interactionManagerRef = useRef(null);
  const css3dRendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !cvContentWrapperRef.current) return;

    // Diferir setup: esperar a que React renderice el CVContent
    let cancelled = false;
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;

        const wrapper = cvContentWrapperRef.current;
        const sceneManager = new CVSceneManager(containerRef.current);
        sceneManagerRef.current = sceneManager;

        const cvPlane = new CVPlane();
        cvPlaneRef.current = cvPlane;
        cvPlane.group.rotation.x = 0.3;

        sceneManager.getScene().add(cvPlane.getGroup());

        const css3dObject = new CSS3DObject(wrapper);
        css3dObject.position.z = 0.01;
        css3dObject.scale.set(CV_SCALE, CV_SCALE, CV_SCALE);
        css3dObject.element.style.pointerEvents = 'none';
        wrapper.classList.add('cv-ready');
        cvPlane.group.add(css3dObject);

        const css3dRenderer = new CSS3DRenderer();
        css3dRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        const css3dDom = css3dRenderer.domElement;
        css3dDom.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;';
        containerRef.current.appendChild(css3dDom);
        css3dRendererRef.current = css3dRenderer;

        const interactionManager = new CVInteractionManager(
          sceneManager.getCamera(),
          sceneManager.getRenderer(),
          cvPlane
        );
        interactionManagerRef.current = interactionManager;

        sceneManager.animate((deltaTime) => {
          cvPlane.updateRotation(deltaTime);
          interactionManager.updateAnimation(deltaTime);
          css3dRenderer.render(sceneManager.getScene(), sceneManager.getCamera());
        });

        const handleResize = () => {
          sceneManager.onWindowResize();
          css3dRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        sceneManagerRef.current._handleResize = handleResize;
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', sceneManagerRef.current?._handleResize);
      cvPlaneRef.current?.dispose();
      interactionManagerRef.current?.dispose();
      css3dRendererRef.current?.domElement?.remove();
      sceneManagerRef.current?.dispose();
    };
  }, []);

  return (
    <div className="cv-viewer-container">
      <div ref={containerRef} className="cv-canvas">
        {/* CVContent se renderiza aquí y se proyecta en el plano 3D vía CSS3DRenderer */}
        <div ref={cvContentWrapperRef} className="cv-content-wrapper" aria-hidden="true">
          <CVContent data={cvData} />
        </div>
      </div>
      <div className="cv-info">
        <h2>Haz click para explorar</h2>
        <p>Click en la hoja para acercarte | Click fuera para alejar</p>
      </div>
    </div>
  );
}

export default CVViewer;
