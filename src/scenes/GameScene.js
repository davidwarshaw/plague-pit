import properties from '../properties';

import Map from '../sprites/Map';
import Player from '../sprites/Player';
import Cart from '../sprites/Cart';
import Body from '../sprites/Body';

import TileMath from '../utils/TileMath';

import BodySystem from '../systems/BodySystem';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.pestilence = 0;
    this.pestilenceTimeFactor = 0.01;
    this.pestilenceBodyFactor = 0.1;
    this.pestilenceDiminishFactor = 0.01;

    this.infection = 0;
    this.infectionTimeFactor = 0.3;
    this.infectionBodyFactor = 20;
    this.infectionDiminishFactor = 0.1;

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

    this.bodySystem = new BodySystem(this, this.map, this.bodies, this.player);

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

  playerDig(playerTile) {
    const diggingInDirection = this.player.touching[this.player.digDirection];
    if (!diggingInDirection) {
      return;
    }

    const neighborTile = TileMath.getTileNeighborByDirection(playerTile, this.player.digDirection);
    const mapTile = this.map.tilemap.getTileAt(neighborTile.x, neighborTile.y);

    // If it's a body, hit it
    if (this.map.getBodyIndices().includes(mapTile.index)) {
      this.bodySystem.hitBody(mapTile, this.player.digDirection, playerTile);
    }

    // Early exit if we can't dig
    if (!this.map.getDiggableIndices().includes(mapTile.index)) {
      return;
    }

    this.map.digTile(mapTile);
  }

  update(time, delta) {
    if (this.cart.pickUp) {
      if (this.bodies.length < this.playState.numBodies) {
        this.bodies.push(new Body(this, this.map, 1, this.cart));
        this.cart.pickUpBody(this.bodies[this.bodies.length - 1]);
      }
      else {
        this.nextLevel();
      }
    }

    this.player.update(this, delta, this.keys);
    const playerTile = this.map.tilemap.worldToTileXY(this.player.x, this.player.y);

    this.cart.update(this, delta, playerTile);

    this.playerDig(playerTile);

    this.bodySystem.bodiesFall(delta, playerTile);

    this.updatePestilence(delta);
    this.updateInfection(delta);
    this.updateMeters();
    this.checkMeters();
  }

  updatePestilence(delta) {
    const groundY = (properties.groundLevel + 1.5) * properties.tileHeight;
    const bodiesExposed = this.bodies
      .map(body => (groundY - body.y) * body.exposureFactor)
      .filter(exposure => exposure > 0)
      .reduce((acc, curr) => acc + curr, 0);
    const add = bodiesExposed * this.pestilenceBodyFactor * this.pestilenceTimeFactor * delta;
    const subtract = this.pestilenceDiminishFactor * delta;
    const newValue = this.pestilence + add - subtract;

    // console.log(
    //   `bodiesExposed: ${bodiesExposed} add: ${add} subtract: ${subtract} newValue: ${newValue}`
    // );
    this.pestilence = Phaser.Math.Clamp(newValue, 0, 100);
  }
  updateInfection(delta) {
    const numBodiesTouching = ['left', 'right', 'up', 'down']
      .map(direction => this.player.touchingBody[direction])
      .filter(touching => touching).length;
    const add = numBodiesTouching * this.infectionBodyFactor * this.pestilenceTimeFactor * delta;
    const subtract = this.infectionDiminishFactor * delta;
    const newValue = this.infection + add - subtract;

    // console.log(
    //   `numBodiesTouching: ${numBodiesTouching} add: ${add} subtract: ${subtract} newValue: ${newValue}`
    // );
    this.infection = Phaser.Math.Clamp(newValue, 0, 100);
  }

  updateMeters() {
    const meters = {
      pestilence: this.pestilence,
      infection: this.infection
    };
    this.events.emit('update-meters', meters);
  }

  checkMeters() {
    if (this.pestilence >= 100) {
    }
    if (this.infection >= 100) {
    }
  }

  nextLevel() {
    this.scene.start('TitleScene', this.playState);
  }
  repeatLevel() {
    this.scene.start('TitleScene', this.playState);
  }
  gameOver() {
    this.scene.start('TitleScene', this.playState);
  }
}
