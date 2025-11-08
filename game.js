/*
============================================
Modern Flappy Bird - Professional Edition
Python-Style Web Implementation
============================================
Originally built with Python/Pygame
Ported to JavaScript/Canvas with full feature parity

Developer: Daffa Aditya Pratama
Designer: Samsul Bahrur
============================================
*/

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// COLORS - Modern Kid-Friendly Palette
// ============================================
const COLORS = {
    // UI Colors - Bright & Playful
    PRIMARY: '#FF6B6B',                     // Coral Red
    SECONDARY: '#4ECDC4',                   // Turquoise
    ACCENT: '#FFE66D',                      // Sunshine Yellow
    ACCENT_SECONDARY: '#95E1D3',            // Mint Green
    
    // Pipe Colors - HIGH CONTRAST
    PIPE_GREEN: '#2ECC71',                  // Bright Green
    PIPE_DARK_GREEN: '#27AE60',             // Dark Green
    PIPE_CYAN: '#00CED1',                   // Dark Turquoise
    PIPE_BLUE: '#3498DB',                   // Bright Blue
    PIPE_PURPLE: '#9B59B6',                 // Purple
    PIPE_PINK: '#FF69B4',                   // Hot Pink
    
    // Sky & Background
    SKY_TOP: '#87CEEB',                     // Sky Blue
    SKY_BOTTOM: '#E0F6FF',                  // Light Blue
    GROUND: '#8BC34A',                      // Light Green
    GROUND_DARK: '#7CB342',                 // Dark Green
    
    // Basic Colors
    WHITE: '#FFFFFF',
    BLACK: '#2C3E50',
    GRAY: '#7F8C8D',
    GOLD: '#FFD700',
    SILVER: '#C0C0C0',
    
    // UI Backgrounds
    BG_DARK: 'rgba(0, 0, 0, 0.7)',
    BG_LIGHT: 'rgba(255, 255, 255, 0.9)',
    OVERLAY: 'rgba(0, 0, 0, 0.5)'
};

// ============================================
// GAME CONSTANTS
// ============================================
const GRAVITY = 0.5;
const JUMP_FORCE = -9;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 70;

// ============================================
// GAME STATE MACHINE
// ============================================
let gameState = 'MAIN_MENU';  // MAIN_MENU, SETTINGS, SHOP, CREDITS, PLAYING, GAME_OVER
let previousState = 'MAIN_MENU';

// ============================================
// PLAYER DATA
// ============================================
let player = {
    coins: 10000000000,
    highScore: 0,
    birdSkin: 'default',
    obstacleSkin: 'default',
    unlockedBirds: ['default'],
    unlockedObstacles: ['default']
};

// ============================================
// SETTINGS
// ============================================
let settings = {
    difficulty: 'normal',  // easy, normal, hardcore
    musicVolume: 0.5,
    sfxVolume: 0.7,
    particles: true,
    screenShake: true,
    vsync: true,
    fullscreen: false
};

// ============================================
// DIFFICULTY CONFIGS
// ============================================
const DIFFICULTY = {
    easy: { pipeGap: 220, speed: 2.5, speedIncrease: 0.05 },
    normal: { pipeGap: 180, speed: 3, speedIncrease: 0.08 },
    hardcore: { pipeGap: 140, speed: 4, speedIncrease: 0.12 }
};

