import properties from '../properties';

import Map from '../sprites/Map';
import Player from '../sprites/Player';
import Cart from '../sprites/Cart';
import Body from '../sprites/Body';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    // Map and player
    this.map = new Map(this);
    const { widthInPixels, heightInPixels } = this.map.tilemap;

    this.cart = new Cart(this, this.map, { x: 1, y: 4 });

    this.player = new Player(this, this.map, { x: 5, y: 3 });
    this.bodies = [];
    this.bodies.push(new Body(this, this.map, { x: 2, y: 2 }, 1));

    // Physics
    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels);

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

  playerTileCollision(player, tile) {
    const tileInDirection = this.map.isTileInDirection(player, tile, player.digDirection);

    // console.log(`tileInDirection: ${tileInDirection}`);
    if (!tileInDirection) {
      return;
    }
    if (
      (player.digDirection === 'up' && player.body.blocked.up) ||
      (player.digDirection === 'down' && player.body.blocked.down) ||
      (player.digDirection === 'left' && player.body.blocked.left) ||
      (player.digDirection === 'right' && player.body.blocked.right)
    ) {
      this.map.digTile(tile);
    }
  }

  update(time, delta) {
    if (this.cart.pickUp) {
      this.bodies.push(new Body(this, this.map, { x: 2, y: 2 }, 1));
    }

    // Collide player
    if (this.player.digDirection) {
      // console.log(`this.player.digDirection: ${this.player.digDirection}`);
      this.physics.world.collide(
        this.player,
        this.map.layers.collision,
        this.playerTileCollision,
        null,
        this
      );
    }
    else {
      this.physics.world.collide(this.player, this.map.layers.collision);
    }

    // Collide bodies
    this.physics.world.collide(this.bodies, this.bodies);
    this.physics.world.collide(this.bodies, this.player);
    this.physics.world.collide(this.bodies, this.map.layers.collision);

    this.player.update(this, delta, this.keys);

    this.cart.update(this, delta);
  }
}
