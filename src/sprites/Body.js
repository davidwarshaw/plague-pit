export default class Body extends Phaser.Physics.Matter.Sprite {
  constructor(scene, map, spawn, type) {
    const key = `body-0${type}`;
    super(scene.matter.world, 0, 0, key);
    scene.add.existing(this);

    const M = Phaser.Physics.Matter.Matter;
    this.mainBody = M.Bodies.rectangle(0, 0, this.width, this.height, {
      chamfer: { radius: 10 }
    });

    this.setExistingBody(this.mainBody);

    this.setFixedRotation();
    this.setBounce(0);
    this.setFriction(0.1);

    this.setCollisionCategory(scene.collisionCategories.main);
    this.setCollidesWith(scene.collisionCategories.main);

    this.setPosition(spawn.x, spawn.y);
  }
}
