import properties from '../properties.js';

import tilesetDefinition from '../definitions/tilesetDefinition.json';

export default class Map {
  constructor(scene) {
    this.scene = scene;

    const { tileWidth, tileHeight } = properties;
    const width = properties.mapWidthTiles;
    const height = properties.mapHeightTiles;

    this.tilemap = scene.make.tilemap({ tileWidth, tileHeight, width, height });
    this.tileset = this.tilemap.addTilesetImage('tileset-2', 'tileset-2');
    this.layers = {};

    this.collisionTileIndexes = [...Array(properties.mapHeightTiles).keys()].map((y) =>
      [...Array(properties.mapWidthTiles).keys()].map((x) => {
        if (y < properties.groundLevel) {
          return tilesetDefinition['open'].index;
        }
        else if (y === properties.groundLevel) {
          return tilesetDefinition['grass'].index;
        }
        else if (y >= properties.groundLevel + 1 && y <= 6 && x >= 5 && x <= 6) {
          return tilesetDefinition['dirt-removed'].index;
        }
        else {
          return tilesetDefinition['dirt-light'].index;
        }
      })
    );

    //this.layers.background = this.tilemap.createBlankDynamicLayer('background', this.tileset);
    this.layers.collision = this.tilemap.createBlankDynamicLayer('collision', this.tileset);

    this.collisionTileIndexes.forEach((row, y) =>
      row.forEach((tileIndex, x) => {
        this.layers.collision.putTileAt(tileIndex, x, y);
      })
    );

    //this.layers.foreground = this.tilemap.createBlankDynamicLayer('foreground', this.tileset);

    this.layers.collision.setCollision(this.getCollisionIndices());

    scene.matter.world.convertTilemapLayer(this.layers.collision);
    this.layers.collision.forEachTile((tile) => this.setMatterColliders(tile));

    scene.matter.world.setBounds(this.tilemap.widthInPixels, this.tilemap.heightInPixels);
  }

  getDiggableIndices() {
    const indices = Object.values(tilesetDefinition)
      .filter((tile) => tile.diggable)
      .map((tile) => tile.index);
    return indices;
  }

  getBodyIndices() {
    // All tiles of index [25, 50) are body tiles. They all collide
    const indices = [...Array(50 - 25).keys()].map(key => key + 25);
    return indices;
  }

  getTerrainCollisionIndices() {
    // All tiles of index [0, 25) are terrain tiles, but only collide if
    // they are defined to collide
    const indices = Object.values(tilesetDefinition)
      .filter((tile) => tile.collide)
      .map((tile) => tile.index);
    return indices;
  }

  getCollisionIndices() {
    return this.getTerrainCollisionIndices().concat(this.getBodyIndices());
  }

  setMatterColliders(tile) {
    const { matterBody } = tile.physics;
    if (matterBody) {
      matterBody.setCollisionCategory(this.scene.collisionCategories.main);
      matterBody.setCollidesWith(this.scene.collisionCategories.main);
    }
  }

  digTile(tile) {
    if (tile.physics.matterBody) {
      tile.physics.matterBody.destroy();
    }

    this.collisionTileIndexes[tile.y][tile.x] = tilesetDefinition['dirt-removed'].index;
    const recalculateFaces = true;
    this.tilemap.putTileAt(
      tilesetDefinition['dirt-removed'].index,
      tile.x,
      tile.y,
      recalculateFaces,
      this.layers.collision
    );
  }

  addBodyTiles(tile, matrix) {
    // Put the new tiles on the map
    const newTiles = matrix
      .map((row, y) =>
        row.map((tileIndex, x) => {
          if (tileIndex !== -1) {
            const recalculateFaces = true;
            const newTile = this.tilemap.putTileAt(
              tileIndex,
              tile.x + x,
              tile.y + y,
              recalculateFaces,
              this.layers.collision
            );

            // console.log(`tileIndex: ${tileIndex} (${tile.x + x}, ${tile.y + y})`);
            return newTile;
          }
        })
      )
      .flat()
      .filter((tile) => tile);

    // The new tiles need to be converted to physics
    this.scene.matter.world.convertTiles(newTiles);

    // Finally, set the colliders for the new tiles
    newTiles.forEach((tile) => this.setMatterColliders(tile));
  }

  spaceForBodyIsClear(tile, matrix, playerTile) {
    const tileClearness = matrix
      .map((row, y) =>
        row.map((matrixTileIndex, x) => {
          if (matrixTileIndex !== -1) {
            // If the player is on the tile, it's not clear
            if (tile.x + x === playerTile.x && tile.y + y === playerTile.y) {
              return false;
            }

            // If the tilemap has a collision tile, it's not clear
            const collisionTile = this.tilemap.getTileAt(tile.x + x, tile.y + y);

            // console.log(`tile: (${tile.x}, ${tile.y})`);
            // console.log(`(${x}, ${y})`);
            // console.log(`collisionTile.index: ${collisionTile.index}`);
            if (!collisionTile) {
              return true;
            }
            return !this.getCollisionIndices().includes(collisionTile.index);
          }
        })
      )
      .flat()
      .filter((tile) => tile != null);

    // console.log('tileClearness:');
    // console.log(tileClearness);
    const allClear = tileClearness.every((tile) => tile);

    // console.log(`allClear: ${allClear}`);
    return allClear;
  }

  restoreTerrainTiles(tile, matrix) {
    matrix.forEach((row, y) =>
      row.forEach((matrixTileIndex, x) => {
        if (matrixTileIndex !== -1) {
          const tileIndex = this.collisionTileIndexes[tile.y + y][tile.x + x];
          const recalculateFaces = true;
          const restoredTile = this.tilemap.putTileAt(
            tileIndex,
            tile.x + x,
            tile.y + y,
            recalculateFaces,
            this.layers.collision
          );

          // Clear tile physics, if present
          if (restoredTile.physics.matterBody) {
            restoredTile.physics.matterBody.destroy();
          }
        }
      })
    );
  }
}
