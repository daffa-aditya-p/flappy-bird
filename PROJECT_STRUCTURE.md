# 📁 Project Structure - Modern Flappy Bird

## 🏗️ Architecture Overview

Proyek ini menggunakan arsitektur **modular** dengan pemisahan concerns yang jelas:
- **HTML** untuk struktur
- **CSS** untuk styling
- **JavaScript** untuk logic

```
build/web/
├── index.html              ⭐ Main entry point (RECOMMENDED)
├── main.js                 🎮 Game logic (1,100+ lines)
├── style.css               🎨 Styling (160+ lines)
│
├── index-selection.html    📋 Game version selector
├── index-pygbag.html       🐍 Old Pygbag version (backup)
│
├── game-modern.html        💫 All-in-one version (1,029 lines)
├── game.html               ⚡ Simple version (229 lines)
├── game-full.html          ✨ Extended version
│
├── README.md               📚 Documentation
├── PROJECT_STRUCTURE.md    📁 This file
├── favicon.png             🖼️ Game icon
└── mini-project.apk        📦 Android build (if available)
```

---

## 📄 File Descriptions

### 🌟 Main Files (Modular Architecture)

#### 1. `index.html` (51 lines)
**Purpose:** Clean HTML5 structure untuk game

**Features:**
- SEO-optimized meta tags
- Open Graph & Twitter Cards
- Loading screen markup
- Canvas element dengan accessibility
- Preload optimization
- Mobile-friendly viewport

**Usage:**
```bash
# Buka langsung di browser
firefox index.html

# Atau via local server
python3 -m http.server 8000
# http://localhost:8000/index.html
```

---

#### 2. `main.js` (1,100+ lines)
**Purpose:** Complete game logic dan sistem

**Structure:**
```javascript
// ============================================
// SECTIONS
// ============================================

1. Canvas & Context Setup
2. Color System (Discord-inspired palette)
3. Game Constants & State
4. Player Data & Settings
5. Difficulty Settings
6. Shop Items
7. UI System (Button class)
8. Audio System (Web Audio API)
9. Particle System (Particle class)
10. Drawing Utilities
11. Menu Screens (Main, Settings, Shop, Credits)
12. Game Logic (startGame, updateGame, collision)
13. Game Rendering (drawGame, drawHUD, drawGameOver)
14. Main Loop (update, draw, gameLoop)
15. Input Handlers (click, touch, keyboard)
16. Initialization
```

**Key Features:**
- **State Management:** Clean state machine (MAIN_MENU, PLAYING, GAME_OVER, etc.)
- **OOP Design:** Button & Particle classes
- **Event-driven:** Responsive input system
- **Optimized:** 60 FPS game loop with requestAnimationFrame
- **Well-documented:** Comprehensive comments

**API Reference:**
```javascript
// Public Functions
init()                    // Initialize game
startGame()               // Start gameplay
jump()                    // Bird jump action
playSound(type)           // Play sound effect
createParticles(x,y,n,c)  // Spawn particles

// Game States
'MAIN_MENU'    // Main menu screen
'SETTINGS'     // Settings menu
'SHOP'         // Shop menu
'CREDITS'      // Credits screen
'PLAYING'      // Active gameplay
'GAME_OVER'    // Game over screen
```

---

#### 3. `style.css` (160+ lines)
**Purpose:** Modern styling & animations

**Features:**
```css
/* Sections */
1. Global Reset
2. Body Gradient Background
3. Canvas Styling (border, shadow, rounded)
4. Loading Screen Animations
5. Responsive Design (mobile breakpoints)
6. Custom Scrollbar
7. Utility Classes (hidden, fade-in, slide-up)
8. Accessibility (focus states)
9. Print Styles
```

**Responsive Breakpoints:**
```css
/* Tablet */
@media (max-width: 768px) {
    #gameCanvas {
        border-width: 2px;
        border-radius: 5px;
    }
}

/* Mobile */
@media (max-width: 480px) {
    #gameCanvas {
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
        border: none;
    }
}
```

**Animations:**
- `spin`: Loading spinner rotation
- `pulse`: Text opacity pulsing
- `fadeIn`: Element fade-in
- `slideUp`: Element slide from bottom

---

### 🎮 Alternative Versions

#### 4. `game-modern.html` (1,029 lines)
**All-in-one file** dengan HTML, CSS, dan JS dalam satu file.

**Pros:**
✅ Single file (mudah share)
✅ No external dependencies
✅ Works offline immediately

**Cons:**
❌ Harder to maintain
❌ Larger file size
❌ No browser caching benefit

**Use Case:** Quick deployment, sharing via email/USB

---

#### 5. `game.html` (229 lines)
**Simple version** untuk quick gameplay.

**Features:**
- Lightweight (10KB)
- Basic gameplay only
- No menu system
- Instant start

**Use Case:** Testing, quick demo, minimal version

---

#### 6. `game-full.html`
**Extended version** dengan fitur tambahan.

**Use Case:** Experimental features, beta testing

---

#### 7. `index-selection.html`
**Beautiful landing page** untuk memilih versi game.

**Features:**
- Card-based layout
- Hover animations
- Responsive grid
- Version comparison

**Use Case:** Portfolio showcase, game hub

---

## 🔧 Development Workflow

### Setup
```bash
# Clone repository
git clone https://github.com/daffa-aditya-p/mini-project
cd mini-project/build/web

# Start local server
python3 -m http.server 8000
# Open: http://localhost:8000
```

