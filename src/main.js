import { TypingTutor } from './scenes/TypingTutor.js';

const config = {
    type: Phaser.AUTO,
    title: 'Typi - Typing Tutor',
    description: 'Learn to type with Phaser',
    parent: 'game-container',
    width: 1280,
    height: 800,
    backgroundColor: '#1a1a2e',
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true,
        resolution: window.devicePixelRatio
    },
    scene: [
        TypingTutor
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            