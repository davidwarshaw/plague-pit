import properties from '../properties';

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile) {
    super(scene, 0, 0, 'player', 0);
    scene.physics.world.enable(this);
    scene.add.existing(this);

    //this.setOrigin(0, 0);

    this.body.setSize(20, 32);
    this.body.setBounce(0.0);
    this.body.setCollideWorldBounds(true);

    this.body.maxVelocity.x = 200;
    this.body.maxVelocity.y = 500;

    this.walkSpeed = 150;
    this.airwalkSpeed = 75;
    this.jumpSpeed = 280;

    this.inJump = false;
    this.inAction = false;

    this.jumpPressed = false;
    this.actionPressed = false;

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    this.setPosition(world.x, world.y);

    scene.anims.create({
      key: 'player_idle',
      frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: 'player_walk',
      frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 1, first: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: 'player_jump',
      frames: scene.anims.generateFrameNumbers('player', { start: 2, end: 2 }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: 'player_action',
      frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
      frameRate: properties.animFrameRate,
      repeat: 0
    });

    this.anims.play('player_walk', true);

    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);

    // and reset the flag when the animation completes
    this.on(
      Phaser.Animations.Events.SPRITE_ANIMATION_KEY_COMPLETE + 'player_action',
      () => {
        // console.log('animation complete: player_action');
        this.inAction = false;
      },
      this
    );
  }

  update(scene, delta, keys) {
    this.digDirection = null;

    const onSomething = this.body.onFloor() || this.body.touching.down;

    // Reset pressed flags
    if (!keys.jump.isDown) {
      this.jumpPressed = false;
    }
    if (!keys.action.isDown) {
      this.actionPressed = false;
    }

    let actionThisUpdate = false;

    // If we land, the jump is over
    if (this.body.onFloor()) {
      this.inJump = false;
    }

    if (keys.jump.isDown && this.body.onFloor() && !this.jumpPressed) {
      // console.log('Keys: jump');
      if (!this.inAction) {
        this.anims.play('player_jump', true);
      }
      this.body.setVelocityY(-this.jumpSpeed);
      this.jumpPressed = true;
      this.inJump = true;
    }

    if (keys.action.isDown && !this.actionPressed && !this.inAction) {
      // console.log('Keys: action');
      this.anims.play('player_action', true);
      this.actionPressed = true;
      this.inAction = true;
      actionThisUpdate = true;
    }

    if (keys.up.isDown) {
      // console.log('Keys: up');
      if (!this.inAction && !this.inJump) {
        this.anims.play('player_walk', true);
      }
      if (this.inAction && actionThisUpdate) {
        this.digDirection = 'up';
      }
    }
    else if (keys.down.isDown) {
      // console.log('Keys: down');
      if (!this.inAction && !this.inJump) {
        this.anims.play('player_walk', true);
      }
      if (this.inAction && actionThisUpdate) {
        this.digDirection = 'down';
      }
    }
    else if (keys.left.isDown) {
      // console.log('Keys: left');
      if (!this.inAction && !this.inJump) {
        this.anims.play('player_walk', true);
      }
      const walkSpeed = this.body.onFloor() ? this.walkSpeed : this.airwalkSpeed;
      this.body.setVelocityX(-walkSpeed);
      this.flipX = true;
      if (this.inAction && actionThisUpdate) {
        this.digDirection = 'left';
      }
    }
    else if (keys.right.isDown) {
      // console.log('Keys: right');
      if (!this.inAction && !this.inJump) {
        this.anims.play('player_walk', true);
      }
      const walkSpeed = this.body.onFloor() ? this.walkSpeed : this.airwalkSpeed;
      this.body.setVelocityX(walkSpeed);
      this.flipX = false;
      if (this.inAction && actionThisUpdate) {
        this.digDirection = 'right';
      }
    }
    else {
      if (!this.inAction && !this.inJump) {
        this.anims.play('player_idle', true);
      }
      this.body.setVelocityX(0);
    }

    // If we end action in a jump, switch the animation to the jump anim
    if (this.inJump && !this.inAction) {
      this.anims.play('player_jump', true);
    }

    // If we're falling, switch the animation to the jump anim
    if (!this.body.onFloor() && !this.inJump && !this.inAction) {
      this.anims.play('player_jump', true);
    }
  }
}