### Editing Files

**HTML Changes:**
```bash
# Edit structure
nano index.html
# Test immediately in browser (Ctrl+Shift+R to hard refresh)
```

**JavaScript Changes:**
```bash
# Edit game logic
nano main.js
# Browser will cache - use Ctrl+Shift+R
```

**CSS Changes:**
```bash
# Edit styles
nano style.css
# Changes apply instantly (soft refresh OK)
```

### Testing
```bash
# Desktop browsers
firefox index.html
google-chrome index.html

# Mobile testing (via ngrok)
ngrok http 8000
# Open ngrok URL on phone
```

### Debugging

**Browser Console:**
```javascript
// Check game state
console.log(gameState)

// Check player stats
console.log(player)

// Check settings
console.log(settings)

// Manual jump
jump()

// Force game over
endGame()
```

**Performance Profiling:**
```javascript
// Chrome DevTools > Performance
// Record 10 seconds of gameplay
// Check for frame drops, memory leaks
```

---

## 🚀 Deployment

### GitHub Pages
```bash
# Enable in Settings > Pages
# Branch: main
# Folder: /build/web
# URL: https://username.github.io/repo/
```

### Netlify
```bash
# Drop folder: build/web
# Auto-deploy: git push
```

### Vercel
```bash
vercel deploy build/web
```

### Self-hosted
```bash
# Nginx
server {
    root /var/www/flappy-bird/build/web;
    index index.html;
}

# Apache
DocumentRoot "/var/www/flappy-bird/build/web"
DirectoryIndex index.html
```

---

## 📊 File Size Comparison

```
┌────────────────────────────────────────┐
│ File              │ Size    │ Lines   │
├────────────────────────────────────────┤
│ index.html        │ 1.5 KB  │ 51      │
│ main.js           │ 38 KB   │ 1,100+  │
│ style.css         │ 4 KB    │ 160+    │
│ ─────────────────────────────────────  │
│ TOTAL (modular)   │ 43.5 KB │ 1,311   │
│ ═════════════════════════════════════  │
│ game-modern.html  │ 45 KB   │ 1,029   │
│ game.html         │ 10 KB   │ 229     │
└────────────────────────────────────────┘
```

**Analysis:**
- Modular approach: Slightly larger BUT better caching
- After first load: CSS & JS cached (only 1.5KB HTML loads)
- All-in-one: Always 45KB download

**Verdict:** Modular wins for production! 🏆

---

## 🎯 Best Practices

### 1. Code Organization
```javascript
// ✅ GOOD: Clear sections with headers
// ============================================
// AUDIO SYSTEM
// ============================================
function playSound(type) { ... }

// ❌ BAD: No structure
function playSound(type) { ... }
function jump() { ... }
function draw() { ... }
```

### 2. Naming Conventions
```javascript
// Constants: UPPER_SNAKE_CASE
const GRAVITY = 0.5;
const COLORS = { ... };

// Classes: PascalCase
class Button { ... }
class Particle { ... }

// Functions: camelCase
function drawGame() { ... }
function checkCollision() { ... }

// Variables: camelCase
let gameState = 'MAIN_MENU';
let player = { ... };
```

### 3. Comments
```javascript
// ✅ GOOD: Explain WHY, not WHAT
// Screen shake decay for smooth stop
if (screenShakeAmount > 0) {
    screenShakeAmount *= 0.9;
}

// ❌ BAD: Obvious comments
// Multiply screenShakeAmount by 0.9
screenShakeAmount *= 0.9;
```

### 4. Performance
```javascript
// ✅ GOOD: Cache calculations
const birdLeft = 100 - BIRD_SIZE / 2;
pipes.forEach(pipe => {
    if (birdLeft > pipe.x) { ... }
});

// ❌ BAD: Recalculate every iteration
pipes.forEach(pipe => {
    if (100 - BIRD_SIZE / 2 > pipe.x) { ... }
});
```

---

## 🧪 Testing Checklist

### Functionality
- [ ] Main menu navigates correctly
- [ ] Settings save and apply
- [ ] Shop purchases work
- [ ] Gameplay is smooth (60 FPS)
- [ ] Collision detection accurate
- [ ] Score tracking correct
- [ ] High score persists (if implemented)

### UI/UX
- [ ] Buttons respond to hover
- [ ] Touch works on mobile
- [ ] Keyboard controls work
- [ ] Animations are smooth
- [ ] Colors match design
- [ ] Text is readable

### Audio
- [ ] Sounds play correctly
- [ ] Volume controls work
- [ ] No audio glitches
- [ ] Mobile audio unlocks

### Performance
- [ ] 60 FPS maintained
- [ ] No memory leaks
- [ ] Fast initial load
- [ ] Responsive on mobile

### Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## 📚 Resources

### Documentation
- `README.md` - User guide
- `GAME_FEATURES.md` - Complete feature list
- `PROJECT_STRUCTURE.md` - This file

### External Links
- [Canvas API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

---

## �� Credits

**Developer:** Daffa Aditya Pratama
- Game logic implementation
- UI system & animations
- Sound system integration
- Code architecture

**Designer:** Samsul Bahrur
- Visual design & color scheme
- UI/UX layout
- Asset conceptualization

---

## 📄 License

© 2025 Modern Flappy Bird Team
All Rights Reserved

---

**Last Updated:** November 8, 2025
**Version:** 2.0 (Modular Architecture)
