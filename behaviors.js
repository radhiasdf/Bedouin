import { createDustEffect } from './effects/createDustEffect.js';
import { ignite } from './effects/ignite.js';

const MIRAGE_SCALE = 0.2;

export const allUpgrades = [
    {
        name: "Cactus",
        icon: "cactus",
        desc: "Hurts nearby enemies on contact.",
        behavior: (scene, camel) => {
            const spikeRadius = 30;
            const spikeCount = 7;
    
            // === DAMAGE LOGIC ===
            scene.enemies.getChildren().forEach(enemy => {
                if (Phaser.Math.Distance.Between(camel.x, camel.y, enemy.x, enemy.y) < spikeRadius) {
                    scene.applyDamage(enemy, 3);
                }
            });
    
            // === INITIALIZE STATIC SPIKES ===
            if (!camel.staticSpikes) {
                camel.staticSpikes = [];
    
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (Math.PI * 2 * i) / spikeCount;
    
                    const spike = scene.add.image(0, 0, 'cactus')
                        .setScale(0.05)
                        .setDepth(-1);
    
                    spike._angle = angle;
                    camel.staticSpikes.push(spike);
                }
            }
    
            // === UPDATE SPIKE POSITIONS ===
            camel.staticSpikes.forEach(spike => {
                const angle = spike._angle;
                const x = camel.x + Math.cos(angle) * spikeRadius;
                const y = camel.y + Math.sin(angle) * spikeRadius;
    
                spike.setPosition(x, y);
                spike.setRotation(angle + Math.PI / 2); // make cactus face outward
            });
        }
    },
    {
        name: "Ground Pound",
        icon: "groundpound",
        desc: "Character bounces violently.",
        applyOnce: (scene, camel) => {
            camel.bouncePower = 10 + Math.random(); // Strong bounce
            camel._justLanded = false;              // Internal flag
        },
        behavior: (scene, camel) => {
            // Detect if camel just landed
            if (!camel._wasOnGround && camel.y >= camel.groundY) {
                // Landed now
                camel._wasOnGround = true;
    
                createDustEffect(scene, camel.x, camel.groundY, {
                    radius: 30,
                    numPuffs: 20,
                    duration: 400,
                    lineWidth: 3
                });
            } else if (camel.y < camel.groundY - 2) {
                camel._wasOnGround = false; // In the air
            }
        }
    },
    {
        name: "Splashing Oil",
        icon: "oil",
        desc: "Camel leaves a trail of oil.",
    
        applyOnce: (scene, camel) => {
            camel._oilTimer = 0;
        },
    
        behavior: (scene, camel) => {
            // Skip if not tagged
            //if (!camel.tags?.includes('oil')) return;
    
            const delta = scene.game.loop.delta;
            camel._oilTimer += delta;
    
            // Only splash if moving vertically (bouncing or falling)
            //const isMoving = Math.abs(camel.body.velocity.y) > 30;
    
            if (camel._oilTimer > 500) {
                camel._oilTimer = 0;
    
                // Create oil splatter manually (no particles)
                const splatterGroup = scene.add.group();
                const centerX = camel.x;
                const centerY = camel.y;
                const baseColor = 0x000000;
                const lifetime = 10200;

                // === Center blob ===
                const radius = 20;
                const center = scene.add.circle(centerX, centerY, radius, baseColor, 1).setDepth(-15);
                splatterGroup.add(center);

                // === Add invisible oil zone (used for fire/friction detection) ===
                const oilZone = scene.add.circle(centerX, centerY, radius).setVisible(false);
                scene.physics.add.existing(oilZone);
                oilZone.body.setAllowGravity(false).setImmovable(true);
                oilZone.tags = ['oil', 'flammable']; // important
                if (!scene.oilZones) scene.oilZones = scene.add.group();
                scene.oilZones.add(oilZone);

                // Destroy oil zone after duration
                scene.time.delayedCall(lifetime, () => oilZone.destroy());


                // === Medium blobs around center ===
                for (let i = 0; i < 4; i++) {
                    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                    const distance = Phaser.Math.Between(10, 25);
                    const x = centerX + Math.cos(angle) * distance;
                    const y = centerY + Math.sin(angle) * distance;
                    const blob = scene.add.circle(x, y, 10, baseColor, 1).setDepth(-15);
                    splatterGroup.add(blob);
                }

                // === Fade + destroy all splatter blobs ===
                splatterGroup.getChildren().forEach(blob => {
                    scene.tweens.add({
                        targets: blob,
                        alpha: 0,
                        duration: lifetime,
                        onComplete: () => blob.destroy()
                    });
                });

            }
        }
    }, 
    {
        name: "Ignition",
        icon: "fire",
        desc: "This camel burns everything it touches. Projectiles are fiery too.",
    
        applyOnce: (scene, camel) => {
            if (!camel.tags) camel.tags = [];
            camel.tags.push("fire");
    
            // Optional visual (small flame)
            camel._fireGlow = scene.add.circle(0, 0, 10, 0xff3300, 0.5).setDepth(1);
            camel._fireGlow.setBlendMode('ADD');
            camel._fireGlow.setOrigin(0.5);
    
            // Attach to camel
            camel.on('destroy', () => camel._fireGlow?.destroy());
    
            camel.update = (camel.update || (() => {})); // patch if not defined
            const oldUpdate = camel.update.bind(camel);
    
            camel.update = function () {
                oldUpdate();
                if (this._fireGlow) {
                    this._fireGlow.x = this.x;
                    this._fireGlow.y = this.y - 20;
                }
            };
        },
    
        behavior: (scene, camel) => {
            // Ignite nearby flammable objects (bushes, tents, oil, etc.)
            const radius = 40;
    
            const flammables = [
                ...(scene.oilZones?.getChildren() || []),
                ...(scene.bushes?.getChildren() || []),
                ...(scene.tents?.getChildren() || [])
            ];
    
            flammables.forEach(obj => {
                if (obj.tags?.includes('flammable') && !obj.tags.includes('burning')) {
                    const dist = Phaser.Math.Distance.Between(camel.x, camel.y, obj.x, obj.y);
                    if (dist < radius) ignite(scene, obj);
                }
            });
    
            // Optionally mark projectiles from this camel as fire projectiles
            // Only if you're spawning projectiles from camels manually
            // Just make sure to add `projectile.tags = ['fire']` when they’re created
        }
    },    
    {
        name: "Thorns",
        icon: "bush",
        desc: "Throws thorns that damages in an area.",
        behavior: (scene, camel) => {
            if (!camel.thornsCooldown || scene.time.now - camel.thornsCooldown > 5000) {
                const target = scene.enemies.getFirstAlive();
                if (target) {
                    const spikes = [];
                    let radius = 50;
                    let trueHitRadius = radius;
                    let count = 10;
    
                    for (let i = 0; i < count; i++) {
                        const angle = (2 * Math.PI / count) * i;
                        const x = target.x + radius * Math.cos(angle);
                        const y = target.y + radius * Math.sin(angle);
    
                        const spike = scene.add.image(x, y + 20, 'bush') // start slightly below
                            .setScale(0.1)
                            .setAlpha(0);
    
                        scene.tweens.add({
                            targets: spike,
                            y: y, // move up to surface
                            alpha: 1,
                            duration: 150,
                            delay: i * 30,
                            onComplete: () => {
                                spikes.push(spike);
                            }
                        });

                        trueHitRadius = radius + spike.displayWidth / 2; // Accurate range
                    }
    
                    // Damage enemies in the area
                    scene.enemies.getChildren().forEach(enemy => {
                        if (!enemy.active) return;

                        const dist = Phaser.Math.Distance.Between(target.x, target.y, enemy.x, enemy.y);

                        if (dist < trueHitRadius) {
                            // Damage every 0.5s per enemy
                            if (!enemy.lastThornHit || scene.time.now - enemy.lastThornHit > damageInterval) {
                                enemy.lastThornHit = scene.time.now;
                                scene.applyDamage(enemy, 5);
                            }
                        }
                    });
                    
    
                    // Clean up
                    scene.time.delayedCall(1000, () => {
                        spikes.forEach(spike => spike.destroy());
                    });
                }
    
                camel.thornsCooldown = scene.time.now;
            }
        }
    },
    {
        name: "Spear",
        icon: "spear",
        desc: "Shoots forward, passes through enemies.",
        behavior: (scene, camel) => {
            if (!camel.spearCooldown || scene.time.now - camel.spearCooldown > 2000) {
                const proj = scene.projectiles.create(camel.x, camel.y, 'arrow').setScale(0.03);
                proj.setVelocityX(300);
                scene.time.delayedCall(3000, () => proj.destroy());
                camel.spearCooldown = scene.time.now;
            }
        }
    },
    {
        name: "Arrow",
        icon: "arrow",
        desc: "Shoots left and right.",
        behavior: (scene, camel) => {
            if (!camel.arrowCooldown || scene.time.now - camel.arrowCooldown > 2000) {
                const left = scene.projectiles.create(camel.x, camel.y, 'arrow').setScale(0.03);
                const right = scene.projectiles.create(camel.x, camel.y, 'arrow').setScale(0.03);
                left.setVelocityX(-300);
                left.setFlipX(true);
                right.setVelocityX(300);
                scene.time.delayedCall(3000, () => left.destroy());
                scene.time.delayedCall(3000, () => right.destroy());
                camel.arrowCooldown = scene.time.now;
            }
        }
    },
    {
        name: "Stone",
icon: "stone",
desc: "Throws a heavy stone in a parabolic arc.",
behavior: (scene, camel) => {
    if (!camel.stoneCooldown || scene.time.now - camel.stoneCooldown > 2000) {

        // Create the stone using a plain image
        const proj = scene.add.image(camel.x, camel.y - 10, 'stone')
            .setScale(0.03)
            .setDepth(1);

        // Custom projectile physics
        proj.vx = -3 + Math.random() * 6; // throw left
        proj.vy = -8 - Math.random() * 4;  // upward burst
        proj.gravity = 0.3;
        proj.groundY = camel.y + 30;

        // Add to projectiles list if needed
        scene.projectiles.add(proj);

        // Update loop for projectile
        proj.update = () => {
            proj.vy += proj.gravity;
            proj.y += proj.vy;
            proj.x += proj.vx;

            if (proj.y >= proj.groundY) {
                proj.y = proj.groundY;

                // Optional: bounce once or just land
                proj.vy = 0;
                proj.vx = 0;

                // Optional: squash animation or dust FX
                scene.time.delayedCall(300, () => {
                    proj.destroy();
                });

                // Stop updating it further
                scene.events.off('update', proj.update, proj);
            }
        };

        // Add to update loop
        scene.events.on('update', proj.update, proj);

        camel.stoneCooldown = scene.time.now;
    }
}

    },
    {
        name: "Mirage Clone",
        icon: "mirage",
        desc: "Creates a clone that distracts enemies.",
        behavior: (scene, camel) => {
            if (!camel.mirageCooldown || scene.time.now - camel.mirageCooldown > 5000) {
                const clone = scene.add.image(camel.x + 50, camel.y, camel.image)
                    .setAlpha(0)
                    .setScale(0.2)
                    .setDepth(-10);
        
                // Use generated Perlin texture as mask
                const maskImage = scene.add.image(clone.x, clone.y, 'perlinMask')
                    .setScale(1.5)
                    .setVisible(false);
        
                const mask = maskImage.createBitmapMask();
                clone.setMask(mask);
        
                // Animate mask to create distortion illusion
                scene.tweens.add({
                    targets: maskImage,
                    x: maskImage.x + 20,
                    y: maskImage.y + 10,
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
        
                // Fade in clone
                scene.tweens.add({
                    targets: clone,
                    alpha: 0.5,
                    duration: 500,
                    ease: 'Sine.easeOut'
                });
        
                scene.currentMirage = clone;
                scene.mirageExpiresAt = scene.time.now + 3000;
        
                scene.time.delayedCall(3000, () => {
                    scene.tweens.add({
                        targets: clone,
                        alpha: 0,
                        duration: 600,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            clone.destroy();
                            maskImage.destroy();
                            scene.currentMirage = null;
                        }
                    });
                });
        
                camel.mirageCooldown = scene.time.now;
            }
        }
        
    }
    
];

