/**
 * ============================================
 * Modern Flappy Bird - Professional Edition
 * 100% Synchronized dengan Python/Pygame Version
 * ============================================
 * Developer: Daffa Aditya Pratama
 * Designer: Samsul Bahrur
 * Version: 1.0 - COMPLETE EDITION (Web)
 * ============================================
 */

// ========== CANVAS SETUP ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ========== CONSTANTS - 100% MATCH PYTHON ==========
const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;
const FPS = 60;
const GRAVITY = 0.5;
const JUMP_FORCE = -9;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 70;
const PIPE_GAP = 180;
const PIPE_SPEED = 3;
const COIN_DISTANCE = 30;

// ========== COLOR PALETTE - 100% MATCH PYTHON ==========
const C = {
    PRIMARY: '#FF6B6B',        // (255, 107, 107)
    SECONDARY: '#4ECDC4',      // (78, 205, 196)
    ACCENT: '#FFE66D',         // (255, 230, 109)
    ACCENT_SEC: '#95E1D3',     // (149, 225, 211)
    SKY_TOP: '#87CEEB',        // (135, 206, 235)
    SKY_BOT: '#E0F6FF',        // (224, 246, 255)
    GROUND: '#8BC34A',         // (139, 195, 74)
    GROUND_DARK: '#7CB342',    // (124, 179, 66)
    WHITE: '#FFFFFF',
    BLACK: '#2C3E50',          // (44, 62, 80)
    GRAY: '#7F8C8D',           // (127, 140, 141)
    GOLD: '#FFD700',           // (255, 215, 0)
    SILVER: '#C0C0C0',         // (192, 192, 192)
    BRONZE: '#CD7F32',         // (205, 127, 50)
    P_GREEN: '#2ECC71',        // (46, 204, 113)
    P_CYAN: '#00CED1',         // (0, 206, 209)
    P_BLUE: '#3498DB',         // (52, 152, 219)
    P_PURPLE: '#9B59B6',       // (155, 89, 182)
    P_PINK: '#FF69B4'          // (255, 105, 180)
};

// ========== DIFFICULTY SETTINGS - 100% MATCH PYTHON ==========
const DIFF = {
    easy: { gap: 220, spd: 2.5, inc: 0.05 },
    normal: { gap: 180, spd: 3.0, inc: 0.08 },
    hardcore: { gap: 140, spd: 4.0, inc: 0.12 }
};

// ========== SHOP DATA - 100% MATCH PYTHON ==========
const BIRDS = [
    { id: 'default', name: '🐤 Classic', price: 0, color: '#FFD700' },
    { id: 'red', name: '🔴 Red Bird', price: 50, color: '#FF6B6B' },
    { id: 'rainbow', name: '🌈 Rainbow', price: 200, color: '#FFE66D' },
    { id: 'golden', name: '👑 Golden', price: 500, color: '#FFD700' },
    { id: 'robot', name: '🤖 Robot', price: 999, color: '#C0C0C0' }
];

const OBSTACLES = [
    { id: 'default', name: '🌿 Green', price: 0, color: '#2ECC71' },
    { id: 'cyan', name: '💎 Crystal', price: 100, color: '#00CED1' },
    { id: 'blue', name: '🌊 Ocean', price: 250, color: '#3498DB' },
    { id: 'purple', name: '🔮 Magic', price: 400, color: '#9B59B6' },
    { id: 'pink', name: '💖 Love', price: 600, color: '#FF69B4' }
];

// ========== DEFAULT LEADERBOARD - MATCH PYTHON ==========
const DEFAULT_LEADERBOARD = [
    { name: 'Daffa', score: 99999999 },
    { name: 'ALIF', score: 2000 },
    { name: 'HIDUP ITC WEB', score: 1050 },
    { name: 'SAMSUL', score: 1000 },
    { name: 'AMBA xyz', score: 100 },
    { name: 'opet', score: 20 },
    { name: 'Evos Denis', score: 5 }
];

// ========== AUDIO SYSTEM ==========
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function generateSound(frequency, duration = 0.1, volume = 0.3) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume * (game.sfxVolume / 100), audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playJump() { generateSound(440, 0.1, 0.2); }
function playPoint() { generateSound(880, 0.1, 0.2); }
function playDeath() { generateSound(220, 0.3, 0.2); }

