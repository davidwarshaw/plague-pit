import properties from '../properties';

import Map from '../sprites/Map';
import Player from '../sprites/Player';
import Cart from '../sprites/Cart';
import Body from '../sprites/Body';

import InputMultiplexer from '../utils/InputMultiplexer';

import BodySystem from '../systems/BodySystem';
import DiseaseSystem from '../systems/DiseaseSystem';
import DigSystem from '../systems/DigSystem';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {

    this.numBodies = 4 + this.playState.level * 2;
    this.allBodiesDropped = false;
    this.gameIsOver = false;

    // Physics
    this.matter.world.setBounds(0, 0, widthInPixels, heightInPixels);

    this.collisionCategories = {};
    this.collisionCategories['main'] = this.matter.world.nextCategory();
    this.collisionCategories['none'] = this.matter.world.nextCategory();

    // Map and player
    this.map = new Map(this, this.playState.level);
    const { widthInPixels, heightInPixels } = this.map.tilemap;

    this.cart = new Cart(this, this.map, { x: 1, y: 4 });

    this.moon = this.add.image(600, 20, 'moon');

    this.player = new Player(this, this.map, { x: 5, y: 3 });
    this.bodies = [];

    this.bodySystem = new BodySystem(this, this.map, this.bodies, this.player);
    this.diseaseSystem = new DiseaseSystem(this, this.map, this.bodies, this.player);
    this.digSystem = new DigSystem(this, this.map, this.bodySystem, this.player);

    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    this.inputMultiplexer = new InputMultiplexer(this);

    this.buttonIsPressed = true;
    this.gamePadListeners = false;
    
    this.sounds = {
      gameOver: this.sound.add('game-over'),
      nextLevel: this.sound.add('next-level'),
    }
  }

  update(time, delta) {
    if (!this.gamePadListeners && this.input.gamepad && this.input.gamepad.pad1) {
      this.input.gamepad.pad1.on('up', () => this.buttonIsPressed = false);
      this.gamePadListeners = true;
      this.inputMultiplexer.registerPad();
    }

    this.inputMultiplexer.setPadButtons();

    if (this.gameIsOver) {
      return;
    }

    if (this.cart && this.cart.pickUp) {
      if (this.bodies.length < this.numBodies) {
        const bodyType = this.bodySystem.randomBodyForLevel(this.playState.level);
        this.bodies.push(new Body(this, this.map, bodyType, this.cart));
        this.cart.pickUpBody(this.bodies[this.bodies.length - 1]);

        // Update the night and bodies left whenever the car tpicks up a new body
        const night = this.playState.level;
        const bodiesLeft = this.numBodies - this.bodies.length;
        this.events.emit('bodies-left', { night, bodiesLeft });
      }
      else {
        this.allBodiesDropped = true;
        this.cart.destroy();
        this.cart = null;
      }
    }

    this.player.update(this, delta, this.inputMultiplexer);
    const playerTile = this.map.tilemap.worldToTileXY(this.player.x, this.player.y);

    if (this.cart) {
      this.cart.update(this, delta, playerTile);
    }

    this.digSystem.update(delta, playerTile);

    this.bodySystem.bodiesFall(delta, playerTile);

    const { pestilence, infection } = this.diseaseSystem.update(delta);

    this.updateMeters(pestilence, infection);
    this.checkMeters();
  }

  updateMeters(pestilence, infection) {
    const meters = { pestilence, infection };
    this.events.emit('update-meters', meters);
  }

  checkMeters() {
    if (this.allBodiesDropped && this.diseaseSystem.allBodiesBuried()) {
      const win = true;
      this.endPlay(win);
      this.events.emit('show-win', {});
    } else if (this.diseaseSystem.pestilence >= 100) {
      const win = false;
      this.endPlay(win);
      this.events.emit('show-loss', 'pestilence');
    } else if (this.diseaseSystem.infection >= 100) {
      const win = false;
      this.endPlay(win);
      this.events.emit('show-loss', 'infection');
    }
  }

  nextLevel() {
    this.playState.level += 1;
    if (this.playState.level < this.playState.maxLevels) {
      this.scene.stop('HudScene');
      this.scene.start('LevelTitleScene', this.playState);
    } else {
      this.scene.stop('HudScene');
      this.scene.start('WinScene', this.playState);
    }
  }

  gameOver() {
    this.scene.stop('HudScene');
    this.scene.start('GameOverScene', this.playState);
  }

  endPlay(win) {
    this.gameIsOver = true;
    
    this.player.anims.play("player_idle", true);
    this.player.setVelocity(0);
    this.player.sounds.walk.stop();
    
    if (win) {
      this.sounds.nextLevel.play();
      this.endPlayTimer = this.time.delayedCall(
        properties.levelWaitMillis,
        () => this.nextLevel(),
        [], this);
    } else {
      this.sounds.gameOver.play();
      this.endPlayTimer = this.time.delayedCall(
        properties.levelWaitMillis,
        () => this.gameOver(),
        [], this);
    }

  }
}
