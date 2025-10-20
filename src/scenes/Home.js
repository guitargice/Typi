export class Home extends Phaser.Scene {

    constructor() {
        super('Home');
        
        // Activity definitions
        this.activities = [
            { key: 'Practice', name: 'Practice', scene: 'Practice' },
            { key: 'Sentences', name: 'Sentences', scene: 'Sentences' }
        ];
    }

    create() {
        // Activity boxes (reset each time)
        this.activityBoxes = [];
        // Title
        this.add.text(640, 80, 'Typi - Typing Tutor', {
            fontSize: '56px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(640, 150, 'Choose an activity', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Create activity boxes
        this.createActivityBoxes();
    }

    createActivityBoxes() {
        const boxWidth = 180;
        const boxHeight = 180;
        const spacing = 40;
        const maxPerRow = 6;
        const startY = 300;

        const numActivities = this.activities.length;
        const totalWidth = numActivities * boxWidth + (numActivities - 1) * spacing;
        const startX = 640 - totalWidth / 2 + boxWidth / 2;

        this.activities.forEach((activity, index) => {
            const row = Math.floor(index / maxPerRow);
            const col = index % maxPerRow;
            const itemsInRow = Math.min(numActivities - row * maxPerRow, maxPerRow);
            const rowWidth = itemsInRow * boxWidth + (itemsInRow - 1) * spacing;
            const rowStartX = 640 - rowWidth / 2 + boxWidth / 2;

            const x = rowStartX + col * (boxWidth + spacing);
            const y = startY + row * (boxHeight + spacing);

            // Create activity box container
            const container = this.add.container(x, y);

            // Background box (black with outline)
            const box = this.add.rectangle(0, 0, boxWidth, boxHeight, 0x000000);
            box.setStrokeStyle(3, 0x4a4a8a);

            // Activity name text
            const nameText = this.add.text(0, 70, activity.name, {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            container.add([box, nameText]);

            // Make interactive
            box.setInteractive({ useHandCursor: true });

            // Hover effects
            box.on('pointerover', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
                box.setStrokeStyle(3, 0x6a6aff);
            });

            box.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 200,
                    ease: 'Power2'
                });
                box.setStrokeStyle(3, 0x4a4a8a);
            });

            // Click handler
            box.on('pointerdown', () => {
                this.handleActivityClick(activity, container);
            });

            this.activityBoxes.push({ container, box, activity });
        });
    }

    handleActivityClick(activity, container) {
        // Create star burst effect
        this.createStarBurst(container.x, container.y);

        // Disable all interactions
        this.activityBoxes.forEach(item => {
            item.box.disableInteractive();
        });

        // Scale animation
        this.tweens.add({
            targets: container,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                // Transition to the activity scene
                this.scene.start(activity.scene);
            }
        });
    }

    createStarBurst(x, y) {
        const numStars = 12;
        const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x88ff00];

        for (let i = 0; i < numStars; i++) {
            const angle = (i / numStars) * Math.PI * 2;
            const distance = 80;
            
            // Create star
            const star = this.add.star(x, y, 5, 8, 16, colors[i % colors.length]);
            
            // Animate outward
            this.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 600,
                ease: 'Power2',
                onComplete: () => {
                    star.destroy();
                }
            });

            // Rotate the star
            this.tweens.add({
                targets: star,
                angle: 360,
                duration: 600,
                ease: 'Linear'
            });
        }
    }
}

