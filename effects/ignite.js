export function ignite(scene, target) {
    if (target.tags?.includes('burning')) return;

    target.tags.push('burning');
    if (typeof target.setTint === 'function') {
        target.setTint(0xff6600);
    }


    // Optional: fire visual effect
    const flame = scene.add.circle(target.x, target.y, 12, 0xff5500, 0.4).setDepth(-10);
    flame.setBlendMode('ADD');

    scene.tweens.add({
        targets: flame,
        alpha: 0,
        scale: 2,
        duration: 800,
        onComplete: () => flame.destroy()
    });

    // Fire duration
    scene.time.delayedCall(3000, () => {
        target.tags = target.tags.filter(t => t !== 'burning');
        if (typeof target.setTint === 'function') {
            target.clearTint();
        }
    });

    // Spread to nearby flammable objects
    const spreadTargets = [
        ...(scene.oilZones?.getChildren() || []),
        ...(scene.bushes?.getChildren() || []),
        ...(scene.tents?.getChildren() || [])
    ];

    spreadTargets.forEach(obj => {
        if (obj !== target && obj.tags?.includes('flammable') && !obj.tags.includes('burning')) {
            const dist = Phaser.Math.Distance.Between(target.x, target.y, obj.x, obj.y);
            if (dist < 60) {
                scene.time.delayedCall(500, () => ignite(scene, obj));
            }
        }
    });
}
