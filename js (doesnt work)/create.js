import { GameState } from './state.js';
import { setupCamels } from './camelManager.js';

export default function create() {
    GameState.cursors = this.input.keyboard.createCursorKeys();
    GameState.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
    GameState.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.cameras.main.setBackgroundColor('#f9f5e3');

    GameState.player = this.physics.add.image(300, 300, 'player').setDisplaySize(100, 100);

    setupCamels(this);

    GameState.tents = this.add.group();
    [[100, 400], [200, 600], [400, 100]].forEach(([x, y]) => {
        GameState.tents.create(x, y, 'tent').setDisplaySize(50, 50);
    });

    GameState.bushes = this.add.group();
    [[900, 300], [400, 750], [500, 900]].forEach(([x, y]) => {
        GameState.bushes.create(x, y, 'bush').setDisplaySize(30, 30);
    });

    this.cameras.main.startFollow(GameState.player);

    GameState.enemies = this.physics.add.group();
    GameState.projectiles = this.physics.add.group();

    GameState.healthText = this.add.text(16, 16, 'Health: 5', {
        fontSize: '24px',
        fill: '#000'
    });
    GameState.healthText.setScrollFactor(0);
}
