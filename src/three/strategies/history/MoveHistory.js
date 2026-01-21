/**
 * Gestiona el historial de movimientos del cubo
 * Permite deshacer (undo) y rehacer (redo)
 */
class MoveHistory {
  constructor() {
    this.moves = []; // Historial de movimientos ejecutados
    this.undoStack = []; // Movimientos deshechados (para redo)
  }

  /**
   * Agrega un movimiento al historial
   */
  addMove(moveStrategy) {
    this.moves.push(moveStrategy);
    this.undoStack = []; // Limpiar redo stack cuando hay nuevo movimiento
  }

  /**
   * Obtiene el último movimiento
   */
  getLastMove() {
    return this.moves[this.moves.length - 1];
  }

  /**
   * Retorna el movimiento inverso del último
   */
  getLastMoveInverse() {
    const lastMove = this.getLastMove();
    if (!lastMove) return null;
    return lastMove.getInverse();
  }

  /**
   * Deshace el último movimiento
   */
  undo() {
    if (this.moves.length === 0) return null;

    const move = this.moves.pop();
    this.undoStack.push(move);
    return move.getInverse();
  }

  /**
   * Rehace el último movimiento deshecho
   */
  redo() {
    if (this.undoStack.length === 0) return null;

    const move = this.undoStack.pop();
    this.moves.push(move);
    return move;
  }

  /**
   * Retorna el historial completo de movimientos
   */
  getMovesNotation() {
    return this.moves.map((move) => move.name).join(' ');
  }

  /**
   * Limpia el historial
   */
  clear() {
    this.moves = [];
    this.undoStack = [];
  }

  /**
   * Retorna si hay movimientos para deshacer
   */
  canUndo() {
    return this.moves.length > 0;
  }

  /**
   * Retorna si hay movimientos para rehacer
   */
  canRedo() {
    return this.undoStack.length > 0;
  }
}

export default MoveHistory;