// ============================================
// SHOP ITEMS
// ============================================
const SHOP_ITEMS = {
    birds: [
        { id: 'default', name: '🐤 Classic', price: 0, color: COLORS.GOLD, desc: 'Burung kuning klasik' },
        { id: 'red', name: '🔴 Red Bird', price: 50, color: COLORS.PRIMARY, desc: 'Burung merah cepat' },
        { id: 'rainbow', name: '🌈 Rainbow', price: 200, color: COLORS.ACCENT, desc: 'Burung pelangi' },
        { id: 'golden', name: '👑 Golden', price: 500, color: COLORS.GOLD, desc: 'Burung emas berkilau' },
        { id: 'robot', name: '🤖 Robot', price: 999, color: COLORS.SILVER, desc: 'Burung robot futuristik' }
    ],
    obstacles: [
        { id: 'default', name: '🌿 Green', price: 0, color: COLORS.PIPE_GREEN, desc: 'Pipa hijau klasik' },
        { id: 'cyan', name: '💎 Crystal', price: 100, color: COLORS.PIPE_CYAN, desc: 'Pipa cyan kristal' },
        { id: 'blue', name: '🌊 Ocean', price: 250, color: COLORS.PIPE_BLUE, desc: 'Pipa biru samudra' },
        { id: 'purple', name: '🔮 Magic', price: 400, color: COLORS.PIPE_PURPLE, desc: 'Pipa ungu ajaib' },
        { id: 'pink', name: '💖 Love', price: 600, color: COLORS.PIPE_PINK, desc: 'Pipa pink romantis' }
    ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function adjustBrightness(color, factor) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Adjust brightness
    const nr = Math.min(255, Math.floor(r * factor));
    const ng = Math.min(255, Math.floor(g * factor));
    const nb = Math.min(255, Math.floor(b * factor));
    
    // Convert back to hex
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// ============================================
// GAME VARIABLES
// ============================================
let bird = { y: 360, velocity: 0, rotation: 0, wingPhase: 0 };
let pipes = [];
let particles = [];
let backgroundParticles = [];
let buttons = [];
let mouseX = 0, mouseY = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let perfectPasses = 0;
let coinsEarned = 0;
let gameSpeed = 3;
let screenShakeAmount = 0;
let animationTime = 0;

// Fullscreen & Responsive
let isFullscreen = false;
let scale = 1;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ============================================
// AUDIO SYSTEM - Web Audio API
// ============================================
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        console.log('# Audio system initialized (Python-style Web Audio API)');
    }
}

function playSound(soundType) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const volume = settings.sfxVolume * 0.15;
    
    // Python-style sound generation with frequency mapping
    const soundMap = {
        'click': { freq: 600, duration: 0.1 },
        'jump': { freq: 800, duration: 0.15 },
        'point': { freq: 1000 + Math.random() * 200, duration: 0.2 },
        'death': { freq: 150, duration: 0.5 }
    };
    
    const sound = soundMap[soundType] || soundMap['click'];
    osc.frequency.value = sound.freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + sound.duration);
    osc.start();
    osc.stop(audioCtx.currentTime + sound.duration);
}

// ============================================
// PARTICLE SYSTEM
// ============================================
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;  // gravity
        this.life -= this.decay;
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createParticles(x, y, count, color) {
    if (!settings.particles) return;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function initBackgroundParticles() {
    // Python-style: Create floating background particles
    for (let i = 0; i < 50; i++) {
        backgroundParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.2,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
}

// ============================================
// FULLSCREEN & RESPONSIVE FUNCTIONS
// ============================================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            isFullscreen = true;
            resizeCanvas();
            playSound('click');
        }).catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            isFullscreen = false;
            resizeCanvas();
            playSound('click');
        });
    }
}

function resizeCanvas() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    const gameAspect = 1280 / 720;
    const windowAspect = containerWidth / containerHeight;
    
    if (windowAspect > gameAspect) {
        // Window wider than game
        canvas.style.height = containerHeight + 'px';
        canvas.style.width = (containerHeight * gameAspect) + 'px';
    } else {
        // Window taller than game
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = (containerWidth / gameAspect) + 'px';
    }
    
    scale = parseInt(canvas.style.width) / 1280;
}

// ============================================
// BUTTON SYSTEM
// ============================================
class Button {
    constructor(x, y, width, height, text, onClick, style = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.onClick = onClick;
        this.hovered = false;
        this.style = {
            bgColor: style.bgColor || COLORS.PRIMARY,
            hoverColor: style.hoverColor || COLORS.SECONDARY,
            textColor: style.textColor || COLORS.WHITE,
            fontSize: style.fontSize || 20,
            ...style
        };
    }
    
    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    draw(ctx) {
        const color = this.hovered ? this.style.hoverColor : this.style.bgColor;
        const scale = this.hovered ? 1.05 : 1;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(scale, scale);
        
        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        
        // Button background with rounded corners
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 10);
        ctx.fill();
        
