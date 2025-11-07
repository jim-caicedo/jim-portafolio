import React from 'react';
import {useRef, useEffect} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Scenne = () => {

    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            25, 
            currentMount.clientWidth / currentMount.clientHeight, 
            0.1, 
            1000
        );
        camera.position.z = 5;
        scene.add(camera);
        //renderer
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        //controls
        const controls = new OrbitControls(camera, renderer.domElement);
        
        controls.enableDamping = true;


        //cubo
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial(
                { color: 0x00ff023, transparent: true, opacity: 0.3, 
                    wireframe: true
                }
            )
            
        );
        scene.add(cube);
        cube.position.y = 0.5;

        //Sphere
        const geometry = new THREE.SphereGeometry( 0.8, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        sphere.position.x = 2;
        sphere.position.y = 2;

        // torus
        const torus = new THREE.TorusKnotGreometry( 0.3, 0.1, 100, 16 );
        const torusMaterial = new THREE.MeshNormalMaterial();
        const torusKnot = new THREE.Mesh( torus, torusMaterial );
        scene.add( torusKnot );
        torusKnot.position.x = -2;
        torusKnot.position.y = -0.5;

        //animation
        const animate = function () {
            controls.update();
            requestAnimationFrame(animate); 
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        //clean up
        return () => { 
            currentMount.removeChild(renderer.domElement);
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
        >
            <h1>Hola mundo</h1>
        </div>
    );
};

export default Scenne;