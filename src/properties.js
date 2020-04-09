import * as ROT from 'rot-js';

ROT.RNG.setSeed(Date.now());

export default {
  debug: false,
  rng: ROT.RNG,
  width: 320,
  height: 208,
  scale: 3,
  tileWidth: 32,
  tileHeight: 32,
  mapWidthTiles: 36,
  mapHeightTiles: 12,
  throwMillis: 1000,
  captureMillis: 500,
  attackMillis: 100,
  numberMillis: 1200,
  animFrameRate: 10,
  turnDelayMillis: 600,
  turnDurationMillis: 200,
  uiFlashTint: 0x000000,
  uiHangMillis: 100
};
