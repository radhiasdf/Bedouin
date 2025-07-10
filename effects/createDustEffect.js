// effects/createDustEffect.js
export function createDustEffect(scene, x, y, options = {}) {
    const numPuffs = options.numPuffs || 16;
    const radius = options.radius || 40 + Math.random() * 10;
    const color = options.color || 0x7a5e3a;
    const duration = options.duration || 300;
    const lineWidth = options.lineWidth || 2;

    const dust = scene.add.graphics();
    dust.setDepth(options.depth || 1);

    const puffData = [];

    for (let i = 0; i < numPuffs; i++) {
        const angle = (Math.PI * 2 * i) / numPuffs + Math.random() * 0.3;
        puffData.push({
            x1: x,
            y1: y,
            x2: x + Math.cos(angle) * radius,
            y2: y + Math.sin(angle) * radius,
            alpha: 1
        });
    }

    const startTime = scene.time.now;

    scene.events.on('update', function dustUpdate() {
        const elapsed = scene.time.now - startTime;
        const t = Phaser.Math.Clamp(elapsed / duration, 0, 1);
        dust.clear();
        dust.lineStyle(lineWidth, color, 1 - t);

        puffData.forEach(puff => {
            const midX = Phaser.Math.Interpolation.Linear([puff.x1, puff.x2], t);
            const midY = Phaser.Math.Interpolation.Linear([puff.y1, puff.y2], t);
            dust.fillStyle(color, 1 - t);
            dust.fillCircle(midX, midY, 3 * (1 - t));  // shrinking puff circle

        });

        if (t === 1) {
            dust.destroy();
            scene.events.off('update', dustUpdate);
        }
    });
}
