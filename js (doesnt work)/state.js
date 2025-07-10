export const GameState = {
    playerHealth: 5,
    player: null,
    cursors: null,
    wasd: null,
    eKey: null,
    tents: null,
    bushes: null,
    enemies: null,
    projectiles: null,
    camels: [],
    trailHistory: [],
    trailSpacing: 20,
    healthText: null,
  
    reset() {
      this.playerHealth = 5;
      this.camels.length = 0;
      this.trailHistory.length = 0;
    }
  };
  