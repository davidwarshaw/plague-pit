import properties from '../properties';

import Font from '../ui/Font';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    // console.log(this.playState);
    this.font = new Font(this);

    this.images = [];

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;
    let offsetY = -32;
    let text = 'You caught them all!';
    let offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    this.input.keyboard.on('keydown', () => this.keyDown());
    this.buttonIsPressed = false;
    this.gamePadListeners = false;
  }

  update() {
    if (!this.gamePadListeners && this.input.gamepad && this.input.gamepad.pad1) {
      this.input.gamepad.pad1.on('down', () => {
        if (!this.buttonIsPressed) {
          this.keyDown();
        }
      });
      this.input.gamepad.pad1.on('up', () => this.buttonIsPressed = false);
      this.gamePadListeners = true;
    }
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }

  keyDown() {
    this.input.gamepad.removeAllListeners();
    this.scene.start('TitleScene', this.playState);
  }
}
