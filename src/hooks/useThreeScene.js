import { useEffect, useRef, useState } from 'react';
import SceneManager from '../three/core/SceneManager';

export function useThreeScene(canvasRef, SceneBuilderClass, options = {}) {
  const sceneManagerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Inicializar SceneManager
      sceneManagerRef.current = new SceneManager(canvasRef.current, options);

      // Instanciar el builder de escena
      const sceneBuilder = new SceneBuilderClass(sceneManagerRef.current);

      // Construir la escena
      sceneBuilder.build();

      // Loop de animación
      sceneManagerRef.current.animate((sceneManager) => {
        sceneBuilder.update(sceneManager);
      });

      setIsReady(true);
      console.log('[useThreeScene] Scene ready');
    } catch (error) {
      console.error('[useThreeScene] Error:', error);
      setIsReady(false);
    }

    // Cleanup
    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
    };
  }, [canvasRef, SceneBuilderClass, options]);

  return {
    sceneManager: sceneManagerRef.current,
    isReady,
  };
}
