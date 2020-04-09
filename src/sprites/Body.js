export default class Body extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile, type) {
    const key = `body-0${type}`;
    super(scene, 0, 0, key);
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.setOrigin(0, 0);

    this.body.setBounce(0.0);
    this.body.setDrag(100, 100);
    this.body.setCollideWorldBounds(true);

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    this.setPosition(world.x, world.y);
  }
}
