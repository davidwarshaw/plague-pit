import properties from '../properties.js';

import tilesetDefinition from '../definitions/tilesetDefinition.json';

export default class Map {
  constructor(scene) {
    const { tileWidth, tileHeight } = properties;
    const width = properties.mapWidthTiles;
    const height = properties.mapHeightTiles;

    this.tilemap = scene.make.tilemap({ tileWidth, tileHeight, width, height });
    this.tileset = this.tilemap.addTilesetImage('tileset', 'tileset');
    this.layers = {};

    //this.layers.background = this.tilemap.createBlankDynamicLayer('background', this.tileset);
    this.layers.collision = this.tilemap.createBlankDynamicLayer('collision', this.tileset);

    [...Array(properties.mapHeightTiles).keys()].map(y =>
      [...Array(properties.mapWidthTiles).keys()].map(x => {
        if (y < 4) {
          this.layers.collision.putTileAt(tilesetDefinition['open'].index, x, y);
        }
        else if (y === 4) {
          this.layers.collision.putTileAt(tilesetDefinition['grass'].index, x, y);
        }
        else if (y >= 5 && y <= 5 && x >= 4 && x <= 5) {
          this.layers.collision.putTileAt(tilesetDefinition['dirt-removed'].index, x, y);
        }
        else {
          this.layers.collision.putTileAt(tilesetDefinition['dirt-light'].index, x, y);
        }
      })
    );

    //this.layers.foreground = this.tilemap.createBlankDynamicLayer('foreground', this.tileset);

    this.layers.collision.setCollision(this.getCollisionIndices());
  }

  getCollisionIndices() {
    return Object.values(tilesetDefinition)
      .filter(tile => tile.collide)
      .map(tile => tile.index);
  }

  isTileInDirection(player, tile, digDirection) {
    const world = this.tilemap.tileToWorldXY(tile.x, tile.y);
    const delta = {
      x: player.x - world.x,
      y: player.y - world.y
    };
    const abs = {
      x: Math.abs(delta.x),
      y: Math.abs(delta.y)
    };

    // console.log(`player: ${player.x}, ${player.y} world: ${world.x}, ${world.y}`);
    // console.log(`abs: ${abs.x}, ${abs.y} delta: ${delta.x}, ${delta.y}`);
    switch (digDirection) {
      case 'up': {
        return abs.y > abs.x && delta.y > 0;
      }
      case 'down': {
        return abs.y > abs.x && delta.y <= 0;
      }
      case 'left': {
        return abs.y <= abs.x && delta.x > 0;
      }
      case 'right': {
        return abs.y <= abs.x && delta.x <= 0;
      }
    }
  }

  digTile(tile) {
    const recalculateFaces = true;
    this.tilemap.putTileAt(
      tilesetDefinition['dirt-removed'].index,
      tile.x,
      tile.y,
      recalculateFaces,
      this.layers.collision
    );
  }
}
