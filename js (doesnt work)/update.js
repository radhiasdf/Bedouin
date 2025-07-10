import { GameState } from './state.js';

import { updateCamels } from './camelManager.js';
import { spawnEnemies, moveEnemies } from './enemyManager.js';
import { handleProjectiles } from './projectileManager.js';

export default function update() {
  const speed = 200;
  GameState.player.setVelocity(0);

  if (GameState.cursors.left.isDown || GameState.wasd.left.isDown) GameState.player.setVelocityX(-speed);
  if (GameState.cursors.right.isDown || GameState.wasd.right.isDown) GameState.player.setVelocityX(speed);
  if (GameState.cursors.up.isDown || GameState.wasd.up.isDown) GameState.player.setVelocityY(-speed);
  if (GameState.cursors.down.isDown || GameState.wasd.down.isDown) GameState.player.setVelocityY(speed);

  // Update trail history
  if (GameState.player.body.velocity.x || GameState.player.body.velocity.y) {
    GameState.trailHistory.unshift({ x: GameState.player.x, y: GameState.player.y });
    if (GameState.trailHistory.length > GameState.camels.length * GameState.trailSpacing + 1) {
        GameState.trailHistory.pop();
    }
}

  spawnEnemies(this);
  moveEnemies(this);
  updateCamels(this);
  handleProjectiles();
}
