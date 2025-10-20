import { KeyboardDisplay } from '../components/KeyboardDisplay.js';

export class Sentences extends Phaser.Scene {

    constructor() {
        super('Sentences');
        
        // Keyboard display
        this.keyboard = null;
        
        // Sentence pool for different difficulty levels
        this.sentencePools = {
            easy: [
                'the cat sat on the mat',
                'a dog ran in the park',
                'she has a red car',
                'he can see the sun',
                'we like to play',
                'the sky is blue today'
            ],
            medium: [
                'The quick brown fox jumps over the lazy dog.',
                'Practice makes perfect every single time.',
                'Learning to type is a valuable skill.',
                'Focus and patience lead to success.',
                'Every journey begins with a single step.'
            ],
            hard: [
                'The complexity of modern programming requires precision and attention to detail.',
                'Mastering touch typing significantly improves productivity and efficiency.',
                'Understanding keyboard layouts enhances your overall typing performance.',
                'Professional typists maintain consistent accuracy at high speeds.'
            ]
        };
        
        this.currentDifficulty = 'easy';
        this.currentSentence = '';
        this.currentIndex = 0;
        this.letterObjects = [];
        
        // Stats tracking
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.totalChars = 0;
        
        // Timer tracking (for both display and WPM calculation)
        this.timerRunning = false;
        this.currentSentenceStartTime = 0;
        this.currentElapsedTime = 0;
        this.totalElapsedTime = 0; // Cumulative time across all sentences for WPM
        
        // Dialog state
        this.dialogOpen = false;
    }

    preload() {
        // Load sound effects
        this.load.audio('typeSound', 'assets/sounds/type.wav');
        this.load.audio('spaceSound', 'assets/sounds/space.wav');
        this.load.audio('whoopsieSound', 'assets/sounds/whoopsie.wav');
    }

    create() {
        // Back button
        this.createBackButton();

        // Title
        this.add.text(640, 40, 'Type the Sentence', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Difficulty selector
        this.createDifficultySelector();

        // Stats display
        this.statsText = this.add.text(640, 140, 'WPM: 0 | Accuracy: 100%', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Timer display
        this.timerText = this.add.text(640, 180, 'Time: 0.0s', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Sentence container area
        this.sentenceContainer = this.add.container(640, 280);

        // Create keyboard display at bottom
        this.keyboard = new KeyboardDisplay(this, 180, 480);

        // Set up keyboard input (remove first to prevent duplicates)
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
        this.input.keyboard.on('keydown', this.handleKeyPress, this);

        // Start first sentence
        this.loadNewSentence();
    }

    update() {
        // Update timer display in real-time while timer is running
        if (this.timerRunning) {
            this.currentElapsedTime = (Date.now() - this.currentSentenceStartTime) / 1000;
            this.timerText.setText(`Time: ${this.currentElapsedTime.toFixed(1)}s`);
        }
    }

    shutdown() {
        // Clean up keyboard listener when scene shuts down
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
    }

    createBackButton() {
        const backButton = this.add.container(80, 30);
        const buttonBg = this.add.rectangle(0, 0, 120, 40, 0x4a4a8a);
        buttonBg.setStrokeStyle(2, 0x6a6aff);
        const buttonText = this.add.text(0, 0, '← Back', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        backButton.add([buttonBg, buttonText]);

        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x6a6aff));
        buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x4a4a8a));
        buttonBg.on('pointerdown', () => this.showConfirmDialog());
    }

