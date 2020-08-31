export default class InputMultiplexer {
  constructor(scene) {
    this.scene = scene;

    this.buttons = {
      action: { isDown: false },
      jump: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
      left: { isDown: false },
      right: { isDown: false },
    }
    this.keys = {
      action: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    };
  }

  registerPad() {
    this.pad = this.scene.input.gamepad.pad1;
  }

  setPadButtons() {
    if (!this.pad) {
      return;
    }
    this.buttons.action.isDown = this.pad.buttons[3].value === 1;
    this.buttons.jump.isDown = this.pad.buttons[2].value === 1;
    this.buttons.up.isDown = this.pad.leftStick.y === -1;
    this.buttons.down.isDown = this.pad.leftStick.y === 1;
    this.buttons.left.isDown = this.pad.leftStick.x === -1;
    this.buttons.right.isDown = this.pad.leftStick.x === 1;
  }

  input(playerInput) {
    return this.buttons[playerInput].isDown || this.keys[playerInput].isDown;
  }

  action() {
    return this.input('action');
  }
  jump() {
    return this.input('jump');
  }
  up() {
    return this.input('up');
  }
  down() {
    return this.input('down');
  }
  left() {
    return this.input('left');
  }
  right() {
    return this.input('right');
  }
}