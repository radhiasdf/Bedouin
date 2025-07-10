import preload from './preload.js';
import create from './create.js';
import update from './update.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: { preload, create, update }
};

new Phaser.Game(config);
