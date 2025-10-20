export class KeyboardDisplay {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Keyboard layout - standard QWERTY layout
        this.keyboardLayout = [
            ['`','1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
            ['SPACE']
        ];
        
        // Key objects for visual representation
        this.keyObjects = {};
        
        // Current highlighted key
        this.currentHighlightedKey = null;
        
        this.create();
    }
    
    create() {
        const keyWidth = 60;
        const keyHeight = 60;
        const keySpacing = 10;

        // Define row offsets for proper QWERTY alignment
        const rowOffsets = [
            0,                              // Row 0 (numbers): no offset
            (keyWidth + keySpacing),        // Row 1 (QWERTY): offset right by full key
            (keyWidth + keySpacing) * 0.75, // Row 2 (ASDFGH): offset right by 0.75 key
            (keyWidth + keySpacing) * 0.75, // Row 3 (ZXCVBN): offset right by 0.75 key
            (keyWidth + keySpacing) * 0.55  // Row 4 (SPACE): no offset
        ];

        // Draw each row of the keyboard
        this.keyboardLayout.forEach((row, rowIndex) => {
            let rowWidth = row.length * (keyWidth + keySpacing);
            let rowStartX = this.x + (this.keyboardLayout[0].length * (keyWidth + keySpacing) - rowWidth) / 2 + rowOffsets[rowIndex];

            row.forEach((key, keyIndex) => {
                let currentKeyWidth = keyWidth;
                let currentKeyHeight = keyHeight;
                
                // Make SPACE key wider
                if (key === 'SPACE') {
                    currentKeyWidth = keyWidth * 6; // 6 times wider
                }

                const x = rowStartX + keyIndex * (currentKeyWidth + keySpacing);
                const y = this.y + rowIndex * (keyHeight + keySpacing);

                // Create key container
                const keyContainer = this.scene.add.container(x, y);

                // Key background (rectangle)
                const keyBg = this.scene.add.rectangle(0, 0, currentKeyWidth, currentKeyHeight, 0x2c2c54);
                keyBg.setStrokeStyle(2, 0x4a4a8a);

                // Key text
                const keyText = this.scene.add.text(0, 0, key, {
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
    
    highlightKey(key) {
        // Reset all keys to default state first
        this.resetAllKeys();
        
        // Store current highlighted key
        this.currentHighlightedKey = key;
        
        // Convert key to match keyboard layout
        let keyToHighlight = key.toUpperCase();
        if (key === ' ') {
            keyToHighlight = 'SPACE';
        }
        
        // Highlight the target key
        if (this.keyObjects[keyToHighlight]) {
            this.keyObjects[keyToHighlight].background.setFillStyle(0x4a4a8a);
            
            // Add a pulsing animation to the target key
            this.scene.tweens.add({
                targets: this.keyObjects[keyToHighlight].background,
                alpha: 0.6,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    resetAllKeys() {
        // Stop all tweens and reset colors
        Object.values(this.keyObjects).forEach(keyObj => {
            this.scene.tweens.killTweensOf(keyObj.background);
            keyObj.background.setFillStyle(keyObj.defaultColor);
            keyObj.background.setAlpha(1);
        });
    }
    
    flashKey(key, color) {
        // Convert key to match keyboard layout
        let keyToFlash = key.toUpperCase();
        if (key === ' ') {
            keyToFlash = 'SPACE';
        }
        
        if (!this.keyObjects[keyToFlash]) return;

        const keyObj = this.keyObjects[keyToFlash];

        // Stop any existing tweens on this key
        this.scene.tweens.killTweensOf(keyObj.background);

        // Flash the key with the specified color
        keyObj.background.setFillStyle(color);

        // Scale animation for emphasis
        this.scene.tweens.add({
            targets: keyObj.container,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 50,
            yoyo: true,
            onComplete: () => {
                // Reset to default color after flash
                keyObj.background.setFillStyle(keyObj.defaultColor);
                
                // Re-highlight the current key if there is one
                if (this.currentHighlightedKey) {
                    this.highlightKey(this.currentHighlightedKey);
                }
            }
        });
    }
    
    destroy() {
        // Clean up all key objects
        Object.values(this.keyObjects).forEach(keyObj => {
            keyObj.container.destroy();
        });
        this.keyObjects = {};
    }
}