        // Button text
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = this.style.textColor;
        ctx.font = `bold ${this.style.fontSize}px 'Segoe UI'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, 0, 0);
        
        ctx.restore();
    }
}

// ============================================
// DRAWING UTILITIES
// ============================================
function drawAnimatedTitle(text, y, size = 48) {
    // Python-style: Rainbow animated title
    ctx.save();
    const hue = (animationTime * 50) % 360;
    const gradient = ctx.createLinearGradient(0, y - size, 0, y + size);
    gradient.addColorStop(0, `hsl(${hue}, 80%, 60%)`);
    gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 80%, 60%)`);
    gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 80%, 60%)`);
    
    ctx.fillStyle = gradient;
    ctx.font = `bold ${size}px 'Segoe UI'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    
    const wave = Math.sin(animationTime * 3) * 5;
    ctx.fillText(text, canvas.width / 2, y + wave);
    ctx.restore();
}

function drawGradientBackground() {
    // Sky gradient background - Kid Friendly
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, COLORS.SKY_TOP);
    gradient.addColorStop(1, COLORS.SKY_BOTTOM);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Animated clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 5; i++) {
        const x = ((animationTime * 20 + i * 300) % (canvas.width + 200)) - 100;
        const y = 80 + i * 70;
        // Simple cloud shape
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.arc(x + 30, y, 50, 0, Math.PI * 2);
        ctx.arc(x + 60, y, 40, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ground - Green grass
    ctx.fillStyle = COLORS.GROUND;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Ground pattern
    ctx.fillStyle = COLORS.GROUND_DARK;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.fillRect(x, canvas.height - 100, 20, 100);
    }
    
    // Animated waves at bottom (optional water effect)
    ctx.save();
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 10) {
        const y = canvas.height - 100 + Math.sin(x * 0.02 + animationTime * 2) * 10;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawBackgroundParticles() {
    if (!settings.particles) return;
    
    backgroundParticles.forEach(p => {
        p.y -= p.speed;
        if (p.y < -10) p.y = canvas.height + 10;
        
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = COLORS.WHITE;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// ============================================
// MAIN MENU
// ============================================
function drawMainMenu() {
    drawGradientBackground();
    drawBackgroundParticles();
    drawAnimatedTitle('Modern Flappy Bird', 120, 56);
    
    // Python-style: Menu buttons with hover effects
    buttons = [
        new Button(canvas.width / 2 - 100, 250, 200, 50, '▶ Play', () => startGame()),
        new Button(canvas.width / 2 - 100, 320, 200, 50, '⚙ Settings', () => { gameState = 'SETTINGS'; }),
        new Button(canvas.width / 2 - 100, 390, 200, 50, '🛒 Shop', () => { gameState = 'SHOP'; }),
        new Button(canvas.width / 2 - 100, 460, 200, 50, '🏆 Credits', () => { gameState = 'CREDITS'; }),
        // Fullscreen button - top right
        new Button(canvas.width - 150, 10, 140, 35, isFullscreen ? '🔽 EXIT FULL' : '🔼 FULLSCREEN', 
                   toggleFullscreen, { bgColor: COLORS.ACCENT_SECONDARY, fontSize: 14 })
    ];
    
    buttons.forEach(btn => {
        btn.hovered = btn.contains(mouseX, mouseY);
        btn.draw(ctx);
    });
    
    // Footer credits
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '14px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('Developer: Daffa Aditya Pratama | Designer: Samsul Bahrur', canvas.width / 2, canvas.height - 30);
    ctx.fillText('Built with Python-style JavaScript (originally Pygame)', canvas.width / 2, canvas.height - 10);
}

// ============================================
// SETTINGS MENU
// ============================================
function drawSettings() {
    drawGradientBackground();
    drawBackgroundParticles();
    drawAnimatedTitle('Settings', 80, 48);
    
    buttons = [];
    let currentY = 150;
    const spacing = 70;
    
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.textAlign = 'left';
    
    // Difficulty selector
    ctx.fillText('🎮 Difficulty:', 100, currentY);
    ['Easy', 'Normal', 'Hardcore'].forEach((diff, i) => {
        const isActive = settings.difficulty === diff.toLowerCase();
        const btn = new Button(
            400 + i * 130, currentY - 25, 110, 40, diff,
            () => {
                settings.difficulty = diff.toLowerCase();
                createParticles(canvas.width / 2, currentY, 20, COLORS.ACCENT);
                playSound('click');
            },
            { bgColor: isActive ? COLORS.ACCENT : COLORS.PRIMARY }
        );
        btn.hovered = btn.contains(mouseX, mouseY);
        btn.draw(ctx);
        buttons.push(btn);
    });
    
    currentY += spacing;
    
    // Audio section
    ctx.fillText('🔊 Audio:', 100, currentY);
    ctx.font = '16px "Segoe UI"';
    ctx.fillText(`Music: ${Math.round(settings.musicVolume * 100)}%`, 400, currentY);
    ctx.fillText(`SFX: ${Math.round(settings.sfxVolume * 100)}%`, 700, currentY);
    
    currentY += spacing;
    
    // Graphics section
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.fillText('🎨 Graphics:', 100, currentY);
    
    [
        { name: 'Particles', key: 'particles' },
        { name: 'Screen Shake', key: 'screenShake' },
        { name: 'VSync', key: 'vsync' }
    ].forEach((toggle, i) => {
        const isOn = settings[toggle.key];
        const btn = new Button(
            400 + i * 180, currentY - 25, 150, 40,
            `${toggle.name}: ${isOn ? 'ON' : 'OFF'}`,
            () => {
                settings[toggle.key] = !settings[toggle.key];
                playSound('click');
            },
            { bgColor: isOn ? COLORS.ACCENT_SECONDARY : COLORS.SECONDARY, fontSize: 16 }
        );
        btn.hovered = btn.contains(mouseX, mouseY);
        btn.draw(ctx);
        buttons.push(btn);
    });
    
    // Back button
    const backBtn = new Button(canvas.width / 2 - 75, canvas.height - 100, 150, 50, '← Back',
        () => { gameState = 'MAIN_MENU'; playSound('click'); });
    backBtn.hovered = backBtn.contains(mouseX, mouseY);
    backBtn.draw(ctx);
    buttons.push(backBtn);
}

// ============================================
// SHOP MENU
// ============================================
function drawShop() {
    drawGradientBackground();
    drawBackgroundParticles();
    drawAnimatedTitle('Shop', 80, 48);
    
    // Coin display
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = 'bold 24px "Segoe UI"';
    ctx.textAlign = 'left';
    ctx.fillText(`💰 ${player.coins} Coins`, 50, 150);
    
    buttons = [];
    
    // Bird Skins section
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.fillText('🐦 Bird Skins:', 100, 220);
    
    SHOP_ITEMS.birds.forEach((item, i) => {
        const isUnlocked = player.unlockedBirds.includes(item.id);
        const isEquipped = player.birdSkin === item.id;
        const x = 100 + (i % 2) * 220;
        const y = 260 + Math.floor(i / 2) * 80;
        
        const btn = new Button(
            x, y, 200, 60,
            isUnlocked ? (isEquipped ? `✓ ${item.name}` : item.name) : `🔒 ${item.price}`,
            () => {
                if (!isUnlocked && player.coins >= item.price) {
                    player.coins -= item.price;
                    player.unlockedBirds.push(item.id);
                    player.birdSkin = item.id;
                    playSound('point');
                    createParticles(x + 100, y + 30, 30, COLORS.GOLD);
                } else if (isUnlocked) {
                    player.birdSkin = item.id;
                    playSound('click');
                }
            },
            { bgColor: isUnlocked ? item.color : COLORS.SECONDARY, fontSize: 18 }
        );
        btn.hovered = btn.contains(mouseX, mouseY);
        btn.draw(ctx);
        buttons.push(btn);
    });
    
    // Obstacle Styles section
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.fillText('🚧 Obstacle Styles:', 640, 220);
    
    SHOP_ITEMS.obstacles.forEach((item, i) => {
        const isUnlocked = player.unlockedObstacles.includes(item.id);
        const isEquipped = player.obstacleSkin === item.id;
        const x = 640 + (i % 2) * 220;
        const y = 260 + Math.floor(i / 2) * 80;
        
        const btn = new Button(
            x, y, 200, 60,
            isUnlocked ? (isEquipped ? `✓ ${item.name}` : item.name) : `🔒 ${item.price}`,
            () => {
                if (!isUnlocked && player.coins >= item.price) {
                    player.coins -= item.price;
                    player.unlockedObstacles.push(item.id);
                    player.obstacleSkin = item.id;
                    playSound('point');
                    createParticles(x + 100, y + 30, 30, COLORS.GOLD);
                } else if (isUnlocked) {
                    player.obstacleSkin = item.id;
                    playSound('click');
                }
            },
            { bgColor: isUnlocked ? item.color : COLORS.SECONDARY, fontSize: 18 }
        );
        btn.hovered = btn.contains(mouseX, mouseY);
        btn.draw(ctx);
        buttons.push(btn);
    });
    
    // Back button
    const backBtn = new Button(canvas.width / 2 - 75, canvas.height - 100, 150, 50, '← Back',
        () => { gameState = 'MAIN_MENU'; playSound('click'); });
    backBtn.hovered = backBtn.contains(mouseX, mouseY);
    backBtn.draw(ctx);
    buttons.push(backBtn);
}

// ============================================
// CREDITS SCREEN
// ============================================
function drawCredits() {
    drawGradientBackground();
    drawBackgroundParticles();
    drawAnimatedTitle('Credits', 100, 48);
    
    const credits = [
        { role: 'Developer', name: 'Daffa Aditya Pratama' },
        { role: 'Designer', name: 'Samsul Bahrur' },
        { role: 'Sound System', name: 'Web Audio API' },
        { role: 'Engine', name: 'JavaScript + Canvas (Python-style)' }
    ];
    
    credits.forEach((credit, i) => {
        const y = 250 + i * 80;
        const wave = Math.sin(animationTime * 2 + i) * 5;
        
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = 'bold 28px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(credit.name, canvas.width / 2, y + wave);
        
        ctx.fillStyle = COLORS.SECONDARY;
        ctx.font = '18px "Segoe UI"';
        ctx.fillText(credit.role, canvas.width / 2, y + 30 + wave);
    });
    
    buttons = [
        new Button(canvas.width / 2 - 75, canvas.height - 100, 150, 50, '← Back',
            () => { gameState = 'MAIN_MENU'; playSound('click'); })
    ];
    
    buttons[0].hovered = buttons[0].contains(mouseX, mouseY);
    buttons[0].draw(ctx);
}

// ============================================
// GAME LOGIC
// ============================================
function startGame() {
    gameState = 'PLAYING';
    bird = { y: 360, velocity: 0, rotation: 0, wingPhase: 0 };
    pipes = [];
    particles = [];
    score = 0;
    combo = 0;
    maxCombo = 0;
    perfectPasses = 0;
    coinsEarned = 0;
    
    const diff = DIFFICULTY[settings.difficulty];
    gameSpeed = diff.speed;
    
    createPipe(canvas.width);
    createPipe(canvas.width + 400);
    playSound('click');
}

function createPipe(x) {
    const diff = DIFFICULTY[settings.difficulty];
    const minHeight = 100;
    const maxHeight = canvas.height - diff.pipeGap - minHeight - 50;
    const height = minHeight + Math.random() * (maxHeight - minHeight);
    
    pipes.push({
        x: x,
        height: height,
        gap: diff.pipeGap,
        scored: false
    });
}

function updateGame() {
    // Bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90);
    bird.wingPhase += 0.2;
    
    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= gameSpeed;
        
        if (!pipe.scored && pipe.x + PIPE_WIDTH < 100) {
            pipe.scored = true;
            score++;
            
            // Check for perfect pass
            const centerY = pipe.height + pipe.gap / 2;
            const distance = Math.abs(bird.y - centerY);
            
            if (distance < 30) {
                perfectPasses++;
                combo++;
                maxCombo = Math.max(maxCombo, combo);
                coinsEarned += 2;
                playSound('point');
                createParticles(100, bird.y, 15, COLORS.GOLD);
            } else {
                combo = 0;
                coinsEarned += 1;
                playSound('point');
            }
        }
    });
    
    pipes = pipes.filter(p => p.x > -100);
    
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 400) {
        createPipe(canvas.width);
    }
    
    particles = particles.filter(p => p.update());
    checkCollision();
    
    // Increase speed
    const diff = DIFFICULTY[settings.difficulty];
    gameSpeed = Math.min(diff.speed + score * diff.speedIncrease, diff.speed * 2);
    
    // Screen shake decay
    if (screenShakeAmount > 0) {
        screenShakeAmount *= 0.9;
        if (screenShakeAmount < 0.1) screenShakeAmount = 0;
    }
}

function checkCollision() {
    const birdLeft = 100 - BIRD_SIZE / 2;
    const birdRight = 100 + BIRD_SIZE / 2;
    const birdTop = bird.y - BIRD_SIZE / 2;
    const birdBottom = bird.y + BIRD_SIZE / 2;
    
    if (birdTop < 0 || birdBottom > canvas.height) {
        endGame();
        return;
    }
    
    pipes.forEach(pipe => {
        if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
            if (birdTop < pipe.height || birdBottom > pipe.height + pipe.gap) {
                endGame();
            }
        }
    });
}

