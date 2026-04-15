import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThreeScene } from '../../hooks/useThreeScene';
import HouseScene from './HouseScene';
import './House.css';

export default function House() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const navigate = useNavigate();
  const { sceneManager, isReady } = useThreeScene(canvasRef, HouseScene, {
    enableShadows: true,
    backgroundColor: 0x87ceeb,
  });

  useEffect(() => {
    if (isReady && sceneManager) {
      // Instanciar HouseScene y configurar callbacks
      sceneRef.current = new HouseScene(sceneManager);
      sceneRef.current.build();
      
      // Callback para clicks en puerta
      sceneRef.current.setDoorClickCallback(() => {
        console.log('[House] Navegando a interior');
        navigate('/interior');
      });

      // Callback para clicks en letreros
      sceneRef.current.setSignClickCallback((signType) => {
        console.log('[House] Navegando desde letrero:', signType);
        if (signType === 'proyectos') {
          navigate('/interior');
        } else if (signType === 'cv') {
          navigate('/cv');
        } else if (signType === 'contact') {
          // Por ahora scroll hasta un modal o similar
          console.log('[House] Contacto clicked');
        }
      });

      console.log('[House] Component ready');
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, [isReady, sceneManager, navigate]);

  return (
    <div className="house-container">
      <canvas
        ref={canvasRef}
        className="house-canvas"
        style={{ width: '100vw', height: '100vh', display: 'block' }}
      />
      {!isReady && (
        <div className="loading-screen">
          <h1>Cargando escena...</h1>
        </div>
      )}
    </div>
  );
}