    createDifficultySelector() {
        const difficulties = ['easy', 'medium', 'hard'];
        const startX = 490; // Centered so middle button is at 640
        const spacing = 150;

        this.difficultyButtons = {};

        difficulties.forEach((difficulty, index) => {
            const x = startX + index * spacing;
            const y = 90;

            const button = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, 130, 35, 0x2c2c54);
            bg.setStrokeStyle(2, difficulty === this.currentDifficulty ? 0x4CAF50 : 0x4a4a8a);

            const text = this.add.text(0, 0, difficulty.charAt(0).toUpperCase() + difficulty.slice(1), {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0.5);

            button.add([bg, text]);

            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => {
                if (this.currentDifficulty !== difficulty) {
                    bg.setFillStyle(0x3c3c64);
                }
            });
            bg.on('pointerout', () => {
                if (this.currentDifficulty !== difficulty) {
                    bg.setFillStyle(0x2c2c54);
                }
            });
            bg.on('pointerdown', () => {
                this.changeDifficulty(difficulty);
            });

            this.difficultyButtons[difficulty] = { bg, text };
        });
    }

    changeDifficulty(newDifficulty) {
        this.currentDifficulty = newDifficulty;

        // Update button styles
        Object.keys(this.difficultyButtons).forEach(diff => {
            const button = this.difficultyButtons[diff];
            button.bg.setStrokeStyle(2, diff === newDifficulty ? 0x4CAF50 : 0x4a4a8a);
        });

        // Reset stats
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.totalChars = 0;
        this.totalElapsedTime = 0;

        // Load new sentence
        this.loadNewSentence();
    }

    loadNewSentence() {
        // Pick random sentence from current difficulty
        const pool = this.sentencePools[this.currentDifficulty];
        this.currentSentence = pool[Phaser.Math.Between(0, pool.length - 1)];
        this.currentIndex = 0;

        // Reset timer for new sentence
        this.timerRunning = false;
        this.currentSentenceStartTime = 0;
        this.currentElapsedTime = 0;
        this.timerText.setText('Time: 0.0s');

        // Clear previous letters
        this.sentenceContainer.removeAll(true);
        this.letterObjects = [];

        // Calculate wrapping - max width of 1100px, 30px per char
        const maxWidth = 1100;
        const charWidth = 30;
        const charsPerLine = Math.floor(maxWidth / charWidth);
        
        // Build lines by iterating through words, keeping track of character indices
        const words = this.currentSentence.split(' ');
        const lines = [];
        let currentLine = '';
        let currentLineChars = []; // Track which sentence chars are in this line
        let skippedSpaces = []; // Track space characters at line breaks
        let charIndex = 0; // Current position in original sentence
        
        words.forEach((word, wordIdx) => {
            const needsSpace = currentLine.length > 0;
            const testLine = needsSpace ? currentLine + ' ' + word : word;
            
            if (testLine.length <= charsPerLine) {
                // Add to current line
                if (needsSpace) {
                    currentLine += ' ';
                    currentLineChars.push(charIndex); // space character
                    charIndex++;
                }
                currentLine += word;
                for (let i = 0; i < word.length; i++) {
                    currentLineChars.push(charIndex);
                    charIndex++;
                }
            } else {
                // Start new line - save current line first
                if (currentLine.length > 0) {
                    lines.push({ text: currentLine, charIndices: currentLineChars });
                }
                
                // The space character between lines should be tracked as skipped
                if (needsSpace) {
                    skippedSpaces.push({ spaceIndex: charIndex, afterLineIndex: lines.length - 1 });
                    charIndex++; // Skip the space that would have been before this word
                }
                
                // Start fresh line with this word
                currentLine = word;
                currentLineChars = [];
                for (let i = 0; i < word.length; i++) {
                    currentLineChars.push(charIndex);
                    charIndex++;
                }
            }
        });
        
        // Don't forget the last line
        if (currentLine.length > 0) {
            lines.push({ text: currentLine, charIndices: currentLineChars });
        }

        // Create character positions array indexed by sentence position
        const charPositions = new Array(this.currentSentence.length);
        
        lines.forEach((line, lineIndex) => {
            const lineWidth = line.text.length * charWidth;
            const startX = -lineWidth / 2;
            const y = (lineIndex - (lines.length - 1) / 2) * 50; // 50px spacing between lines

            // Map each character in the line to its sentence index
            line.charIndices.forEach((sentenceIdx, lineCharIdx) => {
                const x = startX + lineCharIdx * charWidth;
                charPositions[sentenceIdx] = { x, y };
            });
        });
        
        // Position skipped spaces at the end of their respective lines
        skippedSpaces.forEach(skip => {
            const line = lines[skip.afterLineIndex];
            if (line) {
                const lineWidth = line.text.length * charWidth;
                const startX = -lineWidth / 2;
                const y = (skip.afterLineIndex - (lines.length - 1) / 2) * 50;
                const x = startX + line.text.length * charWidth; // Position at end of line
                charPositions[skip.spaceIndex] = { x, y };
            }
        });

        // Now create letter objects for the entire sentence in order
        for (let i = 0; i < this.currentSentence.length; i++) {
            const char = this.currentSentence[i];
            
            // Use position from charPositions array
            const pos = charPositions[i] || { x: 0, y: 0 };

            // Background box
            const bg = this.add.rectangle(pos.x, pos.y, 28, 40, 0x2c2c54);
            bg.setStrokeStyle(2, i === 0 ? 0x4a9aff : 0x4a4a8a);

            // Letter text
            const text = this.add.text(pos.x, pos.y, char, {
                fontSize: '24px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.sentenceContainer.add([bg, text]);

            this.letterObjects.push({
                char: char,
                bg: bg,
                text: text,
                status: 'pending' // pending, correct, incorrect
            });
        }

        // Highlight first key on keyboard
        this.keyboard.highlightKey(this.currentSentence[0]);

        this.updateStats();
    }

    handleKeyPress(event) {
        if (this.dialogOpen) return;

        let pressedKey = event.key;

        // Handle special case for space
        if (pressedKey === ' ') {
            // Space is treated normally
        } else if (pressedKey.length !== 1) {
            // Ignore special keys
            return;
        }

        // Start timer on first keypress
        if (this.currentIndex === 0 && !this.timerRunning) {
            this.timerRunning = true;
            this.currentSentenceStartTime = Date.now();
        }

        const targetChar = this.currentSentence[this.currentIndex];
        const isCorrect = pressedKey === targetChar;

        // Play sound
        if (pressedKey === ' ') {
            this.sound.play('spaceSound');
        } else {
            this.sound.play('typeSound');
        }

        if (isCorrect) {
            this.handleCorrectKey();
        } else {
            this.handleIncorrectKey();
        }

        this.updateStats();
    }

    handleCorrectKey() {
        const letterObj = this.letterObjects[this.currentIndex];
        const currentChar = this.currentSentence[this.currentIndex];
        
        // Mark as correct (green)
        letterObj.bg.setFillStyle(0x4CAF50);
        letterObj.status = 'correct';
        this.correctCount++;
        this.totalChars++;

        // Flash keyboard key green
        this.keyboard.flashKey(currentChar, 0x4CAF50);

        // Create confetti effect
        this.createConfetti(letterObj.bg.x, letterObj.bg.y);

        // Move to next letter
        this.currentIndex++;

        if (this.currentIndex >= this.currentSentence.length) {
            // Sentence complete! Stop the timer and accumulate elapsed time
            this.timerRunning = false;
            this.totalElapsedTime += this.currentElapsedTime;
            
            // Load next one
            this.time.delayedCall(500, () => {
                this.loadNewSentence();
            });
        } else {
            // Highlight next letter
            this.updateHighlight();
        }
    }

    handleIncorrectKey() {
        const letterObj = this.letterObjects[this.currentIndex];
        const currentChar = this.currentSentence[this.currentIndex];
        
        // Mark as incorrect (red)
        letterObj.bg.setFillStyle(0xF44336);
        letterObj.status = 'incorrect';
        this.incorrectCount++;
        this.totalChars++;

        // Flash keyboard key red
        this.keyboard.flashKey(currentChar, 0xF44336);

        // Play error sound
        this.sound.play('whoopsieSound');

        // Flash effect
        this.tweens.add({
            targets: letterObj.bg,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });

        // Move to next letter anyway
        this.currentIndex++;

        if (this.currentIndex >= this.currentSentence.length) {
            // Sentence complete! Stop the timer and accumulate elapsed time
            this.timerRunning = false;
            this.totalElapsedTime += this.currentElapsedTime;
            
            // Load next one
            this.time.delayedCall(500, () => {
                this.loadNewSentence();
            });
        } else {
            // Highlight next letter
            this.updateHighlight();
        }
    }

    updateHighlight() {
        // Remove blue outline from all letters
        this.letterObjects.forEach((obj, index) => {
            if (obj.status === 'pending') {
                obj.bg.setStrokeStyle(2, 0x4a4a8a);
            }
        });

        // Add blue outline to current letter
        if (this.currentIndex < this.letterObjects.length) {
            this.letterObjects[this.currentIndex].bg.setStrokeStyle(2, 0x4a9aff);
            
            // Highlight the key on the keyboard
            const nextChar = this.currentSentence[this.currentIndex];
            this.keyboard.highlightKey(nextChar);
        }
    }

    createConfetti(x, y) {
        const numPieces = 8;
        const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x88ff00, 0xff0088];

        for (let i = 0; i < numPieces; i++) {
            const angle = (i / numPieces) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3);
            const distance = Phaser.Math.Between(30, 50);
            
            // Create confetti piece (small rectangle)
            const confetti = this.add.rectangle(
                this.sentenceContainer.x + x,
                this.sentenceContainer.y + y,
                6,
                6,
                colors[i % colors.length]
            );
            
            // Animate outward with rotation
            this.tweens.add({
                targets: confetti,
                x: this.sentenceContainer.x + x + Math.cos(angle) * distance,
                y: this.sentenceContainer.y + y + Math.sin(angle) * distance + 30, // gravity
                alpha: 0,
                angle: Phaser.Math.Between(-180, 180),
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    confetti.destroy();
                }
            });
        }
    }

    updateStats() {
        // Calculate WPM based on cumulative elapsed time (not continuous clock)
        let wpm = 0;
        if (this.totalChars > 0) {
            // Total time is accumulated time plus current running time (if timer is running)
            let totalTimeSeconds = this.totalElapsedTime;
            if (this.timerRunning) {
                totalTimeSeconds += this.currentElapsedTime;
            }
            
            if (totalTimeSeconds > 0) {
                const elapsedMinutes = totalTimeSeconds / 60;
                const wordsTyped = this.totalChars / 5; // Standard: 5 chars = 1 word
                wpm = Math.round(wordsTyped / elapsedMinutes);
            }
        }

        // Calculate accuracy
        let accuracy = 100;
        if (this.totalChars > 0) {
            accuracy = ((this.correctCount / this.totalChars) * 100).toFixed(1);
        }

        this.statsText.setText(`WPM: ${wpm} | Accuracy: ${accuracy}%`);
    }

    showConfirmDialog() {
        if (this.dialogOpen) return;
        this.dialogOpen = true;

        // Keyboard input is disabled via dialogOpen flag check in handleKeyPress

        const overlay = this.add.rectangle(640, 400, 1280, 800, 0x000000, 0.7);
        overlay.setDepth(1000);

        const dialogBox = this.add.rectangle(640, 400, 500, 250, 0x2c2c54);
        dialogBox.setStrokeStyle(3, 0x4a4a8a);
        dialogBox.setDepth(1001);

        const dialogTitle = this.add.text(640, 320, 'Confirm Exit', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1002);

        const dialogMessage = this.add.text(640, 380, 'Are you sure you want to go back?\nYour progress will be lost.', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(1002);

        // Yes button
        const yesButton = this.add.container(560, 460).setDepth(1003);
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
        const noButton = this.add.container(720, 460).setDepth(1003);
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
}

