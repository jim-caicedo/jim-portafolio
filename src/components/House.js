import React from 'react';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import cieloImg from '../assets/CieloAsset.jpg';
import './House.css'; // Importar los estilos

const House = () => {
    const mountRef = useRef(null);
    const doorRef = useRef(null);
    const cameraRef = useRef(null); // Añadir referencia para la cámara

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // scene, camera, renderer
        const scene = new THREE.Scene();
        
        // Agregar fondo
        const textureLoader = new THREE.TextureLoader();
        const bgTexture = textureLoader.load(cieloImg);
        scene.background = bgTexture;

        const camera = new THREE.PerspectiveCamera(
            45,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(4, 3, 6);
        camera.lookAt(0, 1, 0);
        cameraRef.current = camera; // Guardar referencia de la cámara

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // materiales low-poly (flatShading)
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xffe0b8, flatShading: true });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b2f2f, flatShading: true });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b3e26, flatShading: true });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x89c3ff, emissive: 0x1a6fb3, flatShading: true });

        // base (casa)
        const baseGeom = new THREE.BoxGeometry(2.2, 1.2, 2.0);
        const baseMesh = new THREE.Mesh(baseGeom, wallMat);
        baseMesh.position.y = 0.6;
        scene.add(baseMesh);

        // techo como pirámide (cone con 4 segmentos)
        const roofGeom = new THREE.ConeGeometry(1.5, 0.9, 4);
        roofGeom.translate(0, 0.45, 0);
        const roofMesh = new THREE.Mesh(roofGeom, roofMat);
        roofMesh.position.y = 1.2 + 0;
        roofMesh.rotation.y = Math.PI / 4; // alinear con la base
        scene.add(roofMesh);

        // puerta
        const doorGeom = new THREE.BoxGeometry(0.5, 0.8, 0.05);
        const door = new THREE.Mesh(doorGeom, woodMat);
        door.position.set(0, 0.4, 1.02);
        doorRef.current = door; // Guardar referencia de la puerta
        scene.add(door);

        // ventanas (frontales simple)
        const winGeom = new THREE.PlaneGeometry(0.45, 0.45);
        const win1 = new THREE.Mesh(winGeom, glassMat);
        win1.position.set(-0.7, 0.75, 1.01);
        scene.add(win1);
        const win2 = new THREE.Mesh(winGeom, glassMat);
        win2.position.set(0.7, 0.75, 1.01);
        scene.add(win2);

        // chimenea simple
        const chimGeom = new THREE.BoxGeometry(0.18, 0.5, 0.18);
        const chim = new THREE.Mesh(chimGeom, woodMat);
        chim.position.set(-0.6, 1.8, -0.3);
        scene.add(chim);

        // suelo
        const groundGeom = new THREE.PlaneGeometry(5,5);
        const groundMat = new THREE.MeshStandardMaterial({ 
            color: 0x6fbf73, 
            flatShading: true,
            side: THREE.DoubleSide  // Añadir esta línea para hacer visible ambos lados
        });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        scene.add(ground);

        // grupo para rotar/animar la casa
        const houseGroup = new THREE.Group();
        houseGroup.add(baseMesh, roofMesh, door, win1, win2, chim, ground); // Añadir ground al grupo
        scene.add(houseGroup);

        // animación
        let frameId;
        const animate = () => {
            controls.update();
            houseGroup.rotation.y += 0.002;
            frameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // resize handler
        const handleResize = () => {
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // limpieza
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            controls.dispose();
            currentMount.removeChild(renderer.domElement);

            // dispose geometries y materiales
            [baseGeom, roofGeom, doorGeom, winGeom, chimGeom, groundGeom].forEach(g => g.dispose && g.dispose());
            [wallMat, roofMat, woodMat, glassMat, groundMat].forEach(m => m.dispose && m.dispose());
            renderer.dispose();
        };
    }, []);

    // Configurar Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Manejador de click
    const onClick = (event) => {
        const currentMount = mountRef.current;
        if (!currentMount || !cameraRef.current) return;

        // Calcular posición del mouse en coordenadas normalizadas (-1 a +1)
        const rect = currentMount.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Actualizar el raycaster
        raycaster.setFromCamera(mouse, cameraRef.current); // Usar cameraRef.current

        // Verificar intersección con la puerta
        const intersects = raycaster.intersectObject(doorRef.current);

        if (intersects.length > 0) {
            console.log('Tocando el timbre');
        }
    };

    // Agregar event listener para clicks
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        currentMount.addEventListener('click', onClick);

        // Limpieza
        return () => {
            currentMount.removeEventListener('click', onClick);
        };
    }, []);

    const handleEnter = () => {
        // Aquí puedes agregar la lógica para cuando se presione el botón
        console.log('Entrando a la casa...');
    };

    return (
        <div className="container3d">
            <div className="overlay">
                <h1 className="title">Jim's House</h1>
                <button className="enter-button" onClick={handleEnter}>
                    Enter
                </button>
            </div>
            <div
                ref={mountRef}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default House;