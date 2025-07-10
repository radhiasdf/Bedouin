import { GameState } from './state.js';

export function handleProjectiles() {
  GameState.projectiles.getChildren().forEach(proj => {
    if (!proj.active || !proj.target) return;

    const dist = Phaser.Math.Distance.Between(proj.x, proj.y, proj.target.x, proj.target.y);
    if (dist < 20) {
      proj.destroy();
      proj.target.health--;
      if (proj.target.health <= 0) {
        proj.target.destroy();
      }
    }
  });
}
