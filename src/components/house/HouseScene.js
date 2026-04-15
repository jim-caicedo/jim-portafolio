import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import HouseBuilder from './builders/HouseBuilder';
import EnvironmentBuilder from './builders/EnvironmentBuilder';
import LowPolyMaterials from './materials/LowPolyMaterials';

class HouseScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.materialFactory = new LowPolyMaterials();
    this.houseBuilder = new HouseBuilder(this.materialFactory);
    this.environmentBuilder = new EnvironmentBuilder(this.materialFactory);
    
    // OrbitControls
    this.controls = null;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.doorMesh = null;
    this.onDoorClick = null;
    
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
    
    // Configurar OrbitControls
    this.setupOrbitControls();

    console.log('[HouseScene] Built successfully');
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
        if (intersection.object === this.doorMesh || intersection.object.userData.type === 'door') {
          console.log('[HouseScene] Door clicked!');
          if (this.onDoorClick) {
            this.onDoorClick();
          }
          break;
        }
      }
    }
  }

  handleMouseMove(event) {
    const canvas = this.sceneManager.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const intersects = this.raycaster.intersectObject(this.sceneManager.scene, true);

    // Reset todos los colores
    this.doorMesh.material.emissive.setHex(0x000000);
    this.doorMesh.material.emissiveIntensity = 0;

    // Hover en puerta
    for (let intersection of intersects) {
      if (intersection.object === this.doorMesh || intersection.object.userData.type === 'door') {
        this.doorMesh.material.emissive.setHex(0xa0522d); // Marrón más claro
        this.doorMesh.material.emissiveIntensity = 0.8;
        canvas.style.cursor = 'pointer';
        return;
      }
    }

    canvas.style.cursor = 'auto';
  }

  update(sceneManager) {
    // Actualizar OrbitControls en el loop de animación
    if (this.controls) {
      this.controls.update();
    }
  }

  setDoorClickCallback(callback) {
    this.onDoorClick = callback;
  }

  dispose() {
    if (this.controls) {
      this.controls.dispose();
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
