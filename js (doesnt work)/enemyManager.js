import { GameState } from './state.js';

export function spawnEnemies(scene) {
    if (Math.random() < 0.02) {
        const x = Phaser.Math.Between(GameState.player.x - 500, GameState.player.x + 500);
        const y = Phaser.Math.Between(GameState.player.y - 500, GameState.player.y + 500);
        const enemy = GameState.enemies.create(x, y, 'bush').setDisplaySize(40, 40);
        enemy.health = 3;
    }
}

export function moveEnemies(scene) {
    GameState.enemies.getChildren().forEach(enemy => {
        scene.physics.moveToObject(enemy, GameState.player, 100);

        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, GameState.player.x, GameState.player.y);
        if (dist < 40) {
            enemy.destroy();
            GameState.playerHealth--;
            GameState.healthText.setText('Health: ' + GameState.playerHealth);

            if (GameState.playerHealth <= 0) {
                GameState.player.setVelocity(0);
                GameState.player.body.enable = false;
                GameState.player.setTint(0xff0000);
                GameState.healthText.setText('You died! Press R to restart');
                scene.input.keyboard.once('keydown-R', () => {
                    scene.scene.restart();
                    GameState.resetGameState();
                });
            }
        }
    });
}
