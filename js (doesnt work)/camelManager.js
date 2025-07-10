import * as state from './state.js';

export const camels = [];

export function setupCamels(scene) {
  const positions = [[600, 300], [650, 340], [620, 380], [580, 320]];
  positions.forEach((pos, i) => {
    const camel = scene.add.image(...pos, 'camel').setDisplaySize(80, 80);
    camel.vyBounce = Phaser.Math.Between(-5, -2);
    camel.groundY = camel.y;
    camel.following = camel.tamed = false;
    camel.trailIndex = null;
    camels.push(camel);
  });
}

export function updateCamels(scene) {
  camels.forEach((camel, i) => {
    const dist = Phaser.Math.Distance.Between(state.player.x, state.player.y, camel.x, camel.y);

    if (!camel.tamed && dist < 60 && Phaser.Input.Keyboard.JustDown(state.eKey)) {
      camel.tamed = camel.following = true;
      camel.trailIndex = (i + 1) * state.trailSpacing;

      const heart = scene.add.image(camel.x, camel.y - 40, 'heart').setScale(0.5);
      scene.tweens.add({
        targets: heart,
        y: heart.y - 30,
        alpha: 0,
        duration: 800,
        onComplete: () => heart.destroy()
      });
    }

    if (camel.tamed && camel.trailIndex != null) {
      const target = state.trailHistory[camel.trailIndex];
      if (target) {
        camel.x = target.x;
        camel.groundY = target.y;
        camel.vyBounce += 0.1;
        camel.y += camel.vyBounce;
        if (camel.y > camel.groundY) {
          camel.y = camel.groundY;
          camel.vyBounce = -1 - Math.random();
        }
      }
    } else if (!camel.tamed) {
      camel.vyBounce += 0.3;
      camel.y += camel.vyBounce;
      if (camel.y > camel.groundY) {
        camel.y = camel.groundY;
        camel.vyBounce = -Math.random() * 10;
      }
    }

    // Shooting
    if (camel.tamed && Math.random() < 0.01) {
      const target = state.enemies.getFirstAlive();
      if (target) {
        const proj = state.projectiles.create(camel.x, camel.y, 'heart').setScale(0.3);
        scene.physics.moveToObject(proj, target, 300);
        proj.target = target;
      }
    }
  });
}
