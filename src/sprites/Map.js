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
        else if (y >= 5 && y <= 6 && x >= 5 && x <= 6) {
          this.layers.collision.putTileAt(tilesetDefinition['dirt-removed'].index, x, y);
        }
        else {
          this.layers.collision.putTileAt(tilesetDefinition['dirt-light'].index, x, y);
        }
      })
    );

    //this.layers.foreground = this.tilemap.createBlankDynamicLayer('foreground', this.tileset);

    this.layers.collision.setCollision(this.getCollisionIndices());

    scene.matter.world.convertTilemapLayer(this.layers.collision);
    this.layers.collision.forEachTile(tile => {
      const { matterBody } = tile.physics;
      if (matterBody) {
        matterBody.setCollisionCategory(scene.collisionCategories.main);
        matterBody.setCollidesWith(scene.collisionCategories.main);
      }
    });

    scene.matter.world.setBounds(this.tilemap.widthInPixels, this.tilemap.heightInPixels);
  }

  getCollisionIndices() {
    return Object.values(tilesetDefinition)
      .filter(tile => tile.collide)
      .map(tile => tile.index);
  }

  digTile(tile) {
    const collisionTile = this.tilemap.getTileAt(tile.x, tile.y);
    if (collisionTile.physics.matterBody) {
      collisionTile.physics.matterBody.destroy();
    }

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
