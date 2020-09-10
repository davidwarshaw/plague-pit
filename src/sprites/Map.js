import properties from '../properties.js';

import tilesetDefinition from '../definitions/tilesetDefinition.json';

export default class Map {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;

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
        else if (y >= properties.groundLevel + 1 && y <= 6 && x >= 6 && x <= 7) {
          return tilesetDefinition['dirt-removed'].index;
        }
        else if (y === properties.mapHeightTiles - 1) {
          return tilesetDefinition['bedrock'].index;
        }
        else {
          const roll = properties.rng.getPercentage();
          for (let obstacle of ['stone', 'dirt-heavy', 'dirt-medium']) {
            if (roll <= level * tilesetDefinition[obstacle].baseRatio) {
              return tilesetDefinition[obstacle].index;
            }
          }
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

  indexIsBody(index) {
    const isBody = index >= 25;
    return isBody;
  }

  tileIsClear(tile) {
    const collisionTile = this.tilemap.getTileAt(tile.x, tile.y, true, 'collision');
    if (!collisionTile) {
      return false;
    }
    const isClear = !this.getCollisionIndices().includes(collisionTile.index);
    return isClear;
  }

  tileIsBody(tile) {
    const collisionTile = this.tilemap.getTileAt(tile.x, tile.y, true, 'collision');
    if (!collisionTile) {
      return false;
    }
    return this.indexIsBody(collisionTile.index);
  }

  getTypeForIndex(index) {
    const types = Object.entries(tilesetDefinition)
      .filter((entry) => entry[1].index === index)
      .map((entry) => entry[0]);
    if (types.length === 1) {
      return types[0];
    }
    return null;
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

  changeTile(tile, newType) {
    const { index, collide } = tilesetDefinition[newType];

    this.collisionTileIndexes[tile.y][tile.x] = index;
    const recalculateFaces = true;
    const newTile = this.tilemap.putTileAt(
      index,
      tile.x,
      tile.y,
      recalculateFaces,
      this.layers.collision
    );

    // If the tile isn't collidable, remove the physics body
    if (!collide && newTile.physics.matterBody) {
      tile.physics.matterBody.destroy();
    }
    else if (collide && !newTile.physics.matterBody) {
      this.scene.matter.add.tileBody(newTile);
      this.setMatterColliders(newTile);
    }
    
  }

  digTile(tile) {
    const currentType = this.getTypeForIndex(tile.index);
    const newType = tilesetDefinition[currentType].digsTo;
    this.changeTile(tile, newType);
  }

  fillTile(tile) {
    const newType = 'dirt-fill';
    this.changeTile(tile, newType);
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

  spaceForBodyIsClear(tile, matrix, playerTile, previousTile) {
    const tileClearness = matrix
      .map((row, y) =>
        row.map((matrixTileIndex, x) => {
          if (matrixTileIndex !== -1) {
            const mapTile = { x: tile.x + x, y: tile.y + y };
            // console.log(`tile: ${tile.x}, ${tile.y}`);
            // console.log(`matrix tile: ${x}, ${y}`);
            // console.log(`mapTile: ${mapTile.x}, ${mapTile.y}`);

            // If the player is on the tile, it's not clear
            if (mapTile.x === playerTile.x && mapTile.y === playerTile.y) {
              // console.log('false from player');
              return false;
            }

            // If this body is on the tile, it is clear. This must be calculated from
            // where the body is now, not where it will be
            if (previousTile && this.scene.bodySystem.matrixHasTile(mapTile, previousTile, matrix)) {
              // console.log('true from body');
              return true;
            }

            // If the tilemap has a collision tile, it's not clear
            const collisionTile = this.tilemap.getTileAt(mapTile.x, mapTile.y, true, 'collision');

            // console.log(`tile: (${tile.x}, ${tile.y})`);
            // console.log(`(${x}, ${y})`);
            // console.log(`collisionTile.index: ${collisionTile.index}`);
            if (!collisionTile) {
              // console.log('true from null tile');
              return true;
            }
            const isCollisionTile = this.getCollisionIndices().includes(collisionTile.index);
            // console.log(`${!isCollisionTile} from index: ${collisionTile.index}`);
            return !isCollisionTile;
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
