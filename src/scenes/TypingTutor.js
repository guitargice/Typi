export class TypingTutor extends Phaser.Scene {

    constructor() {
        super('TypingTutor');
        
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
        
        // Key objects for visual representation
        this.keyObjects = {};
        
        // Current target key
        this.targetKey = null;
        
        // Score tracking
        this.correctCount = 0;
        this.incorrectCount = 0;
    }

    create() {
        // Title
        this.add.text(640, 50, 'Typing Tutor', {
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

        // Draw the keyboard
        this.drawKeyboard();

        // Set up keyboard input for ALL keys
        this.input.keyboard.on('keydown', this.handleKeyPress, this);

        // Choose the first target key
        this.chooseNewTargetKey();
    }

    drawKeyboard() {
        const startX = 250;
        const startY = 350;
        const keyWidth = 60;
        const keyHeight = 60;
        const keySpacing = 10;

        // Define row offsets for proper QWERTY alignment
        const rowOffsets = [
            0,                              // Row 0 (numbers): no offset
            (keyWidth + keySpacing) ,       // Row 1 (QWERTY): offset right by full key
            (keyWidth + keySpacing) * 0.75, // Row 2 (ASDFGH): offset right by 0.75 key
            (keyWidth + keySpacing) * 0.75, // Row 3 (ZXCVBN): offset right by 0.75 key
            (keyWidth + keySpacing) * 0.55  // Row 4 (SPACE): no offset
        ];

        // Draw each row of the keyboard
        this.keyboardLayout.forEach((row, rowIndex) => {
            let rowWidth = row.length * (keyWidth + keySpacing);
            let rowStartX = startX + (this.keyboardLayout[0].length * (keyWidth + keySpacing) - rowWidth) / 2 + rowOffsets[rowIndex];

            row.forEach((key, keyIndex) => {
                let currentKeyWidth = keyWidth;
                let currentKeyHeight = keyHeight;
                
                // Make SPACE key wider
                if (key === 'SPACE') {
                    currentKeyWidth = keyWidth * 6; // 6 times wider
                }

                const x = rowStartX + keyIndex * (currentKeyWidth + keySpacing);
                const y = startY + rowIndex * (keyHeight + keySpacing);

                // Create key container
                const keyContainer = this.add.container(x, y);

                // Key background (rectangle)
                const keyBg = this.add.rectangle(0, 0, currentKeyWidth, currentKeyHeight, 0x2c2c54);
                keyBg.setStrokeStyle(2, 0x4a4a8a);

                // Key text
                const keyText = this.add.text(0, 0, key, {
                    fontSize: key === 'SPACE' ? '18px' : '24px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                keyContainer.add([keyBg, keyText]);

                // Store reference to key objects
                this.keyObjects[key] = {
                    container: keyContainer,
                    background: keyBg,
                    text: keyText,
                    defaultColor: 0x2c2c54,
                    x: x,
                    y: y
                };
            });
        });
    }

    chooseNewTargetKey() {
        // Choose a random key from available keys
        const randomIndex = Phaser.Math.Between(0, this.availableKeys.length - 1);
        this.targetKey = this.availableKeys[randomIndex];

        // Update prompt text
        this.promptText.setText(`Press: ${this.targetKey}`);

        // Highlight the target key
        this.highlightTargetKey(this.targetKey);
    }

    highlightTargetKey(key) {
        // Reset all keys to default color first
        Object.values(this.keyObjects).forEach(keyObj => {
            keyObj.background.setFillStyle(keyObj.defaultColor);
        });

        // Highlight the target key with a subtle glow
        if (this.keyObjects[key]) {
            this.keyObjects[key].background.setFillStyle(0x4a4a8a);
            
            // Add a pulsing animation to the target key
            this.tweens.add({
                targets: this.keyObjects[key].background,
                alpha: 0.6,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
    }

    handleKeyPress(event) {
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

        // Flash the key green
        this.flashKey(key, 0x4CAF50, () => {
            // After flash, choose a new target key
            this.chooseNewTargetKey();
        });
    }

    handleIncorrectKey(key) {
        this.incorrectCount++;
        this.updateScoreDisplay();

        // Flash the key red
        this.flashKey(key, 0xF44336);
    }

    flashKey(key, color, onComplete = null) {
        if (!this.keyObjects[key]) return;

        const keyObj = this.keyObjects[key];

        // Stop any existing tweens on this key
        this.tweens.killTweensOf(keyObj.background);

        // Flash the key with the specified color
        keyObj.background.setFillStyle(color);

        // Scale animation for emphasis
        this.tweens.add({
            targets: keyObj.container,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                // Reset to default color after flash
                keyObj.background.setFillStyle(keyObj.defaultColor);
                
                if (onComplete) {
                    onComplete();
                }
            }
        });
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


