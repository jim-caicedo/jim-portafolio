import RotateFaceStrategy from '../moves/RotateFaceStrategy';

class KeyboardController {
  constructor(cube, cubies, moveHistory) {
    this.cube = cube;
    this.cubies = cubies;
    this.moveHistory = moveHistory;
    this.isAnimating = false;

    this.setupInstructions();
    this.setupKeyboardListener();
  }

  setupInstructions() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid rgba(100, 150, 255, 0.6);
      border-radius: 10px;
      padding: 15px;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 13px;
      max-width: 280px;
      z-index: 100;
      backdrop-filter: blur(10px);
    `;

    panel.innerHTML = `
      <h3 style="margin-top: 0; color: #6496ff;">Controles</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
          <td style="padding: 5px;"><b>U</b></td>
          <td style="padding: 5px;">Superior</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
          <td style="padding: 5px;"><b>D</b></td>
          <td style="padding: 5px;">Inferior</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
          <td style="padding: 5px;"><b>L</b></td>
          <td style="padding: 5px;">Izquierda</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
          <td style="padding: 5px;"><b>R</b></td>
          <td style="padding: 5px;">Derecha</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
          <td style="padding: 5px;"><b>F</b></td>
          <td style="padding: 5px;">Frente</td>
        </tr>
        <tr>
          <td style="padding: 5px;"><b>B</b></td>
          <td style="padding: 5px;">Atrás</td>
        </tr>
      </table>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #aaa;">
        SHIFT + letra = inversa
      </p>
    `;

    document.body.appendChild(panel);
  }

  setupKeyboardListener() {
    document.addEventListener('keypress', (event) => {
      const key = event.key.toUpperCase();

      if (!['U', 'D', 'L', 'R', 'F', 'B'].includes(key)) {
        return;
      }

      event.preventDefault();
      const direction = event.shiftKey ? -1 : 1;
      this.executeMove(key, direction);
    });
  }

  async executeMove(face, direction) {
    if (this.isAnimating) return;

    this.isAnimating = true;

    try {
      const strategy = new RotateFaceStrategy({
        face: face,
        direction: direction,
      });

      await strategy.execute(this.cube, this.cubies);
      this.moveHistory.addMove(strategy);

      const moveName = `${face}${direction === -1 ? "'" : ''}`;
      console.log(`[MOVE] ${moveName}`);
    } catch (error) {
      console.error('[ERROR]', error);
    } finally {
      this.isAnimating = false;
    }
  }

  destroy() {
    // Cleanup
  }
}

export default KeyboardController;
