export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Misc
    this.load.image('font-small', 'assets/fonts/atari_like.png');

    // Maps
    this.load.image('tileset', 'assets/images/tileset.png');

    // Sprites
    this.load.spritesheet('player', 'assets/images/player_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('cart', 'assets/images/cart_spritesheet.png', {
      frameWidth: 96,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.image('body-00', 'assets/images/body_00.png');
    this.load.image('body-01', 'assets/images/body_01.png');
  }

  create() {
    this.scene.start('TitleScene');
  }
}
