import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import HouseBuilder from './builders/HouseBuilder';
import EnvironmentBuilder from './builders/EnvironmentBuilder';
import LowPolyMaterials from './materials/LowPolyMaterials';
import FloatingSign from './objects/FloatingSign';
import BirdsSystem from './objects/Birds';
import RabbitsSystem from './objects/RabbitsSystem';
import {
  transitionToDoor,
  transitionToSideView,
  shakeCamera,
} from './animations/CameraTransition';

class HouseScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.materialFactory = new LowPolyMaterials();
    this.houseBuilder = new HouseBuilder(this.materialFactory);
    this.environmentBuilder = new EnvironmentBuilder(this.materialFactory);
    
    // OrbitControls
    this.controls = null;
    
    // Floating Signs
    this.signs = [];
    this.signMeshes = [];
    
    // Birds System
    this.birdsSystem = null;
    
    // Rabbits System
    this.rabbitsSystem = null;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.doorMesh = null;
    this.onDoorClick = null;
    this.onSignClick = null;
    this.isTransitioning = false;
    
    this.setupEventListeners();
  }

  build() {
    // Mejorar iluminación
    this.setupLighting();
    
    // Agregar casa
    const house = this.houseBuilder.build();
    this.sceneManager.add(house);
    this.doorMesh = this.houseBuilder.getDoor();

    // Agregar ambiente
    const environment = this.environmentBuilder.build();
    this.sceneManager.add(environment);
    
    // Crear letreros flotantes
    this.createFloatingSigns();
    
    // Crear sistema de pájaros
    this.birdsSystem = new BirdsSystem(6);
    this.sceneManager.add(this.birdsSystem.getGroup());
    
    // Crear sistema de conejos
    this.rabbitsSystem = new RabbitsSystem(4);
    this.sceneManager.add(this.rabbitsSystem.getGroup());
    
    // Configurar OrbitControls
    this.setupOrbitControls();

    console.log('[HouseScene] Built successfully');
  }

  createFloatingSigns() {
    // Letrero 1: PROYECTOS (color turquesa)
    const signProyectos = new FloatingSign('PROYECTOS', new THREE.Vector3(-6, 4, 0), 0x4ecdc4, '#ffffff');
    this.signs.push(signProyectos);
    this.signMeshes.push(signProyectos.getMesh());
    this.sceneManager.add(signProyectos.getGroup());

    // Letrero 2: SOBRE MÍ (color amarillo)
    const signAboutMe = new FloatingSign('SOBRE MÍ', new THREE.Vector3(6, 3.5, 2), 0xffe66d, '#333333');
    this.signs.push(signAboutMe);
    this.signMeshes.push(signAboutMe.getMesh());
    this.sceneManager.add(signAboutMe.getGroup());

    // Letrero 3: CONTACTO (color coral)
    const signContact = new FloatingSign('CONTACTO', new THREE.Vector3(0, 5, -6), 0xff6b6b, '#ffffff');
    this.signs.push(signContact);
    this.signMeshes.push(signContact.getMesh());
    this.sceneManager.add(signContact.getGroup());
  }

  setupLighting() {
    // Limpiar luces por defecto del SceneManager
    this.sceneManager.scene.children.forEach((child) => {
      if (child instanceof THREE.Light) {
        this.sceneManager.scene.remove(child);
      }
    });

    // Luz hemisférica (suaviza sombras)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.sceneManager.scene.add(hemiLight);

    // Luz directional (crea sombras nítidas)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    this.sceneManager.scene.add(dirLight);

    // Luz puntual (efectos secundarios)
    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-10, 8, 10);
    this.sceneManager.scene.add(pointLight);
  }

  setupOrbitControls() {
    this.controls = new OrbitControls(
      this.sceneManager.camera,
      this.sceneManager.renderer.domElement
    );

    // Configuración de dampings (suavización)
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = false;

    // Límites de distancia
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;

    // Límites de ángulo polar (no ver debajo del suelo)
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    this.controls.minPolarAngle = 0.1;

    // Punto focal (apuntar al centro de la casa)
    this.controls.target.set(0, 1.5, 0);
    this.controls.update();

    // Habilitar pan con botón derecho
    this.controls.enablePan = true;
  }

  setupEventListeners() {
    const canvas = this.sceneManager.renderer.domElement;
    canvas.addEventListener('click', (event) => this.handleClick(event));
    canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
  }

  handleClick(event) {
    if (this.isTransitioning) return;

    // No clickear en la puerta si se está usando OrbitControls
    if (this.controls && this.controls.state !== THREE.TOUCH.ROTATE) {
      const canvas = this.sceneManager.renderer.domElement;
      const rect = canvas.getBoundingClientRect();

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

      // Detectar intersecciones
      const intersects = this.raycaster.intersectObject(this.sceneManager.scene, true);

      for (let intersection of intersects) {
        // Detectar clicks en letreros
        if (intersection.object.userData.type === 'sign') {
          this.handleSignClick(intersection.object);
          break;
        }

        // Detectar clicks en puerta
        if (intersection.object === this.doorMesh || intersection.object.userData.type === 'door') {
          console.log('[HouseScene] Door clicked!');
          this.handleDoorClick();
          break;
        }
      }
    }
  }

  async handleDoorClick() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      await transitionToDoor(this.sceneManager.camera, this.controls);
      if (this.onDoorClick) {
        this.onDoorClick();
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  async handleSignClick(signMesh) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      // Encontrar cuál letrero fue clickeado
      const signIndex = this.signMeshes.indexOf(signMesh);

      if (signIndex === 0) {
        // PROYECTOS
        console.log('[HouseScene] Proyectos sign clicked!');
        await transitionToDoor(this.sceneManager.camera, this.controls);
        if (this.onSignClick) {
          this.onSignClick('proyectos');
        }
      } else if (signIndex === 1) {
        // SOBRE MÍ
        console.log('[HouseScene] Sobre mí sign clicked!');
        await transitionToSideView(this.sceneManager.camera, this.controls);
        if (this.onSignClick) {
          this.onSignClick('cv');
        }
      } else if (signIndex === 2) {
        // CONTACTO
        console.log('[HouseScene] Contacto sign clicked!');
        shakeCamera(this.sceneManager.camera, 0.3, 400);
        if (this.onSignClick) {
          this.onSignClick('contact');
        }
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  handleMouseMove(event) {
    const canvas = this.sceneManager.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const intersects = this.raycaster.intersectObject(this.sceneManager.scene, true);

    let isHoveringInteractive = false;

    // Reset hovers de letreros
    this.signs.forEach((sign) => sign.setHovered(false));

    // Reset hover de puerta
    this.doorMesh.material.emissive.setHex(0x000000);
    this.doorMesh.material.emissiveIntensity = 0;

    // Verificar intersecciones
    for (let intersection of intersects) {
      // Hover en letreros
      if (intersection.object.userData.type === 'sign') {
        const signIndex = this.signMeshes.indexOf(intersection.object);
        if (signIndex !== -1) {
          this.signs[signIndex].setHovered(true);
          isHoveringInteractive = true;
        }
      }

      // Hover en puerta
      if (intersection.object === this.doorMesh || intersection.object.userData.type === 'door') {
        this.doorMesh.material.emissive.setHex(0xa0522d);
        this.doorMesh.material.emissiveIntensity = 0.8;
        isHoveringInteractive = true;
      }
    }

    canvas.style.cursor = isHoveringInteractive ? 'pointer' : 'auto';
  }

  update(sceneManager) {
    // Actualizar OrbitControls en el loop de animación
    if (this.controls) {
      this.controls.update();
    }

    // Actualizar letreros flotantes
    this.signs.forEach((sign) => sign.update());

    // Actualizar pájaros
    if (this.birdsSystem) {
      this.birdsSystem.update();
    }

    // Actualizar conejos
    if (this.rabbitsSystem) {
      this.rabbitsSystem.update();
    }
  }

  setDoorClickCallback(callback) {
    this.onDoorClick = callback;
  }

  setSignClickCallback(callback) {
    this.onSignClick = callback;
  }

  dispose() {
    if (this.controls) {
      this.controls.dispose();
    }
    
    // Dispose floating signs
    this.signs.forEach((sign) => sign.dispose());
    
    // Dispose birds system
    if (this.birdsSystem) {
      this.birdsSystem.dispose();
    }
    
    // Dispose rabbits system
    if (this.rabbitsSystem) {
      this.rabbitsSystem.dispose();
    }
    
    this.houseBuilder.dispose();
    this.environmentBuilder.dispose();
    this.materialFactory.dispose();
    
    const canvas = this.sceneManager.renderer.domElement;
    canvas.removeEventListener('click', (event) => this.handleClick(event));
    canvas.removeEventListener('mousemove', (event) => this.handleMouseMove(event));
  }
}

export default HouseScene;
