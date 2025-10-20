import { KeyboardDisplay } from '../components/KeyboardDisplay.js';

export class Practice extends Phaser.Scene {

    constructor() {
        super('Practice');
        
        // Keyboard layout - standard QWERTY layout
        this.keyboardLayout = [
            ['`','1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
            ['SPACE']
        ];
        
        // All available keys for practice
        this.availableKeys = this.keyboardLayout.flat();
        
        // Current target key
        this.targetKey = null;
        
        // Score tracking
        this.correctCount = 0;
        this.incorrectCount = 0;
        
        // Dialog state
        this.dialogOpen = false;
        
        // Keyboard display
        this.keyboard = null;
    }

    preload() {
        // Load sound effects
        this.load.audio('typeSound', 'assets/sounds/type.wav');
        this.load.audio('spaceSound', 'assets/sounds/space.wav');
        this.load.audio('whoopsieSound', 'assets/sounds/whoopsie.wav');
        this.load.text('keyboardSvgRaw', 'assets/images/keyboard.svg');
    }

    create() {
        // Back button
        this.createBackButton();

        // Title
        this.add.text(640, 50, 'Practice', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(640, 120, 'Press the highlighted key on your keyboard', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Score display
        this.scoreText = this.add.text(640, 170, 'Correct: 0 | Incorrect: 0', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Prompt text
        this.promptText = this.add.text(640, 250, '', {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create keyboard display
        this.keyboard = new KeyboardDisplay(this, 250, 350);

        // Set up keyboard input for ALL keys (remove first to prevent duplicates)
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
        this.input.keyboard.on('keydown', this.handleKeyPress, this);

        this.mountOverlaySvg();
        
        // Choose the first target key
        this.chooseNewTargetKey();
    }

    
    showFinger(finger) {
        const el = this.overlaySvg.getElementById(finger);
        if (el) el.style.display = 'block';
    }

    hideFinger(finger) {
        const el = this.overlaySvg.getElementById(finger);
        if (el) el.style.display = 'none';
    }

    // >>> Mount the SVG in the overlay div
    mountOverlaySvg() {
        this.overlayEl = document.getElementById('keyboard-overlay');
        if (!this.overlayEl) return;

        const svgText = this.cache.text.get('keyboardSvgRaw');
        this.overlayEl.innerHTML = svgText;

        // Grab the <svg> element we just inserted
        this.overlaySvg = this.overlayEl.querySelector('svg');

        // hide left-neutral path in the svg
        const leftNeutral = this.overlaySvg.getElementById('neutral-left');
        if (leftNeutral) leftNeutral.style.display = 'none';
    }

    shutdown() {
        // Clean up keyboard listener when scene shuts down
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
    }

    createBackButton() {
        // Back button container
        const backButton = this.add.container(80, 30);

        // Button background
        const buttonBg = this.add.rectangle(0, 0, 120, 40, 0x4a4a8a);
        buttonBg.setStrokeStyle(2, 0x6a6aff);

        // Button text
        const buttonText = this.add.text(0, 0, '← Back', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        backButton.add([buttonBg, buttonText]);

        // Make interactive
        buttonBg.setInteractive({ useHandCursor: true });

        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x6a6aff);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4a4a8a);
        });

        buttonBg.on('pointerdown', () => {
            this.showConfirmDialog();
        });
    }

    showConfirmDialog() {
        if (this.dialogOpen) return;
        this.dialogOpen = true;

        // Keyboard input is disabled via dialogOpen flag check in handleKeyPress

        // Semi-transparent overlay
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        overlay.setDepth(1000);

        // Dialog box
        const dialogBox = this.add.rectangle(640, 360, 500, 250, 0x2c2c54);
        dialogBox.setStrokeStyle(3, 0x4a4a8a);
        dialogBox.setDepth(1001);

        // Dialog title
        const dialogTitle = this.add.text(640, 280, 'Confirm Exit', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1002);

        // Dialog message
        const dialogMessage = this.add.text(640, 340, 'Are you sure you want to go back?\nYour progress will be lost.', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(1002);

        // Yes button
        const yesButton = this.add.container(560, 420).setDepth(1003);
        const yesBg = this.add.rectangle(0, 0, 120, 45, 0xF44336);
        yesBg.setStrokeStyle(2, 0xff6659);
        const yesText = this.add.text(0, 0, 'Yes', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        yesButton.add([yesBg, yesText]);

        yesBg.setInteractive({ useHandCursor: true });
        yesBg.on('pointerover', () => yesBg.setFillStyle(0xff6659));
        yesBg.on('pointerout', () => yesBg.setFillStyle(0xF44336));
        yesBg.on('pointerdown', () => {
            this.scene.start('Home');
        });

        // No button
        const noButton = this.add.container(720, 420).setDepth(1003);
        const noBg = this.add.rectangle(0, 0, 120, 45, 0x4CAF50);
        noBg.setStrokeStyle(2, 0x6fd36f);
        const noText = this.add.text(0, 0, 'No', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        noButton.add([noBg, noText]);

        noBg.setInteractive({ useHandCursor: true });
        noBg.on('pointerover', () => noBg.setFillStyle(0x6fd36f));
        noBg.on('pointerout', () => noBg.setFillStyle(0x4CAF50));
        noBg.on('pointerdown', () => {
            // Close dialog
            overlay.destroy();
            dialogBox.destroy();
            dialogTitle.destroy();
            dialogMessage.destroy();
            yesButton.destroy();
            noButton.destroy();
            this.dialogOpen = false;
            
            // Re-enable keyboard input (already attached, just update state)
            // Note: listener is not removed when dialog opens, just ignored via dialogOpen flag
        });
    }

    chooseNewTargetKey() {
        // Choose a random key from available keys
        const randomIndex = Phaser.Math.Between(0, this.availableKeys.length - 1);
        this.targetKey = this.availableKeys[randomIndex];

        // Update prompt text
        this.promptText.setText(`Press: ${this.targetKey}`);

        // Highlight the target key on keyboard
        this.keyboard.highlightKey(this.targetKey);

        this.showFinger(this.targetKey.toLowerCase().replace(' ', ''));
    }

    handleKeyPress(event) {
        if (this.dialogOpen) return;

        // Get the pressed key
        let pressedKey = event.key;
        
        // Map space bar to 'SPACE'
        if (pressedKey === ' ') {
            pressedKey = 'SPACE';
        } else {
            pressedKey = pressedKey.toUpperCase();
        }

        // Only process if it's one of our keyboard keys
        if (!this.availableKeys.includes(pressedKey)) {
            return;
        }

        // Check if it's the correct key
        if (pressedKey === this.targetKey) {
            this.handleCorrectKey(pressedKey);
        } else {
            this.handleIncorrectKey(pressedKey);
        }
    }

    handleCorrectKey(key) {
        this.correctCount++;
        this.updateScoreDisplay();

        // Play appropriate sound
        if (key === 'SPACE') {
            this.sound.play('spaceSound');
        } else {
            this.sound.play('typeSound');
        }

        // Flash the key green
        this.keyboard.flashKey(key, 0x4CAF50);
        
        // Immediately choose a new target key
        this.chooseNewTargetKey();
    }

    handleIncorrectKey(key) {
        this.incorrectCount++;
        this.updateScoreDisplay();

        // Play appropriate sounds
        if (key === 'SPACE') {
            this.sound.play('spaceSound');
        } else {
            this.sound.play('typeSound');
        }
        // Play whoopsie sound for incorrect key
        this.sound.play('whoopsieSound');

        // Flash the key red
        this.keyboard.flashKey(key, 0xF44336);
    }

    updateScoreDisplay() {
        this.scoreText.setText(`Correct: ${this.correctCount} | Incorrect: ${this.incorrectCount}`);
        
        // Calculate and display accuracy
        const total = this.correctCount + this.incorrectCount;
        if (total > 0) {
            const accuracy = ((this.correctCount / total) * 100).toFixed(1);
            this.scoreText.setText(`Correct: ${this.correctCount} | Incorrect: ${this.incorrectCount} | Accuracy: ${accuracy}%`);
        }
    }
}

