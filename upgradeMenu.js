// upgradeMenu.js
export function showUpgradeMenu(scene, config, player, camels, allUpgrades) {
    let selectedUpgrade = null;
    let selectedCamel = null;
    let upgradeMenu;
    let upgradeOptions = [];

    scene.physics.pause();
    scene.updatePaused = true;

    upgradeMenu = scene.add.container(config.width / 2, config.height / 2).setDepth(2);

    const memberOptions = [player, ...camels.filter(c => c.tamed)];

    // === Layout Config =======================
    const UI_WIDTH = 640;
    const UI_HEIGHT = 500;
    const TITLE_FONT = '20px';
    const BODY_FONT = '16px';
    const FONT_FAMILY = 'Fredoka';

    const TITLE_Y = -220;
    const MEMBER_Y = -90;
    const TARGET_SCALE = 0.13;
    const MEMBER_SPACING = 100;
    const FIRST_MEMBER_X = -220;

    const CARD_WIDTH = 160;
    const CARD_HEIGHT = 180;
    const CARD_ICON_SIZE = 60;
    const CARD_SPACING = 200;
    const FIRST_CARD_X = -200;
    const CARD_Y = 70;

    const CONFIRM_Y = 210;
    // ========================================

    const bg = scene.add.rectangle(0, 0, UI_WIDTH, UI_HEIGHT, 0xfefefe)
        .setStrokeStyle(2, 0x000000)
        .setScrollFactor(0);
    upgradeMenu.add(bg);

    const title = scene.add.text(0, TITLE_Y, "Level up! Choose member and upgrade.", {
        fontSize: TITLE_FONT,
        fontFamily: FONT_FAMILY,
        fill: '#000'
    }).setOrigin(0.5).setScrollFactor(0);
    upgradeMenu.add(title);

    // === Camel Icons =========================
    const memberIcons = [];
    let memberX = FIRST_MEMBER_X;
    memberOptions.forEach((member) => {
        if (!member.tamed) return;

        const icon = scene.add.image(memberX, MEMBER_Y, member.image)
            .setScale(TARGET_SCALE, TARGET_SCALE)
            .setScrollFactor(0)
            .setInteractive()
            .setOrigin(0.5)
            .setFlipX(true);
        icon.setScale(TARGET_SCALE, TARGET_SCALE);

        const TOOLTIP_ICON_SIZE = 35;
        const GRID_COLS = 4;
        const GRID_SPACING = 35;
        const TOOLTIP_PADDING = 10;

        icon.on('pointerdown', () => {
            selectedCamel = member;
            memberIcons.forEach(i => i.clearTint());
            icon.setTint(0x00ff00);
            updateConfirmState();
        });

        let tooltipContainer = null;

        icon.on('pointerover', () => {
            if (!member.upgrades || member.upgrades.length === 0) return;

            tooltipContainer = scene.add.container();
            const rows = Math.ceil(member.upgrades.length / GRID_COLS);
            const boxWidth = GRID_COLS * GRID_SPACING + TOOLTIP_PADDING * 2;
            const boxHeight = rows * GRID_SPACING + TOOLTIP_PADDING * 2;

            const bg = scene.add.rectangle(0, 0, boxWidth, boxHeight, 0xffffff)
                .setStrokeStyle(2, 0x000000)
                .setOrigin(0.5)
                .setScrollFactor(0);

            tooltipContainer.add(bg);

            member.upgrades.forEach((upg, idx) => {
                const gx = (idx % GRID_COLS) * GRID_SPACING - (boxWidth / 2) + TOOLTIP_PADDING + TOOLTIP_ICON_SIZE / 2;
                const gy = Math.floor(idx / GRID_COLS) * GRID_SPACING - (boxHeight / 2) + TOOLTIP_PADDING + TOOLTIP_ICON_SIZE / 2;

                const icon = scene.add.image(gx, gy, upg.icon)
                    .setDisplaySize(TOOLTIP_ICON_SIZE, TOOLTIP_ICON_SIZE)
                    .setScrollFactor(0);
                tooltipContainer.add(icon);
            });

            tooltipContainer.setPosition(icon.x, icon.y - 80);
            upgradeMenu.add(tooltipContainer);
        });

        icon.on('pointerout', () => {
            if (tooltipContainer) tooltipContainer.destroy();
        });

        memberIcons.push(icon);
        upgradeMenu.add(icon);
        memberX += MEMBER_SPACING;
    });

    // === Upgrade Cards =======================
    const cards = [];
    upgradeOptions = Phaser.Utils.Array.Shuffle(allUpgrades).slice(0, 3);
    upgradeOptions.forEach((opt, i) => {
        const cardX = FIRST_CARD_X + i * CARD_SPACING;
        const card = scene.add.container(cardX, CARD_Y);
        card.setSize(CARD_WIDTH, CARD_HEIGHT).setInteractive().setScrollFactor(0);

        const cardBg = scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0xdddddd)
            .setStrokeStyle(2, 0x000000)
            .setScrollFactor(0);

        const icon = scene.add.image(0, -50, opt.icon)
            .setDisplaySize(CARD_ICON_SIZE, CARD_ICON_SIZE)
            .setScrollFactor(0);

        const label = scene.add.text(0, 30, opt.name + "\n\n" + opt.desc, {
            fontSize: BODY_FONT,
            fontFamily: FONT_FAMILY,
            fill: '#000',
            wordWrap: { width: CARD_WIDTH - 20 },
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);

        card.add([cardBg, icon, label]);

        card.on('pointerdown', () => {
            selectedUpgrade = opt;
            cards.forEach(c => c.list[0].setFillStyle(0xdddddd));
            cardBg.setFillStyle(0xaaffaa);
            updateConfirmState();
        });

        upgradeMenu.add(card);
        cards.push(card);
    });

    // === Confirm Button ======================
    const confirmBtn = scene.add.text(0, CONFIRM_Y, "Confirm", {
        fontSize: TITLE_FONT,
        fontFamily: FONT_FAMILY,
        backgroundColor: '#444',
        color: '#fff',
        padding: { x: 20, y: 15 },
        align: 'center'
    }).setOrigin(0.5).setInteractive().setScrollFactor(0);

    confirmBtn.on('pointerdown', () => {
        if (selectedUpgrade && selectedCamel) {
            selectedCamel.upgrades ??= [];
            selectedCamel.upgrades.push(selectedUpgrade);

            if (selectedUpgrade.behavior) {
                selectedCamel.behaviors ??= [];
                selectedCamel.behaviors.push(selectedUpgrade.behavior);
            }
            if (selectedUpgrade.applyOnce) {
                selectedUpgrade.applyOnce(scene, selectedCamel);
            }

            upgradeMenu.destroy();
            scene.physics.resume();
            scene.updatePaused = false;
        }
    });

    upgradeMenu.add(confirmBtn);

    function updateConfirmState() {
        const enabled = selectedCamel && selectedUpgrade;
        confirmBtn.setAlpha(enabled ? 1 : 0.4);
        confirmBtn.disableInteractive();
        if (enabled) confirmBtn.setInteractive();
    }

    updateConfirmState(); // Initially disabled
}
