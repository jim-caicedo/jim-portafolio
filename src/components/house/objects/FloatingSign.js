import * as THREE from 'three';

class FloatingSign {
  constructor(text, position, color = 0xff6b6b, textColor = '#ffffff') {
    this.text = text;
    this.position = position;
    this.color = color;
    this.textColor = textColor;
    this.startTime = Date.now();
    this.group = new THREE.Group();
    this.mesh = null;
    this.onClick = null;
    this.isHovered = false;
    this.hoverColor = 0x444444;

    this.createSign();
  }

  createSign() {
    // Crear textura con canvas
    const texture = this.createCanvasTexture(this.text, this.color, this.textColor);

    // Crear material con emissive
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      emissive: 0x000000,
      emissiveIntensity: 0.5,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Crear geometría (plano)
    const geometry = new THREE.PlaneGeometry(3, 1.5);

    // Crear mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData = { type: 'sign', clickable: true };

    // Posicionar en el grupo
    this.mesh.position.copy(this.position);

    this.group.add(this.mesh);
  }

  createCanvasTexture(text, bgColor, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Convertir color hex a RGB
    const bgRGB = this.hexToRgb(bgColor);
    const bgColorString = `rgb(${bgRGB.r}, ${bgRGB.g}, ${bgRGB.b})`;

    // Fondo redondeado
    ctx.fillStyle = bgColorString;
    this.roundRect(ctx, 20, 20, 472, 216, 30);
    ctx.fill();

    // Borde sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Sombra de texto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 260, 135);

    // Texto principal
    ctx.fillStyle = textColor;
    ctx.fillText(text, 256, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      `#${hex.toString(16).padStart(6, '0')}`
    );
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 };
  }

  update() {
    if (!this.mesh) return;

    const elapsed = (Date.now() - this.startTime) / 1000;

    // Animación flotante en Y
    const baseY = this.position.y;
    this.mesh.position.y = baseY + Math.sin(elapsed * 2) * 0.3;

    // Rotación suave (billboard effect con leve swing)
    this.mesh.rotation.z = Math.sin(elapsed * 1.5) * 0.15;
  }

  setHovered(isHovered) {
    if (!this.mesh || !this.mesh.material || !this.mesh.material.emissive) {
      return;
    }

    if (this.isHovered === isHovered) return;
    this.isHovered = isHovered;

    if (isHovered) {
      this.mesh.scale.set(1.15, 1.15, 1.15);
      this.mesh.material.emissive.setHex(this.hoverColor);
    } else {
      this.mesh.scale.set(1, 1, 1);
      this.mesh.material.emissive.setHex(0x000000);
    }
  }

  getGroup() {
    return this.group;
  }

  getMesh() {
    return this.mesh;
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      if (this.mesh.material.map) {
        this.mesh.material.map.dispose();
      }
    }
  }
}

export default FloatingSign;
