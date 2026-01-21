import MoveStrategy from '../MoveStrategy';

class RotateFaceStrategy extends MoveStrategy {
  constructor(config) {
    const { axis, angle, name } = RotateFaceStrategy.getFaceParams(
      config.face,
      config.direction
    );

    super({
      name: name,
      axis: axis,
      angle: angle,
      getLayer: (cubies) => RotateFaceStrategy.getLayerByFace(cubies, config.face),
    });

    this.face = config.face;
    this.direction = config.direction;
  }

  static getFaceParams(face, direction) {
    const params = {
      U: { axis: 1, angle: Math.PI / 2, name: 'U' },
      D: { axis: 1, angle: -Math.PI / 2, name: 'D' },
      L: { axis: 0, angle: -Math.PI / 2, name: 'L' },
      R: { axis: 0, angle: Math.PI / 2, name: 'R' },
      F: { axis: 2, angle: Math.PI / 2, name: 'F' },
      B: { axis: 2, angle: -Math.PI / 2, name: 'B' },
    };

    const param = params[face];
    if (!param) {
      throw new Error(`Invalid face: ${face}. Must be: U, D, L, R, F, B`);
    }

    const angle = param.angle * direction;

    return {
      axis: param.axis,
      angle: angle,
      name: face + (direction === -1 ? "'" : ''),
    };
  }

  static getLayerByFace(cubies, face) {
    const layer = [];
    const threshold = 0.4;

    cubies.forEach((cubie) => {
      const pos = cubie.position;

      switch (face) {
        case 'U':
          if (pos.y > threshold) layer.push(cubie);
          break;
        case 'D':
          if (pos.y < -threshold) layer.push(cubie);
          break;
        case 'L':
          if (pos.x < -threshold) layer.push(cubie);
          break;
        case 'R':
          if (pos.x > threshold) layer.push(cubie);
          break;
        case 'F':
          if (pos.z > threshold) layer.push(cubie);
          break;
        case 'B':
          if (pos.z < -threshold) layer.push(cubie);
          break;
        // eslint-disable-next-line no-empty
        default:
          break;
      }
    });

    console.log(`[LAYER] Face ${face}: ${layer.length} cubies`);
    return layer;
  }
}

export default RotateFaceStrategy;