export const followTarget = {
    name: "Follow Target",
    icon: "follow",
    desc: "Moves toward a specified target every frame.",
    behavior: (scene, entity) => {
        

        if (!entity.getTarget) return;

        const target = entity.getTarget(scene);
        console.log("1 succeded");

        if (!target) return;
        console.log("2 succeded");


        const speed = entity.followSpeed || 60;

        // ✅ Use Arcade Physics move
        scene.physics.moveToObject(entity, target, speed);
        console.log("3 succeded");
    }
};

export const slipperyMovement = {
    name: "Slippery Movement",
    desc: "Acceleration-based movement with terrain-based friction.",

    behavior: (scene, entity) => {
        if (!entity.body) return;

        const acc = 600; // acceleration per second
        const maxSpeed = 150;

        let ax = 0;
        let ay = 0;

        // Handle input
        if (scene.cursors.left.isDown || scene.wasd.left.isDown) ax = -acc;
        if (scene.cursors.right.isDown || scene.wasd.right.isDown) ax = acc;
        if (scene.cursors.up.isDown || scene.wasd.up.isDown) ay = -acc;
        if (scene.cursors.down.isDown || scene.wasd.down.isDown) ay = acc;

        // Apply acceleration
        entity.body.velocity.x += ax * scene.game.loop.delta / 1000;
        entity.body.velocity.y += ay * scene.game.loop.delta / 1000;

        // Cap speed
        const speed = Math.sqrt(entity.body.velocity.x ** 2 + entity.body.velocity.y ** 2);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            entity.body.velocity.x *= scale;
            entity.body.velocity.y *= scale;
        }

        // === Friction (based on ground type) ===
        const groundFriction = getFrictionUnder(entity, scene);

        entity.body.velocity.x *= groundFriction;
        entity.body.velocity.y *= groundFriction;

        // Optional: Flip sprite based on direction
        if (entity.body.velocity.x !== 0) entity.setFlipX(entity.body.velocity.x < 0);
    }
};

// Helper: check if standing on oil or sand
function getFrictionUnder(entity, scene) {
    let friction = 0.85; // default (sand)

    const zones = [
        ...(scene.oilZones?.getChildren() || []),
        ...(scene.sandZones?.getChildren() || []) // optional: allow explicit sand
    ];

    for (let zone of zones) {
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, zone.x, zone.y);
        if (dist < (zone.radius || 30)) {
            if (zone.tags?.includes('oil')) return 0.96;
            if (zone.tags?.includes('sand')) return 0.75;
        }
    }

    return friction;
}
