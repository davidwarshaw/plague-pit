import properties from '../properties';

export default class Cart extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile) {
    super(scene, 0, 0, 'cart', 0);
    scene.add.existing(this);

    this.setOrigin(0, 0);

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    this.setPosition(world.x, world.y);

    scene.anims.create({
      key: 'cart_idle',
      frames: scene.anims.generateFrameNumbers('cart', { start: 0, end: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: 'cart_walk',
      frames: scene.anims.generateFrameNumbers('cart', { start: 0, end: 1, first: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: 'cart_dump',
      frames: scene.anims.generateFrameNumbers('cart', { start: 2, end: 2 }),
      frameRate: properties.animFrameRate,
      repeat: 0
    });

    this.anims.play('cart_idle', true);

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

  update(scene, delta) {}
}
