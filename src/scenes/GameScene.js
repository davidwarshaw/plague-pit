import properties from '../properties';

import Map from '../sprites/Map';
import Player from '../sprites/Player';
import Cart from '../sprites/Cart';
import Body from '../sprites/Body';

import TileMath from '../utils/TileMath';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    // Physics
    this.matter.world.setBounds(0, 0, widthInPixels, heightInPixels);

    this.collisionCategories = {};
    this.collisionCategories['main'] = this.matter.world.nextCategory();
    this.collisionCategories['none'] = this.matter.world.nextCategory();

    // Map and player
    this.map = new Map(this);
    const { widthInPixels, heightInPixels } = this.map.tilemap;

    this.cart = new Cart(this, this.map, { x: 1, y: 4 });

    this.player = new Player(this, this.map, { x: 5, y: 3 });
    this.bodies = [];

    // Camera
    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    this.keys = {
      action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    };
  }

  playerDig() {
    const diggingInDirection = this.player.touching[this.player.digDirection];
    if (!diggingInDirection) {
      return;
    }
    const playerTile = this.map.tilemap.worldToTileXY(this.player.x, this.player.y);
    console.log(playerTile);
    console.log(diggingInDirection);
    const neighborTile = TileMath.getTileNeighborByDirection(playerTile, this.player.digDirection);
    console.log(neighborTile);
    this.map.digTile(neighborTile);
  }

  update(time, delta) {
    if (this.cart.pickUp) {
      if (this.bodies.length < this.playState.numBodies) {
        this.bodies.push(new Body(this, this.map, this.cart, 1));
        this.cart.pickUpBody(this.bodies[this.bodies.length - 1]);
      }
      else {
        this.nextLevel();
      }
    }
    this.player.update(this, delta, this.keys);

    this.cart.update(this, delta);

    this.playerDig();
  }

  nextLevel() {
    this.scene.start('TitleScene', this.playState);
  }
}
