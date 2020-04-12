import * as ROT from 'rot-js';

ROT.RNG.setSeed(Date.now());

export default {
  debug: true,
  rng: ROT.RNG,
  width: 320,
  height: 208,
  scale: 3,
  tileWidth: 32,
  tileHeight: 32,
  mapWidthTiles: 36,
  mapHeightTiles: 12,
  groundLevel: 4,
  animFrameRate: 10,
  uiHangMillis: 500
};
