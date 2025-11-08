# 🎮 Modern Flappy Bird - Professional Edition

## 🌟 Fitur Utama

### 🎨 Sistem UI Modern
- **Discord-Inspired Color Scheme**: Menggunakan palet warna profesional (Blurple, Hot Pink, Neon Green)
- **Animated Menus**: Semua menu dengan animasi smooth dan hover effects
- **Particle System**: Background particles & gameplay effects yang elegan
- **Screen Shake**: Feedback visual saat collision (dapat dinonaktifkan)

### 🎯 Menu Lengkap

#### 1️⃣ Main Menu
- **Play**: Mulai permainan
- **Settings**: Pengaturan game
- **Shop**: Toko skin dan item
- **Credits**: Kredit developer & designer

#### 2️⃣ Settings Menu
**Game:**
- Difficulty Selector: Easy / Normal / Hardcore
- Efek partikel saat ganti difficulty

**Audio:**
- Music Volume Slider (belum diimplementasi)
- SFX Volume Slider

**Graphics:**
- Particles Toggle (ON/OFF)
- Screen Shake Toggle (ON/OFF)
- VSync Toggle (ON/OFF)

#### 3️⃣ Shop Menu
**Bird Skins:**
- 🟡 Default (Gratis) - Kuning
- 🟠 Golden (100 koin) - Emas
- 🌈 Rainbow (500 koin) - Pink
- 🤖 Robot (999 koin) - Silver

**Obstacle Styles:**
- 🟣 Default (Gratis) - Blurple
- 💎 Crystal (150 koin) - Biru Muda
- 💗 Neon (300 koin) - Pink Neon
- 👑 Gold (750 koin) - Emas

#### 4️⃣ Credits Menu
- Animated contributors dengan bounce effect
- Developer: Daffa Aditya Pratama
- Designer: Samsul Bahrur

### 🎮 Gameplay Features

**In-Game HUD:**
- ⭐ Perfect Passes counter (pojok kiri atas)
- 💰 Coins earned (pojok kanan atas)
- 🎯 Combo system (di bawah score)
- 📊 Difficulty indicator (pojok kiri bawah)
- ⚡ Speed indicator (pojok kanan bawah)

**Scoring System:**
- Normal pass: +1 score, +1 coin
- Perfect pass (centered): +1 score, +2 coins, combo++
- Combo system dengan visual feedback
- High score tracking

**Difficulty Scaling:**
- Speed meningkat seiring progress
- Hardcore mode: Gap pipe lebih kecil, speed lebih cepat

### 💫 Visual Effects

**Particle Effects:**
- Background floating particles
- Jump particles saat burung lompat
- Score particles saat perfect pass
- Death explosion saat game over

**Animations:**
- Smooth color transitions
- Hover animations pada semua button
- Pulse effects pada teks penting
- Wing flap animation
- Bird rotation based on velocity

### 🔊 Sound System

**Web Audio API:**
- UI Click: Suara klik lembut (600Hz)
- Jump: Suara lompat 8-bit style (800Hz)
- Point: Suara coin dengan pitch variation (1000-1200Hz)
- Death: Suara dramatis game over (150Hz)

### 🎮 Controls

**Keyboard:**
- `SPACE` - Jump / Start / Restart
- `ESC` - Kembali ke Main Menu

**Mouse:**
- Click - Jump / Interact dengan button

**Touch:**
- Tap - Jump / Interact dengan button

## 📁 File Versions

1. **game-modern.html** ⭐ (RECOMMENDED)
   - Full UI system dengan menu lengkap
   - Shop & progression system
   - Professional design
   - 1029 lines of code

2. **game.html**
   - Simple gameplay only
   - No menus
   - Lightweight version
   - 229 lines of code

3. **game-full.html**
   - Extended version
   - Additional features

## 🚀 Cara Menggunakan

### Method 1: Direct Open (Recommended)
```bash
# Buka langsung di browser
firefox game-modern.html
# atau
google-chrome game-modern.html
```

### Method 2: Local Server
```bash
# Python 3
python3 -m http.server 8000

# Lalu buka browser:
# http://localhost:8000/game-modern.html
```

### Method 3: Live Server (VS Code)
1. Install extension "Live Server"
2. Right-click pada `game-modern.html`
3. Pilih "Open with Live Server"

## 🎨 Color Palette

```javascript
PRIMARY:           rgb(88, 101, 242)  // Discord Blurple
SECONDARY:         rgb(71, 82, 196)   // Darker Blurple
ACCENT:            rgb(235, 69, 158)  // Hot Pink
ACCENT_SECONDARY:  rgb(87, 242, 135)  // Neon Green
BACKGROUND:        rgb(35, 39, 42)    // Dark Gray
GOLD:              rgb(255, 215, 0)   // Gold
SILVER:            rgb(192, 192, 192) // Silver
```

## 📊 Technical Details

**Tech Stack:**
- Pure JavaScript (ES6+)
- Canvas API 2D
- Web Audio API
- No external dependencies

**Performance:**
- 60 FPS game loop
- Efficient particle system
- Optimized collision detection
- Smooth animations with requestAnimationFrame

**Compatibility:**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)
- ✅ Works offline (no CDN dependencies)

## 🏆 Credits

**Developer:** Daffa Aditya Pratama
- Game logic & implementation
- UI system & animations
- Sound system integration

**Designer:** Samsul Bahrur
- Visual design & color scheme
- UI/UX layout
- Asset conceptualization

**Engine:** Pure JavaScript + Canvas API
**Sound Design:** Web Audio API (Procedural)

## 📝 Changelog

### v2.0 - Professional Edition (Nov 2025)
- ✨ Complete UI system dengan menu navigation
- 🛒 Shop system dengan unlockable skins
- ⚙️ Comprehensive settings menu
- 🎨 Professional Discord-inspired design
- 💫 Advanced particle system
- 🔊 Full sound system dengan volume controls
- 🏆 Credits screen
- 📊 Detailed game over statistics
- 🎮 Multiple difficulty modes

### v1.0 - Initial Release
- Basic gameplay
- Simple UI
- Touch/keyboard controls

## 🐛 Known Issues

None at the moment! 🎉

## 📄 License

© 2025 Daffa Aditya Pratama & Samsul Bahrur
All rights reserved.

---

**Enjoy the game! 🎮✨**
