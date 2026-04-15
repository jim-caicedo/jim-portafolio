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
      // Instanciar HouseScene y configurar callback
      sceneRef.current = new HouseScene(sceneManager);
      sceneRef.current.build();
      sceneRef.current.setDoorClickCallback(() => {
        console.log('[House] Navegando a interior');
        // Transición a interior
        navigate('/interior');
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
