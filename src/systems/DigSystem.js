import properties from '../properties';

import TileMath from '../utils/TileMath';

import DigDirt from '../sprites/DigDirt';

export default class DigSystem {
  constructor(scene, map, bodySystem, player) {
    this.scene = scene;
    this.map = map;
    this.bodySystem = bodySystem;
    this.player = player;

  }

  update(delta, playerTile) {
    // Digging up with no tile above, creates fill dirt
    if (this.player.digDirection === 'up' &&
        !this.player.touching.up &&
        playerTile.y > properties.groundLevel) {
      const neighborTile = TileMath
        .getTileNeighborByDirection(playerTile, this.player.digDirection);

      // Upwards tile must be empty
      if (!this.map.tileIsClear(neighborTile)) {
        return;
      }
      this.player.y = this.player.y - properties.tileHeight;
      this.map.fillTile(playerTile);
      new DigDirt(this.scene, this.map, neighborTile, this.player.digDirection);
      return;
    }

    const diggingInDirection = this.player.touching[this.player.digDirection];
    if (!diggingInDirection) {
      return;
    }

    const neighborTile = TileMath.getTileNeighborByDirection(playerTile, this.player.digDirection);
    const mapTile = this.map.tilemap.getTileAt(neighborTile.x, neighborTile.y);
    if (!mapTile) {
      console.log('ERROR: null mapTile');
      return;
    }

    // If it's a body, hit it
    if (this.map.getBodyIndices().includes(mapTile.index)) {
      this.bodySystem.hitBody(mapTile, this.player.digDirection, playerTile);
    }

    // Early exit if we can't dig
    if (!this.map.getDiggableIndices().includes(mapTile.index)) {
      return;
    }

    this.map.digTile(mapTile);
    new DigDirt(this.scene, this.map, mapTile, this.player.digDirection);
  }
}
