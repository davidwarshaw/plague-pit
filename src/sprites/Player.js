import properties from "../properties";

export default class Player extends Phaser.Physics.Matter.Sprite {
  constructor(scene, map, tile) {
    super(scene.matter.world, 0, 0, "player", 0);
    scene.add.existing(this);

    const M = Phaser.Physics.Matter.Matter;
    this.mainBody = M.Bodies.rectangle(0, 0, this.width * 0.75, this.height, {
      chamfer: { radius: 10 },
    });
    this.sensors = {
      left: M.Bodies.rectangle(-this.width * 0.45, 0, 5, this.height * 0.25, { isSensor: true }),
      right: M.Bodies.rectangle(this.width * 0.45, 0, 5, this.height * 0.25, { isSensor: true }),
      up: M.Bodies.rectangle(0, -this.height * 0.5, this.width * 0.5, 5, { isSensor: true }),
      down: M.Bodies.rectangle(0, this.height * 0.5, this.width * 0.5, 5, { isSensor: true }),
    };
    this.compoundBody = M.Body.create({
      parts: [
        this.mainBody,
        this.sensors.left,
        this.sensors.right,
        this.sensors.up,
        this.sensors.down,
      ],
      friction: 0.01,
      restitution: 0.05, // Prevent body from sticking against a wall
    });

    this.setExistingBody(this.compoundBody);

    this.setFixedRotation();
    this.setBounce(0);
    this.setFriction(0);

    this.setDepth(2);

    this.setCollisionCategory(scene.collisionCategories.main);
    this.setCollidesWith(scene.collisionCategories.main);

    this.type = "player";

    this.walkSpeed = 3.5;
    this.airwalkSpeed = 2;
    this.jumpSpeed = 8;

    this.inJump = false;
    this.inAction = false;

    this.jumpPressed = false;
    this.actionPressed = false;

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    this.setPosition(world.x, world.y);

    scene.anims.create({
      key: "player_idle",
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_walk",
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 1, first: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_jump",
      frames: scene.anims.generateFrameNumbers("player", { start: 2, end: 2 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_action",
      frames: scene.anims.generateFrameNumbers("player", { start: 4, end: 5 }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });

    this.anims.play("player_walk", true);

    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);

    // and reset the flag when the animation completes
    this.on(
      Phaser.Animations.Events.SPRITE_ANIMATION_KEY_COMPLETE + "player_action",
      () => {
        // console.log('animation complete: player_action');
        this.inAction = false;
      },
      this
    );

    this.touching = {
      left: false,
      right: false,
      up: false,
      down: false,
    };
    this.touchingBody = {
      left: false,
      right: false,
      up: false,
      down: false,
    };
    scene.matter.world.on("beforeupdate", () => {
      this.touching.left = false;
      this.touching.right = false;
      this.touching.up = false;
      this.touching.down = false;
      this.touchingBody.left = false;
      this.touchingBody.right = false;
      this.touchingBody.up = false;
      this.touchingBody.down = false;
    });
    scene.matter.world.on("collisionactive", (event) => {
      const left = this.sensors.left;
      const right = this.sensors.right;
      const up = this.sensors.up;
      const down = this.sensors.down;

      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;

        if (bodyA === this.mainBody || bodyB === this.mainBody) {
          continue;
        } else if (bodyA === left) {
          this.touching.left = true;
          if (map.indexIsBody(bodyB.gameObject.tile.index)) {
            this.touchingBody.left = true;
          }
        } else if (bodyA === right) {
          this.touching.right = true;
          if (map.indexIsBody(bodyB.gameObject.tile.index)) {
            this.touchingBody.right = true;
          }
        } else if (bodyA === up) {
          this.touching.up = true;
          if (map.indexIsBody(bodyB.gameObject.tile.index)) {
            this.touchingBody.up = true;
          }
        } else if (bodyA === down) {
          this.touching.down = true;
          if (map.indexIsBody(bodyB.gameObject.tile.index)) {
            this.touchingBody.down = true;
          }
        } else if (bodyB === left) {
          this.touching.left = true;
          if (map.indexIsBody(bodyA.gameObject.tile.index)) {
            this.touchingBody.left = true;
          }
        } else if (bodyB === right) {
          this.touching.right = true;
          if (map.indexIsBody(bodyA.gameObject.tile.index)) {
            this.touchingBody.right = true;
          }
        } else if (bodyB === up) {
          this.touching.up = true;
          if (map.indexIsBody(bodyA.gameObject.tile.index)) {
            this.touchingBody.up = true;
          }
        } else if (bodyB === down) {
          this.touching.down = true;
          if (map.indexIsBody(bodyA.gameObject.tile.index)) {
            this.touchingBody.down = true;
          }
        }
      }
    });
  }

  isTouching() {
    return this.touching.left || this.touching.right || this.touching.up || this.touching.down;
  }

  update(scene, delta, inputMultiplexer) {
    this.digDirection = null;

    const onSomething = this.touching.down;

    // Reset pressed flags
    if (!inputMultiplexer.jump()) {
      this.jumpPressed = false;
    }
    if (!inputMultiplexer.action()) {
      this.actionPressed = false;
    }

    let actionThisUpdate = false;

    // If we land, the jump is over
    if (onSomething) {
      this.inJump = false;
    }

    if (inputMultiplexer.jump() && onSomething && !this.jumpPressed) {
      // console.log('Keys: jump');
      if (!this.inAction) {
        this.anims.play("player_jump", true);
      }
      this.setVelocityY(-this.jumpSpeed);
      this.jumpPressed = true;
      this.inJump = true;
    }

    if (inputMultiplexer.action() && !this.actionPressed && !this.inAction) {
      // console.log('Keys: action');
      this.anims.play("player_action", true);
      this.actionPressed = true;
      this.inAction = true;
      actionThisUpdate = true;
    }

    if (inputMultiplexer.up()) {
      // console.log('Keys: up');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
      }
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "up";
      }
    } else if (inputMultiplexer.down()) {
      // console.log('Keys: down');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
      }
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "down";
      }
    } else if (inputMultiplexer.left()) {
      // console.log('Keys: left');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
      }
      const walkSpeed = onSomething ? this.walkSpeed : this.airwalkSpeed;
      this.setVelocityX(-walkSpeed);
      this.flipX = true;
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "left";
      }
    } else if (inputMultiplexer.right()) {
      // console.log('Keys: right');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
      }
      const walkSpeed = onSomething ? this.walkSpeed : this.airwalkSpeed;
      this.setVelocityX(walkSpeed);
      this.flipX = false;
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "right";
      }
    } else {
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_idle", true);
      }
      this.setVelocityX(0);
    }

    // If we end action in a jump, switch the animation to the jump anim
    if (this.inJump && !this.inAction) {
      this.anims.play("player_jump", true);
    }

    // If we're falling, switch the animation to the jump anim
    if (!onSomething && !this.inJump && !this.inAction) {
      this.anims.play("player_jump", true);
    }
  }
}