function endGame() {
    if (gameState !== 'PLAYING') return;
    
    gameState = 'GAME_OVER';
    playSound('death');
    
    if (settings.screenShake) screenShakeAmount = 10;
    createParticles(100, bird.y, 40, COLORS.ACCENT);
    
    player.coins += coinsEarned;
    if (score > player.highScore) player.highScore = score;
}

function jump() {
    if (gameState === 'PLAYING') {
        bird.velocity = JUMP_FORCE;
        playSound('jump');
        createParticles(100, bird.y + BIRD_SIZE / 2, 10, COLORS.WHITE);
    }
}

// ============================================
// GAME RENDERING
// ============================================
function drawGame() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, COLORS.PRIMARY);
    gradient.addColorStop(1, COLORS.SECONDARY);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Screen shake effect
    if (screenShakeAmount > 0 && settings.screenShake) {
        ctx.save();
        ctx.translate(
            (Math.random() - 0.5) * screenShakeAmount,
            (Math.random() - 0.5) * screenShakeAmount
        );
    }
    
    // Draw pipes with HIGH CONTRAST outline
    const obstacleData = SHOP_ITEMS.obstacles.find(o => o.id === player.obstacleSkin);
    const obstacleColor = obstacleData?.color || COLORS.PIPE_GREEN;
    
    pipes.forEach(pipe => {
        // Shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        
        // Pipe body with gradient
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        gradient.addColorStop(0, obstacleColor);
        gradient.addColorStop(0.5, adjustBrightness(obstacleColor, 1.2));
        gradient.addColorStop(1, obstacleColor);
        ctx.fillStyle = gradient;
        
        // Top pipe
        ctx.beginPath();
        ctx.roundRect(pipe.x, 0, PIPE_WIDTH, pipe.height, [0, 0, 15, 15]);
        ctx.fill();
        
        // Bottom pipe
        ctx.beginPath();
        ctx.roundRect(pipe.x, pipe.height + pipe.gap, PIPE_WIDTH, 
                     canvas.height - pipe.height - pipe.gap, [15, 15, 0, 0]);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        
        // BLACK OUTLINE for HIGH CONTRAST - 4px thick
        ctx.strokeStyle = COLORS.BLACK;
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.roundRect(pipe.x, 0, PIPE_WIDTH, pipe.height, [0, 0, 15, 15]);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.roundRect(pipe.x, pipe.height + pipe.gap, PIPE_WIDTH, 
                     canvas.height - pipe.height - pipe.gap, [15, 15, 0, 0]);
        ctx.stroke();
        
        // Highlight stripe for 3D effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(pipe.x + 8, 0);
        ctx.lineTo(pipe.x + 8, pipe.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(pipe.x + 8, pipe.height + pipe.gap);
        ctx.lineTo(pipe.x + 8, canvas.height);
        ctx.stroke();
    });
    
    // Draw bird with wing animation
    const birdColor = SHOP_ITEMS.birds.find(b => b.id === player.birdSkin)?.color || COLORS.GOLD;
    ctx.save();
    ctx.translate(100, bird.y);
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    ctx.fillStyle = birdColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    const wingY = Math.sin(bird.wingPhase) * 5;
    ctx.beginPath();
    ctx.ellipse(-5, wingY, 8, 12, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.WHITE;
    ctx.beginPath();
    ctx.arc(8, -5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.BLACK;
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    particles.forEach(p => p.draw(ctx));
    
    if (screenShakeAmount > 0 && settings.screenShake) ctx.restore();
    
    drawHUD();
}

function drawHUD() {
    // Score with combo effect
    const scoreScale = combo > 0 ? 1 + Math.sin(animationTime * 10) * 0.1 : 1;
    ctx.save();
    ctx.translate(canvas.width / 2, 60);
    ctx.scale(scoreScale, scoreScale);
    ctx.fillStyle = combo > 5 ? COLORS.GOLD : COLORS.WHITE;
    ctx.font = 'bold 48px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(score, 0, 0);
    ctx.restore();
    
    // Combo counter
    if (combo > 0) {
        ctx.fillStyle = COLORS.ACCENT_SECONDARY;
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(`Combo x${combo}`, canvas.width / 2, 110);
    }
    
    // HUD elements
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.textAlign = 'left';
    ctx.fillText(`⭐ Perfect: ${perfectPasses}`, 20, 40);
    
    ctx.textAlign = 'right';
    ctx.fillText(`💰 +${coinsEarned}`, canvas.width - 20, 40);
    
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = '16px "Segoe UI"';
    ctx.textAlign = 'left';
    ctx.fillText(`Mode: ${settings.difficulty.toUpperCase()}`, 20, canvas.height - 20);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}x`, canvas.width - 20, canvas.height - 20);
}

function drawGameOver() {
    drawGame();
    
    // Dark overlay with pulse
    const pulseAlpha = 0.7 + Math.sin(animationTime * 3) * 0.1;
    ctx.fillStyle = `rgba(0, 0, 0, ${pulseAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gradient accent
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 400
    );
    gradient.addColorStop(0, 'rgba(235, 69, 158, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over title
    const scale = 1 + Math.sin(animationTime * 2) * 0.05;
    ctx.save();
    ctx.translate(canvas.width / 2, 150);
    ctx.scale(scale, scale);
    ctx.fillStyle = COLORS.ACCENT;
    ctx.font = 'bold 72px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('GAME OVER', 0, 0);
    ctx.restore();
    
    // Statistics
    const stats = [
        { label: 'Final Score', value: score, color: score > player.highScore ? COLORS.GOLD : COLORS.WHITE },
        { label: 'High Score', value: player.highScore, color: COLORS.GOLD },
        { label: 'Perfect Passes', value: perfectPasses, color: COLORS.ACCENT_SECONDARY },
        { label: 'Max Combo', value: maxCombo, color: COLORS.PRIMARY },
        { label: 'Coins Earned', value: coinsEarned, color: COLORS.GOLD }
    ];
    
    stats.forEach((stat, i) => {
        const y = 280 + i * 60;
        const slideX = canvas.width / 2 + Math.sin(animationTime * 3 + i) * 10;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '20px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(stat.label, slideX, y);
        
        ctx.fillStyle = stat.color;
        ctx.font = 'bold 32px "Segoe UI"';
        ctx.fillText(stat.value, slideX, y + 35);
    });
    
    // Buttons - RETRY and BACK TO MENU side by side
    buttons = [];
    
    const btnWidth = 200;
    const btnHeight = 55;
    const btnSpacing = 20;
    const totalWidth = btnWidth * 2 + btnSpacing;
    const btnStartX = (canvas.width - totalWidth) / 2;
    const btnY = canvas.height - 140;
    
    // RETRY button
    buttons.push(new Button(
        btnStartX, btnY, btnWidth, btnHeight,
        '🔄 RETRY',
        () => {
            gameState = 'PLAYING';
            initGame();
            playSound('click');
        },
        { bgColor: COLORS.PRIMARY, hoverColor: adjustBrightness(COLORS.PRIMARY, 1.2) }
    ));
    
    // BACK TO MENU button
    buttons.push(new Button(
        btnStartX + btnWidth + btnSpacing, btnY, btnWidth, btnHeight,
        '🏠 MENU',
        () => {
            gameState = 'MAIN_MENU';
            playSound('click');
        },
        { bgColor: COLORS.SECONDARY, hoverColor: adjustBrightness(COLORS.SECONDARY, 1.2) }
    ));
    
    // Fullscreen button - top right
    buttons.push(new Button(
        canvas.width - 150, 10, 140, 35,
        isFullscreen ? '🔽 EXIT FULL' : '🔼 FULLSCREEN',
        toggleFullscreen,
        { bgColor: COLORS.ACCENT_SECONDARY, fontSize: 14 }
    ));
    
    // Draw all buttons
    buttons.forEach(btn => {
        btn.hovered = btn.contains(mouseX, mouseY);
        btn.draw(ctx);
    });
}

// ============================================
// MAIN LOOP
// ============================================
function update() {
    animationTime += 0.016;
    if (gameState === 'PLAYING') updateGame();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    switch (gameState) {
        case 'MAIN_MENU': drawMainMenu(); break;
        case 'SETTINGS': drawSettings(); break;
        case 'SHOP': drawShop(); break;
        case 'CREDITS': drawCredits(); break;
        case 'PLAYING': drawGame(); break;
        case 'GAME_OVER': drawGameOver(); break;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ============================================
// INPUT HANDLERS
// ============================================
function handleClick(x, y) {
    initAudio();
    
    let buttonClicked = false;
    buttons.forEach(btn => {
        if (btn.contains(x, y)) {
            playSound('click');
            btn.onClick();
            buttonClicked = true;
        }
    });
    
    if (!buttonClicked) {
        if (gameState === 'PLAYING') {
            jump();
        } else if (gameState === 'GAME_OVER') {
            startGame();
        }
    }
}

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    handleClick((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    handleClick((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / scale;
    mouseY = (e.clientY - rect.top) / scale;
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (gameState === 'PLAYING') jump();
        else if (gameState === 'GAME_OVER') {
            // Check if clicking button
            let buttonClicked = false;
            buttons.forEach(btn => {
                if (btn.contains(mouseX, mouseY)) buttonClicked = true;
            });
            if (!buttonClicked) startGame();
        }
    } else if (e.key === 'Escape') {
        if (gameState !== 'MAIN_MENU' && gameState !== 'PLAYING') {
            gameState = 'MAIN_MENU';
            playSound('click');
        }
    } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
    }
});

// Fullscreen change listener
document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    resizeCanvas();
});

// Window resize listener
window.addEventListener('resize', resizeCanvas);

// Initialize resize on load
window.addEventListener('load', () => {
    resizeCanvas();
});

// ============================================
// INITIALIZATION
// ============================================
console.log('');
console.log('# ============================================');
console.log('# Modern Flappy Bird - Professional Edition');
console.log('# ============================================');
console.log('# Originally built with Python/Pygame');
console.log('# Ported to JavaScript with full feature parity');
console.log('#');
console.log('# Developer: Daffa Aditya Pratama');
console.log('# Designer: Samsul Bahrur');
console.log('# ============================================');
console.log('');

initBackgroundParticles();
gameLoop();