// ========== PARTICLE SYSTEM - 100% MATCH PYTHON ==========
class Particle {
    constructor(x, y, color, size = 4, velX = null, velY = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.velX = velX !== null ? velX : (Math.random() * 6) - 3;
        this.velY = velY !== null ? velY : (Math.random() * 4) - 5;
        this.life = 1.0;
        this.fade = 0.01 + Math.random() * 0.02;
    }
    
    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.velY += 0.2;
        this.life -= this.fade;
        return this.life > 0;
    }
    
    draw(ctx) {
        if (this.life > 0) {
            const alphaSize = Math.max(1, Math.floor(this.size * this.life));
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, alphaSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// ========== BUTTON SYSTEM - 100% MATCH PYTHON ==========
class Button {
    constructor(x, y, w, h, text, color, hoverColor, textColor = C.WHITE) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.color = color;
        this.hoverColor = hoverColor;
        this.textColor = textColor;
        this.hovered = false;
    }
    
    draw(ctx, fontSize = 20) {
        const color = this.hovered ? this.hoverColor : this.color;
        
        // Button background with rounded corners
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 15);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = C.WHITE;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 15);
        ctx.stroke();
        
        // Text
        ctx.fillStyle = this.textColor;
        ctx.font = `bold ${fontSize}px 'Segoe UI'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2);
    }
    
    checkHover(mx, my) {
        this.hovered = mx >= this.x && mx <= this.x + this.w && 
                       my >= this.y && my <= this.y + this.h;
        return this.hovered;
    }
    
    isClicked(mx, my) {
        return mx >= this.x && mx <= this.x + this.w && 
               my >= this.y && my <= this.y + this.h;
    }
}

// ========== MAIN GAME CLASS - 100% MATCH PYTHON STRUCTURE ==========
class Game {
    constructor() {
        // Game State
        this.state = 'menu';
        this.difficulty = 'normal';
        this.running = true;
        
        // Settings - LENGKAP seperti Python!
        this.particlesEnabled = true;
        this.screenShake = true;
        this.musicVolume = 50;
        this.sfxVolume = 70;
        this.fullscreen = false;
        
        // Player data
        this.loadData();
        
        // Game variables
        this.resetGame();
        
        // Particles
        this.particles = [];
        
        // Cloud positions
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * SCREEN_WIDTH,
                y: 50 + Math.random() * 150
            });
        }
        
        // Player name input
        this.playerName = "";
        this.nameInputActive = false;
        
        // Leaderboard
        this.loadLeaderboard();
        
        // Mouse position
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Animation time
        this.animTime = 0;
        
        // Shake offset
        this.shakeOffset = { x: 0, y: 0 };
        
        // Game over buttons
        this.gameOverButtons = [];
    }
    
    loadLeaderboard() {
        try {
            const data = localStorage.getItem('flappyLeaderboard');
            if (data) {
                this.leaderboard = JSON.parse(data);
            } else {
                this.leaderboard = [...DEFAULT_LEADERBOARD];
                this.saveLeaderboard();
            }
        } catch (e) {
            this.leaderboard = [...DEFAULT_LEADERBOARD];
        }
    }
    
    saveLeaderboard() {
        localStorage.setItem('flappyLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    addToLeaderboard(name, score) {
        this.leaderboard.push({ name, score });
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 20);
        this.saveLeaderboard();
    }
    
    loadData() {
        try {
            const data = localStorage.getItem('flappyGameData');
            if (data) {
                const parsed = JSON.parse(data);
                this.coins = parsed.coins || 0;
                this.highscore = parsed.highscore || 0;
                this.currentBird = parsed.currentBird || 'default';
                this.currentObstacle = parsed.currentObstacle || 'default';
                this.ownedBirds = new Set(parsed.ownedBirds || ['default']);
                this.ownedObstacles = new Set(parsed.ownedObstacles || ['default']);
            } else {
                this.coins = 0;
                this.highscore = 0;
                this.currentBird = 'default';
                this.currentObstacle = 'default';
                this.ownedBirds = new Set(['default']);
                this.ownedObstacles = new Set(['default']);
            }
        } catch (e) {
            this.coins = 0;
            this.highscore = 0;
            this.currentBird = 'default';
            this.currentObstacle = 'default';
            this.ownedBirds = new Set(['default']);
            this.ownedObstacles = new Set(['default']);
        }
    }
    
    saveData() {
        const data = {
            coins: this.coins,
            highscore: this.highscore,
            currentBird: this.currentBird,
            currentObstacle: this.currentObstacle,
            ownedBirds: Array.from(this.ownedBirds),
            ownedObstacles: Array.from(this.ownedObstacles)
        };
        localStorage.setItem('flappyGameData', JSON.stringify(data));
    }
    
    resetGame() {
        const diff = DIFF[this.difficulty];
        this.birdY = SCREEN_HEIGHT / 2;
        this.birdVel = 0;
        this.pipes = [];
        this.score = 0;
        this.pipeSpeed = diff.spd;
        this.pipeGap = diff.gap;
        this.speedIncrease = diff.inc;
        this.pipeTimer = 0;
        this.gameOver = false;
    }
    
    createParticles(x, y, color, count = 10) {
        if (!this.particlesEnabled) return;
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    // ========== DRAW BACKGROUND - 100% MATCH PYTHON ==========
    drawBackground() {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT - 100);
        gradient.addColorStop(0, C.SKY_TOP);
        gradient.addColorStop(1, C.SKY_BOT);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT - 100);
        
        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            cloud.x = (cloud.x - 0.2);
            if (cloud.x < -100) cloud.x = SCREEN_WIDTH + 100;
            
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, 40, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cloud.x + 20, cloud.y - 10, 30, 20, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Ground
        ctx.fillStyle = C.GROUND;
        ctx.fillRect(0, SCREEN_HEIGHT - 100, SCREEN_WIDTH, 100);
        
        // Ground pattern
        ctx.fillStyle = C.GROUND_DARK;
        for (let x = 0; x < SCREEN_WIDTH; x += 40) {
            ctx.fillRect(x, SCREEN_HEIGHT - 100, 20, 100);
        }
        
        // Waves on ground
        const waveY = SCREEN_HEIGHT - 100;
        ctx.fillStyle = C.ACCENT_SEC;
        for (let x = 0; x < SCREEN_WIDTH; x += 20) {
            const waveOffset = Math.sin((x + this.animTime * 50) * 0.1) * 3;
            ctx.beginPath();
            ctx.arc(x, waveY + waveOffset, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // ========== DRAW BIRD - 100% MATCH PYTHON ==========
    drawBird(x, y) {
        const birdData = BIRDS.find(b => b.id === this.currentBird) || BIRDS[0];
        const color = birdData.color;
        const radius = BIRD_SIZE / 2;
        
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = C.BLACK;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Eye
        const eyeX = x + radius / 2;
        const eyeY = y - radius / 2;
        ctx.fillStyle = C.WHITE;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = C.BLACK;
        ctx.beginPath();
        ctx.arc(eyeX + 1, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = C.ACCENT;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + radius + 10, y);
        ctx.lineTo(x + radius, y + 6);
        ctx.closePath();
        ctx.fill();
    }
    
    // ========== DRAW PIPE - 100% MATCH PYTHON ==========
    drawPipe(x, gapY, gapH) {
        const obstacleData = OBSTACLES.find(o => o.id === this.currentObstacle) || OBSTACLES[0];
        const color = obstacleData.color;
        
        // Top pipe
        ctx.fillStyle = color;
        ctx.fillRect(x, 0, PIPE_WIDTH, gapY);
        ctx.strokeStyle = C.BLACK;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, 0, PIPE_WIDTH, gapY);
        
        // Top pipe cap
        ctx.fillStyle = color;
        ctx.fillRect(x - 5, gapY - 30, PIPE_WIDTH + 10, 30);
        ctx.strokeRect(x - 5, gapY - 30, PIPE_WIDTH + 10, 30);
        
        // Bottom pipe
        const bottomY = gapY + gapH;
        ctx.fillStyle = color;
        ctx.fillRect(x, bottomY, PIPE_WIDTH, SCREEN_HEIGHT - bottomY);
        ctx.strokeRect(x, bottomY, PIPE_WIDTH, SCREEN_HEIGHT - bottomY);
        
        // Bottom pipe cap
        ctx.fillRect(x - 5, bottomY, PIPE_WIDTH + 10, 30);
        ctx.strokeRect(x - 5, bottomY, PIPE_WIDTH + 10, 30);
        
        // Perfect pass indicator
        const centerY = gapY + gapH / 2;
        ctx.fillStyle = C.GOLD;
        ctx.beginPath();
        ctx.arc(x + PIPE_WIDTH / 2, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // ========== MAIN MENU - 100% MATCH PYTHON ==========
    mainMenu() {
        this.drawBackground();
        
        // Title
        ctx.fillStyle = C.PRIMARY;
        ctx.font = 'bold 56px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MODERN FLAPPY BIRD', SCREEN_WIDTH / 2, 120);
        
        // Subtitle
        ctx.fillStyle = C.BLACK;
        ctx.font = '18px "Segoe UI"';
        ctx.fillText('Professional Edition - Web Version', SCREEN_WIDTH / 2, 180);
        
        // Stats
        ctx.fillStyle = C.BLACK;
        ctx.font = '24px "Segoe UI"';
        ctx.fillText(`💰 Coins: ${this.coins}`, SCREEN_WIDTH / 2, 250);
        ctx.fillText(`🏆 High Score: ${this.highscore}`, SCREEN_WIDTH / 2, 290);
        ctx.fillText(`⚡ Difficulty: ${this.difficulty.toUpperCase()}`, SCREEN_WIDTH / 2, 330);
        
        // Buttons - 100% MATCH PYTHON LAYOUT
        const buttons = [
            new Button(SCREEN_WIDTH / 2 - 350, 390, 300, 55, '▶ PLAY', C.SECONDARY, C.ACCENT),
            new Button(SCREEN_WIDTH / 2 + 50, 390, 300, 55, '🏆 LEADERBOARD', C.GOLD, C.ACCENT),
            new Button(SCREEN_WIDTH / 2 - 350, 460, 300, 55, '🛍️ SHOP', C.PRIMARY, C.ACCENT),
            new Button(SCREEN_WIDTH / 2 + 50, 460, 300, 55, '⚙️ SETTINGS', C.ACCENT_SEC, C.ACCENT),
            new Button(SCREEN_WIDTH / 2 - 150, 530, 300, 55, '📜 CREDITS', C.P_PURPLE, C.ACCENT)
        ];
        
        for (const btn of buttons) {
            btn.checkHover(this.mouseX, this.mouseY);
            btn.draw(ctx, 22);
        }
        
        // Store buttons for click handling
        this.currentButtons = buttons;
        
        // Update particles
        this.updateParticles();
    }
    
    // ========== PLAY GAME - 100% MATCH PYTHON ==========
    playGame() {
        this.drawBackground();
        
        if (!this.gameOver) {
            // Bird physics
            this.birdVel += GRAVITY;
            this.birdY += this.birdVel;
            
            // Pipe spawning
            this.pipeTimer++;
            if (this.pipeTimer > 90) {
                const gapY = 150 + Math.random() * (SCREEN_HEIGHT - 250 - this.pipeGap);
                this.pipes.push({
                    x: SCREEN_WIDTH,
                    gapY: gapY,
                    gapH: this.pipeGap,
                    scored: false
                });
                this.pipeTimer = 0;
            }
            
            // Move pipes
            for (const pipe of this.pipes) {
                pipe.x -= this.pipeSpeed;
            }
            
            // Remove off-screen pipes
            this.pipes = this.pipes.filter(p => p.x > -PIPE_WIDTH);
            
            // Collision detection
            const birdRadius = BIRD_SIZE / 2;
            const birdLeft = 200 - birdRadius;
            const birdRight = 200 + birdRadius;
            const birdTop = this.birdY - birdRadius;
            const birdBottom = this.birdY + birdRadius;
            
            // Ground/ceiling collision
            if (this.birdY > SCREEN_HEIGHT - 100 - birdRadius || this.birdY < birdRadius) {
                this.gameOver = true;
                playDeath();
                this.createParticles(200, this.birdY, C.PRIMARY, 30);
                if (this.screenShake) {
                    this.shakeOffset = { x: 10, y: 10 };
                }
            }
            
            // Pipe collision and scoring
            for (const pipe of this.pipes) {
                // Collision check
                if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
                    if (birdTop < pipe.gapY || birdBottom > pipe.gapY + pipe.gapH) {
                        this.gameOver = true;
                        playDeath();
                        this.createParticles(200, this.birdY, C.PRIMARY, 30);
                        if (this.screenShake) {
                            this.shakeOffset = { x: 10, y: 10 };
                        }
                    }
                }
                
                // Scoring logic - CRITICAL: Match Python!
                if (!pipe.scored && pipe.x + PIPE_WIDTH < 200) {
                    pipe.scored = true;
                    this.score++;
                    playPoint();
                    
                    // Check perfect pass
                    const pipeCenter = pipe.gapY + pipe.gapH / 2;
                    const distanceFromCenter = Math.abs(this.birdY - pipeCenter);
                    
                    if (distanceFromCenter < COIN_DISTANCE) {
                        // Perfect pass - 2 coins!
                        this.coins += 2;
                        this.createParticles(200, this.birdY, C.GOLD, 15);
                    } else {
                        // Normal pass - 1 coin
                        this.coins += 1;
                        this.createParticles(200, this.birdY, C.ACCENT, 10);
                    }
                    
                    // Speed increase
                    this.pipeSpeed += this.speedIncrease;
                }
            }
        }
        
        // Apply screen shake
        if (this.shakeOffset.x > 0 || this.shakeOffset.y > 0) {
            ctx.save();
            ctx.translate(
                (Math.random() - 0.5) * this.shakeOffset.x,
                (Math.random() - 0.5) * this.shakeOffset.y
            );
            this.shakeOffset.x *= 0.9;
            this.shakeOffset.y *= 0.9;
            if (this.shakeOffset.x < 0.5) this.shakeOffset.x = 0;
            if (this.shakeOffset.y < 0.5) this.shakeOffset.y = 0;
        }
        
        // Draw pipes
        for (const pipe of this.pipes) {
            this.drawPipe(pipe.x, pipe.gapY, pipe.gapH);
        }
        
        // Draw bird
        this.drawBird(200, this.birdY);
        
        if (this.shakeOffset.x > 0 || this.shakeOffset.y > 0) {
            ctx.restore();
        }
        
        // Draw UI
        ctx.fillStyle = C.WHITE;
        ctx.font = 'bold 56px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(this.score.toString(), SCREEN_WIDTH / 2, 80);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = C.GOLD;
        ctx.font = '24px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText(`💰 ${this.coins}`, 20, 30);
        
        ctx.fillStyle = C.BLACK;
        ctx.font = '18px "Segoe UI"';
        ctx.fillText(`Speed: ${this.pipeSpeed.toFixed(2)}`, 20, 60);
        
        // Game over overlay
        if (this.gameOver) {
            // Dark overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            
            // Game Over text
            ctx.fillStyle = C.PRIMARY;
            ctx.font = 'bold 56px "Segoe UI"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', SCREEN_WIDTH / 2, 200);
            
            // Score
            ctx.fillStyle = C.WHITE;
            ctx.font = 'bold 36px "Segoe UI"';
            ctx.fillText(`Score: ${this.score}`, SCREEN_WIDTH / 2, 280);
            
            // New record check
            const isNewRecord = this.score > this.highscore;
            if (isNewRecord) {
                this.highscore = this.score;
                ctx.fillStyle = C.GOLD;
                ctx.font = '28px "Segoe UI"';
                ctx.fillText('🎉 NEW RECORD! 🎉', SCREEN_WIDTH / 2, 340);
            }
            
            // Game Over Buttons
            const gameOverButtons = [];
            const btnY = isNewRecord ? 400 : 360;
            
            // Restart Button
            const restartBtn = new Button(SCREEN_WIDTH / 2 - 260, btnY, 160, 55, '🔄 RESTART', C.SECONDARY, C.ACCENT);
            restartBtn.checkHover(this.mouseX, this.mouseY);
            restartBtn.draw(ctx, 18);
            gameOverButtons.push({ type: 'restart', btn: restartBtn });
            
            // Menu Button
            const menuBtn = new Button(SCREEN_WIDTH / 2 - 80, btnY, 160, 55, '🏠 MENU', C.PRIMARY, C.ACCENT);
            menuBtn.checkHover(this.mouseX, this.mouseY);
            menuBtn.draw(ctx, 18);
            gameOverButtons.push({ type: 'menu', btn: menuBtn });
            
            // Leaderboard Button (only if eligible)
            const isEligible = this.leaderboard.length < 20 || this.score > this.leaderboard[this.leaderboard.length - 1].score;
            if (isEligible && this.score > 0) {
                const leaderBtn = new Button(SCREEN_WIDTH / 2 + 100, btnY, 160, 55, '🏆 SUBMIT', C.GOLD, C.ACCENT);
                leaderBtn.checkHover(this.mouseX, this.mouseY);
                leaderBtn.draw(ctx, 18);
                gameOverButtons.push({ type: 'leaderboard', btn: leaderBtn });
            }
            
            // Store game over buttons
            this.gameOverButtons = gameOverButtons;
            
            // Hint text
            ctx.fillStyle = C.GRAY;
            ctx.font = '16px "Segoe UI"';
            ctx.fillText('Keyboard: R = Restart | ESC = Menu | L = Submit Score', SCREEN_WIDTH / 2, btnY + 80);
            
            this.saveData();
        }
        
        // Update particles
        this.updateParticles();
    }
    
    // ========== SHOP MENU - 100% MATCH PYTHON ==========
    shopMenu() {
        this.drawBackground();
        
        // Title
        ctx.fillStyle = C.PRIMARY;
        ctx.font = 'bold 56px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('🛍️ SHOP', SCREEN_WIDTH / 2, 60);
        
        // Coins display
        ctx.fillStyle = C.GOLD;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.fillText(`💰 ${this.coins} Coins`, SCREEN_WIDTH / 2, 130);
        
        const buttons = [];
        
        // Birds section
        ctx.fillStyle = C.SECONDARY;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('BIRDS', 100, 210);
        
        let birdY = 260;
        for (const bird of BIRDS) {
            const isOwned = this.ownedBirds.has(bird.id);
            const isSelected = bird.id === this.currentBird;
            
            // Item box
            let boxColor = C.ACCENT_SEC;
            if (isSelected) boxColor = C.GOLD;
            else if (isOwned) boxColor = C.SECONDARY;
            
            ctx.fillStyle = boxColor;
            ctx.beginPath();
            ctx.roundRect(80, birdY, 500, 80, 10);
            ctx.fill();
            ctx.strokeStyle = C.BLACK;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Bird preview
            ctx.fillStyle = bird.color;
            ctx.beginPath();
            ctx.arc(130, birdY + 40, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = C.BLACK;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Name
            ctx.fillStyle = C.BLACK;
            ctx.font = '24px "Segoe UI"';
            ctx.textAlign = 'left';
            ctx.fillText(bird.name, 180, birdY + 30);
            
            if (isSelected) {
                ctx.fillStyle = C.BLACK;
                ctx.font = '18px "Segoe UI"';
                ctx.fillText('✓ EQUIPPED', 180, birdY + 60);
            } else if (isOwned) {
                const btn = new Button(400, birdY + 20, 150, 40, 'EQUIP', C.PRIMARY, C.ACCENT);
                btn.checkHover(this.mouseX, this.mouseY);
                btn.draw(ctx, 16);
                buttons.push({ type: 'equipBird', id: bird.id, btn, color: bird.color });
            } else {
                ctx.fillStyle = C.BLACK;
                ctx.font = '18px "Segoe UI"';
                ctx.fillText(`$${bird.price}`, 180, birdY + 60);
                
                const canBuy = this.coins >= bird.price;
                const btn = new Button(400, birdY + 20, 150, 40, 'BUY', 
                    canBuy ? C.P_GREEN : C.BLACK, canBuy ? C.ACCENT : C.BLACK);
                btn.checkHover(this.mouseX, this.mouseY);
                btn.draw(ctx, 16);
                buttons.push({ type: 'buyBird', id: bird.id, btn, price: bird.price, canBuy });
            }
            
            birdY += 95;
        }
        
        // Obstacles section
        ctx.fillStyle = C.PRIMARY;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('OBSTACLES', 700, 210);
        
        let obsY = 260;
        for (const obs of OBSTACLES) {
            const isOwned = this.ownedObstacles.has(obs.id);
            const isSelected = obs.id === this.currentObstacle;
            
            // Item box
            let boxColor = C.ACCENT_SEC;
            if (isSelected) boxColor = C.GOLD;
            else if (isOwned) boxColor = C.PRIMARY;
            
            ctx.fillStyle = boxColor;
            ctx.beginPath();
            ctx.roundRect(680, obsY, 500, 80, 10);
            ctx.fill();
            ctx.strokeStyle = C.BLACK;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Obstacle preview
            ctx.fillStyle = obs.color;
            ctx.beginPath();
            ctx.roundRect(710, obsY + 15, 30, 50, 5);
            ctx.fill();
            ctx.strokeStyle = C.BLACK;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Name
            ctx.fillStyle = C.BLACK;
            ctx.font = '24px "Segoe UI"';
            ctx.textAlign = 'left';
            ctx.fillText(obs.name, 760, obsY + 30);
            
            if (isSelected) {
                ctx.fillStyle = C.BLACK;
                ctx.font = '18px "Segoe UI"';
                ctx.fillText('✓ EQUIPPED', 760, obsY + 60);
            } else if (isOwned) {
                const btn = new Button(1000, obsY + 20, 150, 40, 'EQUIP', C.SECONDARY, C.ACCENT);
                btn.checkHover(this.mouseX, this.mouseY);
                btn.draw(ctx, 16);
                buttons.push({ type: 'equipObs', id: obs.id, btn, color: obs.color });
            } else {
                ctx.fillStyle = C.BLACK;
                ctx.font = '18px "Segoe UI"';
                ctx.fillText(`$${obs.price}`, 760, obsY + 60);
                
                const canBuy = this.coins >= obs.price;
                const btn = new Button(1000, obsY + 20, 150, 40, 'BUY', 
                    canBuy ? C.P_GREEN : C.BLACK, canBuy ? C.ACCENT : C.BLACK);
                btn.checkHover(this.mouseX, this.mouseY);
                btn.draw(ctx, 16);
                buttons.push({ type: 'buyObs', id: obs.id, btn, price: obs.price, canBuy });
            }
            
            obsY += 95;
        }
        
        // Back button
        const backBtn = new Button(SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT - 80, 200, 50, 'BACK', C.BLACK, C.ACCENT);
        backBtn.checkHover(this.mouseX, this.mouseY);
        backBtn.draw(ctx, 22);
        buttons.push({ type: 'back', btn: backBtn });
        
        this.currentButtons = buttons;
        this.updateParticles();
    }
    
    // ========== SETTINGS MENU - 100% MATCH PYTHON ==========
    settingsMenu() {
        this.drawBackground();
        
        // Title
        ctx.fillStyle = C.ACCENT_SEC;
        ctx.font = 'bold 56px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('⚙️ SETTINGS', SCREEN_WIDTH / 2, 80);
        
        const buttons = [];
        
        // Section 1: Difficulty
        let sectionY = 180;
        ctx.fillStyle = C.BLACK;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('🎮 Difficulty', 100, sectionY);
        
        const diffButtons = [
            new Button(400, sectionY - 25, 110, 50, 'EASY', C.P_GREEN, C.ACCENT),
            new Button(530, sectionY - 25, 110, 50, 'NORMAL', C.P_BLUE, C.ACCENT),
            new Button(660, sectionY - 25, 130, 50, 'HARDCORE', C.P_PINK, C.ACCENT)
        ];
        const diffNames = ['easy', 'normal', 'hardcore'];
        
        for (let i = 0; i < diffButtons.length; i++) {
            const isSelected = diffNames[i] === this.difficulty;
            if (isSelected) {
                ctx.strokeStyle = C.GOLD;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.roundRect(diffButtons[i].x - 4, diffButtons[i].y - 4, 
                             diffButtons[i].w + 8, diffButtons[i].h + 8, 15);
                ctx.stroke();
            }
            diffButtons[i].checkHover(this.mouseX, this.mouseY);
            diffButtons[i].draw(ctx, 16);
            buttons.push({ type: 'difficulty', name: diffNames[i], btn: diffButtons[i] });
        }
        
        // Section 2: Audio
        sectionY = 280;
        ctx.fillStyle = C.BLACK;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('🔊 Audio', 100, sectionY);
        
        ctx.font = '24px "Segoe UI"';
        ctx.fillText(`Music: ${this.musicVolume}%`, 400, sectionY + 5);
        
        const musicMinus = new Button(600, sectionY - 20, 40, 40, '-', C.PRIMARY, C.ACCENT);
        const musicPlus = new Button(650, sectionY - 20, 40, 40, '+', C.PRIMARY, C.ACCENT);
        musicMinus.checkHover(this.mouseX, this.mouseY);
        musicPlus.checkHover(this.mouseX, this.mouseY);
        musicMinus.draw(ctx, 24);
        musicPlus.draw(ctx, 24);
        buttons.push({ type: 'musicMinus', btn: musicMinus });
        buttons.push({ type: 'musicPlus', btn: musicPlus });
        
        ctx.fillText(`SFX: ${this.sfxVolume}%`, 750, sectionY + 5);
        
        const sfxMinus = new Button(900, sectionY - 20, 40, 40, '-', C.SECONDARY, C.ACCENT);
        const sfxPlus = new Button(950, sectionY - 20, 40, 40, '+', C.SECONDARY, C.ACCENT);
        sfxMinus.checkHover(this.mouseX, this.mouseY);
        sfxPlus.checkHover(this.mouseX, this.mouseY);
        sfxMinus.draw(ctx, 24);
        sfxPlus.draw(ctx, 24);
        buttons.push({ type: 'sfxMinus', btn: sfxMinus });
        buttons.push({ type: 'sfxPlus', btn: sfxPlus });
        
        // Section 3: Graphics
        sectionY = 380;
        ctx.fillStyle = C.BLACK;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('🎨 Graphics', 100, sectionY);
        
        const particlesBtn = new Button(400, sectionY - 25, 180, 50, 
            `Particles: ${this.particlesEnabled ? 'ON' : 'OFF'}`,
            this.particlesEnabled ? C.ACCENT_SEC : C.BLACK, C.ACCENT);
        const shakeBtn = new Button(600, sectionY - 25, 200, 50,
            `Screen Shake: ${this.screenShake ? 'ON' : 'OFF'}`,
            this.screenShake ? C.ACCENT_SEC : C.BLACK, C.ACCENT);
        
        particlesBtn.checkHover(this.mouseX, this.mouseY);
        shakeBtn.checkHover(this.mouseX, this.mouseY);
        particlesBtn.draw(ctx, 16);
        shakeBtn.draw(ctx, 16);
        buttons.push({ type: 'particles', btn: particlesBtn });
        buttons.push({ type: 'shake', btn: shakeBtn });
        
        // Section 4: Display
        sectionY = 480;
        ctx.fillStyle = C.BLACK;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('🖥️ Display', 100, sectionY);
        
        const fullscreenBtn = new Button(400, sectionY - 25, 200, 50,
            `Fullscreen: ${this.fullscreen ? 'ON' : 'OFF'}`,
            this.fullscreen ? C.P_PURPLE : C.BLACK, C.ACCENT);
        fullscreenBtn.checkHover(this.mouseX, this.mouseY);
        fullscreenBtn.draw(ctx, 16);
        buttons.push({ type: 'fullscreen', btn: fullscreenBtn });
        
        // Info text
        ctx.fillStyle = C.GRAY;
        ctx.font = '18px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('Note: Some settings require restart', SCREEN_WIDTH / 2, 560);
        
        // Back button
        const backBtn = new Button(SCREEN_WIDTH / 2 - 100, 620, 200, 50, '← BACK', C.BLACK, C.ACCENT);
        backBtn.checkHover(this.mouseX, this.mouseY);
        backBtn.draw(ctx, 22);
        buttons.push({ type: 'back', btn: backBtn });
        
        this.currentButtons = buttons;
        this.updateParticles();
    }
    
    // ========== CREDITS SCREEN - 100% MATCH PYTHON ==========
    creditsScreen() {
        this.drawBackground();
        
        // Title
        ctx.fillStyle = C.GOLD;
        ctx.font = 'bold 56px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 CREDITS', SCREEN_WIDTH / 2, 100);
        
        // Credits data
        const credits = [
            { role: 'Developer', name: 'Daffa Aditya Pratama' },
            { role: 'Perancang Ide', name: 'Nazriel Irham' },
            { role: 'Designer', name: 'Samsul Bahrur' },
            { role: 'Sound System', name: 'Web Audio API Synthesis' },
            { role: 'Engine', name: 'JavaScript + Canvas' }
        ];
        
        // Draw credits with wave animation
        for (let i = 0; i < credits.length; i++) {
            const credit = credits[i];
            const y = 250 + i * 100;
            const wave = Math.sin(this.animTime * 2 + i) * 5;
            
            // Name
            ctx.fillStyle = C.WHITE;
            ctx.font = 'bold 36px "Segoe UI"';
            ctx.fillText(credit.name, SCREEN_WIDTH / 2, y + wave);
            
            // Role
            ctx.fillStyle = C.SECONDARY;
            ctx.font = '24px "Segoe UI"';
            ctx.fillText(credit.role, SCREEN_WIDTH / 2, y + 40 + wave);
        }
        
        // Footer
        ctx.fillStyle = C.ACCENT;
        ctx.font = '18px "Segoe UI"';
        ctx.fillText('Made with ❤️ and lots of ☕', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 100);
        
        // Back button
        const backBtn = new Button(SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT - 60, 200, 50, '← BACK', C.BLACK, C.ACCENT);
        backBtn.checkHover(this.mouseX, this.mouseY);
        backBtn.draw(ctx, 22);
        
        this.currentButtons = [{ type: 'back', btn: backBtn }];
        this.updateParticles();
    }
    
    // ========== LEADERBOARD SCREEN - 100% MATCH PYTHON ==========
    leaderboardScreen() {
        this.drawBackground();
        
        // Title
        ctx.fillStyle = C.GOLD;
        ctx.font = 'bold 56px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 LEADERBOARD', SCREEN_WIDTH / 2, 80);
        
        // Subtitle
        ctx.fillStyle = C.BLACK;
        ctx.font = '18px "Segoe UI"';
        ctx.fillText('Top Players - Compete untuk jadi #1!', SCREEN_WIDTH / 2, 140);
        
        // Table
        const tableX = 240;
        const tableY = 190;
        const tableWidth = 800;
        const headerHeight = 50;
        const rowHeight = 45;
        
        // Header background
        ctx.fillStyle = C.PRIMARY;
        ctx.beginPath();
        ctx.roundRect(tableX, tableY, tableWidth, headerHeight, 10);
        ctx.fill();
        ctx.strokeStyle = C.BLACK;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Header text
        ctx.fillStyle = C.WHITE;
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('RANK', tableX + 40, tableY + 32);
        ctx.fillText('NAMA', tableX + 250, tableY + 32);
        ctx.fillText('SKOR', tableX + 620, tableY + 32);
        
        // Display top 10
        let currentY = tableY + headerHeight + 5;
        const displayCount = Math.min(10, this.leaderboard.length);
        
        for (let i = 0; i < displayCount; i++) {
            const entry = this.leaderboard[i];
            const rank = i + 1;
            
            // Row colors
            let rowColor, textColor;
            if (rank === 1) {
                rowColor = C.GOLD;
                textColor = C.BLACK;
            } else if (rank === 2) {
                rowColor = C.SILVER;
                textColor = C.BLACK;
            } else if (rank === 3) {
                rowColor = C.BRONZE;
                textColor = C.WHITE;
            } else if (i % 2 === 0) {
                rowColor = C.ACCENT_SEC;
                textColor = C.BLACK;
            } else {
                rowColor = 'rgba(255, 255, 255, 0.8)';
                textColor = C.BLACK;
            }
            
            // Row background
            ctx.fillStyle = rowColor;
            ctx.beginPath();
            ctx.roundRect(tableX, currentY, tableWidth, rowHeight, 8);
            ctx.fill();
            ctx.strokeStyle = C.BLACK;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Rank display with emoji for top 3
            let rankDisplay;
            if (rank === 1) rankDisplay = '🥇 1';
            else if (rank === 2) rankDisplay = '🥈 2';
            else if (rank === 3) rankDisplay = '🥉 3';
            else rankDisplay = rank.toString();
            
            ctx.fillStyle = textColor;
            ctx.font = rank <= 3 ? 'bold 24px "Segoe UI"' : '18px "Segoe UI"';
            ctx.textAlign = 'left';
            ctx.fillText(rankDisplay, tableX + 40, currentY + 30);
            ctx.fillText(entry.name.substring(0, 20), tableX + 180, currentY + 30);
            ctx.fillText(entry.score.toLocaleString(), tableX + 600, currentY + 30);
            
            currentY += rowHeight + 3;
        }
        
        // Info text
        ctx.fillStyle = C.GRAY;
        ctx.font = '18px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('Mainkan game untuk masuk leaderboard!', SCREEN_WIDTH / 2, currentY + 20);
        
        // Back button
        const backBtn = new Button(SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT - 80, 200, 50, '← BACK', C.BLACK, C.ACCENT);
        backBtn.checkHover(this.mouseX, this.mouseY);
        backBtn.draw(ctx, 22);
        
        this.currentButtons = [{ type: 'back', btn: backBtn }];
        this.updateParticles();
    }
    
    // ========== NAME INPUT SCREEN - 100% MATCH PYTHON ==========
    nameInputScreen() {
        this.drawBackground();
        
        // Show HTML overlay for mobile keyboard support
        this.showNameInputOverlay();
        
        // Title
        ctx.fillStyle = C.GOLD;
        ctx.font = 'bold 56px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 NEW HIGH SCORE!', SCREEN_WIDTH / 2, 150);
        
        // Score display
        ctx.fillStyle = C.PRIMARY;
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.fillText(`Score: ${this.score}`, SCREEN_WIDTH / 2, 230);
        
        // Instruction
        ctx.fillStyle = C.BLACK;
        ctx.font = '24px "Segoe UI"';
        ctx.fillText('Masukkan nama kamu:', SCREEN_WIDTH / 2, 300);
        
        // Input box
        ctx.fillStyle = C.WHITE;
        ctx.beginPath();
        ctx.roundRect(SCREEN_WIDTH / 2 - 200, 350, 400, 60, 10);
        ctx.fill();
        ctx.strokeStyle = C.PRIMARY;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Display current input with cursor
        ctx.fillStyle = C.BLACK;
        ctx.font = '32px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cursor = Math.floor(this.animTime * 2) % 2 === 0 ? '|' : '';
        ctx.fillText(this.playerName + cursor, SCREEN_WIDTH / 2, 380);
        
        // Hint
        ctx.fillStyle = C.GRAY;
        ctx.font = '18px "Segoe UI"';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('Tekan ENTER untuk submit, ESC untuk skip', SCREEN_WIDTH / 2, 450);
        
        this.currentButtons = [];
        this.updateParticles();
    }
    
    // ========== SHOW/HIDE NAME INPUT OVERLAY ==========
    showNameInputOverlay() {
        const overlay = document.getElementById('nameInputOverlay');
        const scoreDisplay = document.getElementById('overlayScore');
        const inputField = document.getElementById('nameInputField');
        
        if (overlay && !overlay.classList.contains('active')) {
            overlay.classList.add('active');
            scoreDisplay.textContent = `Score: ${this.score}`;
            inputField.value = this.playerName;
            // Focus input to trigger mobile keyboard
            setTimeout(() => inputField.focus(), 100);
        }
    }
    
    hideNameInputOverlay() {
        const overlay = document.getElementById('nameInputOverlay');
        const inputField = document.getElementById('nameInputField');
        
        if (overlay) {
            overlay.classList.remove('active');
            inputField.blur();
        }
    }
    
    // ========== UPDATE PARTICLES ==========
    updateParticles() {
        this.particles = this.particles.filter(p => p.update());
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
    
    // ========== MAIN LOOP ==========
    update() {
        this.animTime += 1 / FPS;
    }
    
    draw() {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        
        switch (this.state) {
            case 'menu':
                this.mainMenu();
                break;
            case 'play':
                this.playGame();
                break;
            case 'shop':
                this.shopMenu();
                break;
            case 'settings':
                this.settingsMenu();
                break;
            case 'credits':
                this.creditsScreen();
                break;
            case 'leaderboard':
                this.leaderboardScreen();
                break;
            case 'nameInput':
                this.nameInputScreen();
                break;
        }
    }
    
    // ========== INPUT HANDLERS ==========
    handleClick(x, y) {
        initAudio();
        
        if (this.state === 'menu') {
            // Menu buttons
            if (this.currentButtons[0]?.isClicked(x, y)) {
                this.resetGame();
                this.state = 'play';
                this.createParticles(SCREEN_WIDTH / 2 - 200, 390, C.SECONDARY, 20);
            } else if (this.currentButtons[1]?.isClicked(x, y)) {
                this.state = 'leaderboard';
                this.createParticles(SCREEN_WIDTH / 2 + 200, 390, C.GOLD, 20);
            } else if (this.currentButtons[2]?.isClicked(x, y)) {
                this.state = 'shop';
                this.createParticles(SCREEN_WIDTH / 2 - 200, 460, C.PRIMARY, 20);
            } else if (this.currentButtons[3]?.isClicked(x, y)) {
                this.state = 'settings';
                this.createParticles(SCREEN_WIDTH / 2 + 200, 460, C.ACCENT_SEC, 20);
            } else if (this.currentButtons[4]?.isClicked(x, y)) {
                this.state = 'credits';
                this.createParticles(SCREEN_WIDTH / 2, 530, C.P_PURPLE, 20);
            }
        } else if (this.state === 'play') {
            if (!this.gameOver) {
                this.birdVel = JUMP_FORCE;
                playJump();
                this.createParticles(200, this.birdY, C.ACCENT, 5);
            } else {
                // Handle game over buttons
                if (this.gameOverButtons) {
                    for (const item of this.gameOverButtons) {
                        if (item.btn.isClicked(x, y)) {
                            if (item.type === 'restart') {
                                this.resetGame();
                                this.createParticles(SCREEN_WIDTH / 2, 400, C.SECONDARY, 20);
                            } else if (item.type === 'menu') {
                                this.state = 'menu';
                                this.createParticles(SCREEN_WIDTH / 2, 400, C.PRIMARY, 20);
                            } else if (item.type === 'leaderboard') {
                                this.nameInputActive = true;
                                this.state = 'nameInput';
                                this.createParticles(SCREEN_WIDTH / 2, 300, C.GOLD, 30);
                            }
                            break;
                        }
                    }
                }
            }
        } else if (this.state === 'shop') {
            for (const item of this.currentButtons) {
                if (item.btn.isClicked(x, y)) {
                    if (item.type === 'back') {
                        this.state = 'menu';
                        this.createParticles(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 60, C.BLACK, 20);
                    } else if (item.type === 'equipBird') {
                        this.currentBird = item.id;
                        this.saveData();
                        this.createParticles(330, 300, item.color, 20);
                    } else if (item.type === 'buyBird' && item.canBuy) {
                        this.coins -= item.price;
                        this.ownedBirds.add(item.id);
                        this.currentBird = item.id;
                        this.saveData();
                        this.createParticles(330, 300, C.GOLD, 30);
                    } else if (item.type === 'equipObs') {
                        this.currentObstacle = item.id;
                        this.saveData();
                        this.createParticles(930, 300, item.color, 20);
                    } else if (item.type === 'buyObs' && item.canBuy) {
                        this.coins -= item.price;
                        this.ownedObstacles.add(item.id);
                        this.currentObstacle = item.id;
                        this.saveData();
                        this.createParticles(930, 300, C.GOLD, 30);
                    }
                    break;
                }
            }
        } else if (this.state === 'settings') {
            for (const item of this.currentButtons) {
                if (item.btn.isClicked(x, y)) {
                    if (item.type === 'back') {
                        this.state = 'menu';
                        this.createParticles(SCREEN_WIDTH / 2, 640, C.BLACK, 20);
                    } else if (item.type === 'difficulty') {
                        this.difficulty = item.name;
                        this.createParticles(item.btn.x + item.btn.w / 2, item.btn.y + item.btn.h / 2, 
                            item.name === 'easy' ? C.P_GREEN : item.name === 'normal' ? C.P_BLUE : C.P_PINK, 20);
                    } else if (item.type === 'musicMinus') {
                        this.musicVolume = Math.max(0, this.musicVolume - 10);
                    } else if (item.type === 'musicPlus') {
                        this.musicVolume = Math.min(100, this.musicVolume + 10);
                    } else if (item.type === 'sfxMinus') {
                        this.sfxVolume = Math.max(0, this.sfxVolume - 10);
                    } else if (item.type === 'sfxPlus') {
                        this.sfxVolume = Math.min(100, this.sfxVolume + 10);
                    } else if (item.type === 'particles') {
                        this.particlesEnabled = !this.particlesEnabled;
                        this.createParticles(item.btn.x + item.btn.w / 2, item.btn.y + item.btn.h / 2, C.ACCENT_SEC, 15);
                    } else if (item.type === 'shake') {
                        this.screenShake = !this.screenShake;
                        this.createParticles(item.btn.x + item.btn.w / 2, item.btn.y + item.btn.h / 2, C.ACCENT_SEC, 15);
                    } else if (item.type === 'fullscreen') {
                        this.fullscreen = !this.fullscreen;
                        if (this.fullscreen) {
                            document.documentElement.requestFullscreen?.();
                        } else {
                            document.exitFullscreen?.();
                        }
                        this.createParticles(item.btn.x + item.btn.w / 2, item.btn.y + item.btn.h / 2, C.P_PURPLE, 20);
                    }
                    break;
                }
            }
        } else if (this.state === 'credits' || this.state === 'leaderboard') {
            for (const item of this.currentButtons) {
                if (item.type === 'back' && item.btn.isClicked(x, y)) {
                    this.state = 'menu';
                    this.createParticles(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 40, C.BLACK, 20);
                    break;
                }
            }
        }
    }
    
    handleKeyDown(key) {
        if (this.state === 'play') {
            if ((key === ' ' || key === 'Space') && !this.gameOver) {
                this.birdVel = JUMP_FORCE;
                playJump();
                this.createParticles(200, this.birdY, C.ACCENT, 5);
            } else if (key === 'Escape') {
                this.state = 'menu';
            } else if ((key === 'r' || key === 'R') && this.gameOver) {
                this.resetGame();
            } else if ((key === 'l' || key === 'L') && this.gameOver) {
                // Check if eligible for leaderboard
                if (this.leaderboard.length < 20 || this.score > this.leaderboard[this.leaderboard.length - 1].score) {
                    this.nameInputActive = true;
                    this.state = 'nameInput';
                    this.createParticles(SCREEN_WIDTH / 2, 300, C.GOLD, 30);
                }
            }
        } else if (this.state === 'nameInput') {
            // Skip keyboard handling here - let HTML input handle it
            // Only handle ESC for cancel
            if (key === 'Escape') {
                this.nameInputActive = false;
                this.playerName = "";
                this.hideNameInputOverlay();
                this.state = 'menu';
            }
        } else if (this.state !== 'menu') {
            if (key === 'Escape') {
                this.state = 'menu';
            }
        }
    }
    
    handleMouseMove(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }
}

// ========== GAME INITIALIZATION ==========
const game = new Game();

// ========== RESPONSIVE CANVAS ==========
function resizeCanvas() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const gameAspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    const windowAspect = containerWidth / containerHeight;
    
    if (windowAspect > gameAspect) {
        canvas.style.height = containerHeight + 'px';
        canvas.style.width = (containerHeight * gameAspect) + 'px';
    } else {
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = (containerWidth / gameAspect) + 'px';
    }
}

// ========== EVENT LISTENERS ==========
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = SCREEN_WIDTH / rect.width;
    const scaleY = SCREEN_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    game.handleClick(x, y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = SCREEN_WIDTH / rect.width;
    const scaleY = SCREEN_HEIGHT / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    game.handleClick(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = SCREEN_WIDTH / rect.width;
    const scaleY = SCREEN_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    game.handleMouseMove(x, y);
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
    }
    game.handleKeyDown(e.key);
});

window.addEventListener('resize', resizeCanvas);
document.addEventListener('fullscreenchange', () => {
    game.fullscreen = !!document.fullscreenElement;
    resizeCanvas();
});

// ========== NAME INPUT OVERLAY EVENT LISTENERS ==========
const nameInputField = document.getElementById('nameInputField');
const submitNameBtn = document.getElementById('submitNameBtn');
const cancelNameBtn = document.getElementById('cancelNameBtn');

// Sync input field with game state
nameInputField.addEventListener('input', (e) => {
    game.playerName = e.target.value.substring(0, 20);
});

// Submit button
submitNameBtn.addEventListener('click', () => {
    if (game.playerName.trim()) {
        game.addToLeaderboard(game.playerName.trim(), game.score);
        game.createParticles(SCREEN_WIDTH / 2, 350, C.GOLD, 30);
    }
    game.nameInputActive = false;
    game.playerName = "";
    game.hideNameInputOverlay();
    game.state = 'leaderboard';
});

// Cancel button
cancelNameBtn.addEventListener('click', () => {
    game.nameInputActive = false;
    game.playerName = "";
    game.hideNameInputOverlay();
    game.state = 'menu';
});

// Handle Enter key in input field
nameInputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitNameBtn.click();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelNameBtn.click();
    }
});

// ========== GAME LOOP ==========
function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

// ========== START ==========
console.log('');
console.log('============================================');
console.log('🎮 MODERN FLAPPY BIRD - STARTED!');
console.log('============================================');
console.log('Developer: Daffa Aditya Pratama');
console.log('Designer: Samsul Bahrur');
console.log('============================================');
console.log('100% Synchronized dengan Python/Pygame Version');
console.log('============================================');
console.log('');

resizeCanvas();
gameLoop();
