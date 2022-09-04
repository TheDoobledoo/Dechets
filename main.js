var config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 700,
    physics: {
        default: 'arcade',
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }

};

class Player extends Phaser.Physics.Arcade.Sprite
{
    totalJumps = 2;
    currentJumps = 0;
    scale = this.setScale(2);
    constructor(scene, x, y)
    {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setGravityY(3000); //We will set gravity *per object* rather than for the scene!
    }
}

var game = new Phaser.Game(config);

//Game Objects
var platforms;
var player;
var currentanimation = 'player';

//Keyboard controls
var cursors;
var keys;
var space;
var running;
var jumping;
var raccoon;
var attacking;

function preload()
{
    this.load.image('wall', 'assets/citybackground4.png');
    this.load.image('platform', 'assets/street.png');
    this.load.spritesheet('player', 'assets/francoisrun3.png', { frameWidth: 35, frameHeight: 60});
    this.load.spritesheet('playerattack', 'assets/francoisattack3.png', { frameWidth: 65, frameHeight: 60});
    this.load.spritesheet('playeridle', 'assets/francoisidle5.png', { frameWidth: 35, frameHeight: 60});
    this.load.image('playerjump', 'assets/francoisjump.png', { frameWidth: 35, frameHeight: 60});
    this.load.image('dumpster', 'assets/dumpster2.png');
    this.load.image('flag', 'assets/flag.png');
    this.load.image('lamppost', 'assets/lampposttop3.png');
    this.load.image('building', 'assets/building.png');
    this.load.spritesheet('bigbakery', 'assets/bakery2.png', { frameWidth: 200, frameHeight: 200});
    this.load.image('lamppole', 'assets/lamppole2.png');
    this.load.image('buildingSAVIOR', 'assets/buildingSAVIOR.png');
    this.load.spritesheet('raccoonidle', 'assets/raccoonidle.png', { frameWidth: 22, frameHeight: 14});
    this.load.spritesheet('raccoondie', 'assets/raccoondie.png', { frameWidth: 23, frameHeight: 16});
    this.load.image('A&D', 'assets/adtomove.png');
    this.load.image('SPACE', 'assets/spacetojump.png');
    this.load.image('Letter', 'assets/etoattack2.png');
    this.load.image('end', 'assets/fin1.png');
}

function create()
{
    this.physics.world.setBounds(0, 0, 2700, 700);
    //Set the background origin to be at (0, 0) or top left corner of the image rather than the center of the image asset
    let background = this.add.tileSprite(0, -34, 2700, 700, 'wall').setOrigin(0, 0);

    const bakeryAnimation = this.anims.create({
        key: 'bakery',
        frames: this.anims.generateFrameNumbers('bigbakery'),
        frameRate: 12
    });

    const raccoonIdle = this.anims.create({
        key: 'raccoon',
        frames: this.anims.generateFrameNumbers('raccoonidle'),
        frameRate: 4
    })

    const raccoonDie = this.anims.create({
        key: 'die',
        frames: this.anims.generateFrameNumbers('raccoondie'),
        framerate:16
    })

    let bread= this.add.sprite(130, 490, 'bigbakery');
    bread.setScale(2);
    bread.play({ key: 'bakery', repeat: -1}, true);

    let raccoon= this.physics.add.sprite(1200, 650, 'raccoonidle');
    raccoon.setScale(3);
    raccoon.play({ key: 'raccoon', repeat: -1}, true);

    let raccoon2= this.physics.add.sprite(1400, 650, 'raccoonidle');
    raccoon2.setScale(3);
    raccoon2.play({ key: 'raccoon', repeat: -1}, true);

    let raccoon3= this.physics.add.sprite(1600, 650, 'raccoonidle');
    raccoon3.setScale(3);
    raccoon3.play({ key: 'raccoon', repeat: -1}, true);

    flag = this.physics.add.staticGroup();
    let flagyFlag=flag.create(2500, 200, 'flag');
    flagyFlag.setScale(2, 2);

    let ad = this.add.image(395, 300, 'A&D');
    ad.setScale(2);

    let letter = this.add.image(1200, 300, 'Letter');
    letter.setScale(2);

    let space = this.add.image(800, 290, 'SPACE');
    space.setScale(2);

    //Create all animations
    const walkAnimation = this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player'),
        frameRate: 48
    });

    const idleAnimation = this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('playeridle'),
        frameRate: 4
    });

    const attackAnimation = this.anims.create({
        key: 'attack',
        frames: this.anims.generateFrameNumbers('playerattack'),
        frameRate: 16
    });

    //Create the platforms and the player character set to collide with the platforms
    createPlatforms(this);
    player = new Player(this, 400, 400);
    this.physics.add.collider(player, platforms);
    createDumpster(this);
    this.physics.add.collider(player, dumpster);
    this.physics.add.overlap(player, raccoon, overlapRaccoon, null, this);
    this.physics.add.overlap(player, raccoon2, overlapRaccoon, null, this);
    this.physics.add.overlap(player, raccoon3, overlapRaccoon, null, this);
    this.physics.add.overlap(player, flagyFlag, winCondition, null, this);

    //Set up user input
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('A, D, E');
    space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    //mouse = this.input.mouse
    space.on('down', jump); //calls jump function when space is pressed

    //camera scroll
    this.cameras.main.setBounds(0, 0, 2700, 700); //(x, y, width, height) width bound for total level
    this.cameras.main.startFollow(player, true, 0.5, 0.5);
    this.cameras.main.setZoom(1.5);

    let lamppole = this.add.image(2150, 545, 'lamppole');
    lamppole.setScale(2.5);

    let buildingSAVIOR = this.add.image(2728, 450, 'buildingSAVIOR');
    buildingSAVIOR.setScale(2);
}

