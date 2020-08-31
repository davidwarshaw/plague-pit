export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Misc
    this.load.image('font-small', 'assets/fonts/atari_like.png');
    this.load.image('title', 'assets/images/title.png');
    this.load.image('title-big', 'assets/images/title_big.png');
    this.load.image('crown', 'assets/images/crown.png');
    this.load.image('moon', 'assets/images/moon.png');
    this.load.image('skull-big', 'assets/images/skull.png');
    this.load.image('skull-small', 'assets/images/skull_small.png');
    this.load.image('skull-grass', 'assets/images/skull_grass.png');
    this.load.image('shovel', 'assets/images/shovel.png');

    // Maps
    this.load.image('tileset-2', 'assets/images/tileset-2.png');

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
    this.load.spritesheet('dig-dirt', 'assets/images/dig_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('pestilence', 'assets/images/pestilence_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.image('body-00', 'assets/images/body_00.png');
    this.load.image('body-01', 'assets/images/body_01.png');

    // UI Sprites
    this.load.spritesheet('rat', 'assets/images/rat_spritesheet.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('skull', 'assets/images/skull_spritesheet.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });
  }

  create() {
    this.scene.start('TitleScene');
  }
}
