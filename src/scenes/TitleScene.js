import properties from '../properties';

import Font from '../ui/Font';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.playState = {
      numBodies: 20
    };

    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images = [];

    let offsetY = 40;

    offsetY += -32;
    let text = 'Plague Pit';
    let offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    offsetY += 32;
    text = 'Press any key';
    offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    // Register the mouse listener
    this.input.keyboard.on('keydown', () => this.keyDown());
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }

  keyDown() {
    this.scene.start('GameScene', this.playState);
    this.scene.start('HudScene', this.playState);
  }
}
