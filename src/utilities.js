/// <reference path="./types.js" />


// helper function to get the center coordinates of an element
export function getCenterCoordinates(ref) {
  const rect = ref.getBoundingClientRect();
  const centerX = rect.left + Math.abs(rect.right - rect.left) / 2;
  const centerY = rect.top + Math.abs(rect.bottom - rect.top) / 2;
  return { centerX, centerY };
};

/**
  * @param {Position} originalPosition    
  * @param {number} gridSize
  * @returns {Position}
  * */
export function snapPosition(originalPosition, gridSize) {
  return {
    x: originalPosition.x - (originalPosition.x % gridSize),
    y: originalPosition.y - (originalPosition.y % gridSize)
  }
}

function clampOffset() {
  const wrapper = document.getElementById('boardWrapper');
  const boardEl = document.getElementById('board');
  if (!wrapper || !boardEl) return;

  const wrapW = wrapper.clientWidth;
  const wrapH = wrapper.clientHeight;

  // boardEl.clientWidth/Height is the unscaled size
  const boardW = boardEl.clientWidth * state.ui.scale;
  const boardH = boardEl.clientHeight * state.ui.scale;

  // We want 0 ≥ offset.x ≥ wrapW - boardW
  const minX = Math.min(0, wrapW - boardW);
  const maxX = 0;
  state.ui.offset.x = Math.max(minX, Math.min(maxX, state.ui.offset.x));

  // And similarly for Y
  const minY = Math.min(0, wrapH - boardH);
  const maxY = 0;
  state.ui.offset.y = Math.max(minY, Math.min(maxY, state.ui.offset.y));
}