function overlapRaccoon(player, raccoon)
{
    if (attacking) {
        let timedanim = this.time.delayedCall(500, delayedAnim, [raccoon], this);
        let timedEvent = this.time.delayedCall(1000, delayedDeath, [raccoon], this);
    }
}

function delayedDeath(raccoon)
{
    raccoon.disableBody(true, true);
}

function delayedAnim(raccoon)
{
    raccoon.play({ key: 'die', repeat:0}, true)
}

function winCondition(player, flagyFlag)
{
    player.disableBody(true, false);
    let ending = this.add.image(2200, 225, 'end');
    ending.setScale(1);
}

function createPlatforms(scene)
{
    platforms = scene.physics.add.staticGroup();

    //basePlatform is the floor of the game
    let basePlatform = platforms.create(game.scale.width/2, game.scale.height, 'platform');
    basePlatform.setScale(8, 1).refreshBody(); //scales the base platform in the x axis to cover the entire floor
}
function createDumpster(scene)
{
    //dumpster code
    dumpster = scene.physics.add.staticGroup();
    let dumpyDump=dumpster.create(1900, 615, 'dumpster');

    dumpster2 = scene.physics.add.staticGroup();
    let ugly=dumpster.create(800, 615, 'dumpster');
    ugly.setScale(2, 2);
    ugly.body.setSize(200, 150);

    dumpyDump.setScale(2, 2); //scales the base platform in the x axis to cover the entire floor
    dumpyDump.body.setSize(200,150);

    //lamppost code
    lamppost = scene.physics.add.staticGroup();
    let lampyLamp=dumpster.create(2150, 400, 'lamppost');
    lampyLamp.setScale(3, 3);
    lampyLamp.body.setSize(50,20);

    building=scene.physics.add.staticGroup();
    let bigBoii=dumpster.create(2500, 450, 'building');
    bigBoii.setScale(2);
    bigBoii.body.setSize(450,650)
}

function update()
{
    //Player will not move in the x-axis unless a movement key is being pressed
    player.setVelocityX(0);

    //Player has "drag" on the x-axis meaning they slide a bit after an input
    player.setDragX(1000);

    //This will reset the number of jumps available to the player whenever the player lands
    if (player.body.touching.down) {
        player.currentJumps = 0;
    }

    if (keys.A.isDown)
    {
        running = true;
        player.setVelocityX(-400);
        scale = player.setScale(-2, 2);
    }

    if (keys.D.isDown)
    {
        running = true;
        player.setVelocityX(400);
        scale = player.setScale(2, 2);
    }

    if (running) {
        attacking = false;
        player.play({ key: 'walk', repeat: 7}, true);
    }

    if (jumping) {
        player.setTexture('playerjump');
    }

    if (!(keys.A.isDown) && !(keys.D.isDown) && !(keys.E.isDown) && !(jumping)) {
        running = false;
        attacking = false;
        currentanimation = 'playeridle';
        player.play({ key: 'idle', repeat: 1}, true);
    }
    if (player.body.onFloor()){
        jumping = false;
    }

    if (keys.E.isDown && !(jumping) && !(keys.A.isDown) && !(keys.D.isDown)) {
        attacking = true;
        currentanimation = 'playerattack';
        player.body.setSize(65, 60);
        player.play({ key: 'attack', repeat: 1}, true);
    } else {
        player.body.setSize(35, 60);
    }
}

function jump(event)
{
    jumping = true
    if (player.body.touching.down) {
        //If the player is on the ground, the player can jump
        player.setVelocityY(-1100);
        player.currentJumps++;
    }
}

