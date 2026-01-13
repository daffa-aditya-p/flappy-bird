
import pygame
import numpy as np
import sys
import os
import json
import random
from pygame import mixer, gfxdraw
import math
from datetime import datetime

# Initialize Pygame
pygame.init()
mixer.init()

# Constants - Responsive for mobile/web
# Auto-detect platform and set appropriate screen size
import platform
PLATFORM = platform.system()
IS_MOBILE = os.environ.get('ANDROID_ARGUMENT', '') or os.environ.get('PYGAME_BLEND_ALPHA_SDL2', '')

# Screen size - responsive for different devices
if IS_MOBILE:
    # Mobile: use device screen size
    SCREEN_WIDTH = 0  # Will be set from display info
    SCREEN_HEIGHT = 0
else:
    # Desktop/Web: use HD resolution
    SCREEN_WIDTH = 1280
    SCREEN_HEIGHT = 720
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
PRIMARY = (88, 101, 242)        # Discord Blurple
SECONDARY = (71, 82, 196)       # Darker Blurple
ACCENT = (235, 69, 158)         # Hot Pink
ACCENT_SECONDARY = (87, 242, 135)  # Neon Green
BACKGROUND = (35, 39, 42)       # Dark Gray
GOLD = (255, 215, 0)
SILVER = (192, 192, 192)
CRYSTAL = (173, 216, 230)
NEON_PINK = (255, 110, 199)

# Difficulty Settings
DIFFICULTY_SETTINGS = {
    "easy": {
        "gravity": 0.35,
        "jump_strength": -7,
        "initial_speed": 2.5,
        "speed_increment": 0.3,
        "pipe_gap": 220,
        "score_multiplier": 1
    },
    "normal": {
        "gravity": 0.5,
        "jump_strength": -8,
        "initial_speed": 3.5,
        "speed_increment": 0.5,
        "pipe_gap": 200,
        "score_multiplier": 2
    },
    "hardcore": {
        "gravity": 0.65,
        "jump_strength": -9,
        "initial_speed": 4.5,
        "speed_increment": 0.7,
        "pipe_gap": 180,
        "score_multiplier": 3
    }
}

class Utils:
    @staticmethod
    def create_gradient_surface(width, height, start_color, end_color, vertical=True):
        surface = pygame.Surface((width, height))
        for i in range(height if vertical else width):
            factor = i / (height if vertical else width)
            color = tuple(np.array(start_color) * (1 - factor) + np.array(end_color) * factor)
            if vertical:
                pygame.draw.line(surface, color, (0, i), (width, i))
            else:
                pygame.draw.line(surface, color, (i, 0), (i, height))
        return surface

    @staticmethod
    def draw_rounded_rect(surface, color, rect, radius):
        x, y, width, height = map(int, rect)  # Convert to integers
        radius = int(radius)  # Ensure radius is integer
        diameter = radius * 2
        
        # Draw main rectangle
        pygame.draw.rect(surface, color, (x + radius, y, width - diameter, height))
        pygame.draw.rect(surface, color, (x, y + radius, width, height - diameter))
        
        # Draw corners
        for circle_x, circle_y in [
            (x + radius, y + radius),  # Top left
            (x + width - radius - 1, y + radius),  # Top right
            (x + radius, y + height - radius - 1),  # Bottom left
            (x + width - radius - 1, y + height - radius - 1)  # Bottom right
        ]:
            # Ensure all coordinates are integers
            circle_x, circle_y = int(circle_x), int(circle_y)
            pygame.gfxdraw.aacircle(surface, circle_x, circle_y, radius, color)
            pygame.gfxdraw.filled_circle(surface, circle_x, circle_y, radius, color)

class ParticleSystem:
    def __init__(self):
        self.particles = []

    def add_particle(self, x, y, color, velocity=(0, 0), lifetime=30):
        self.particles.append({
            'pos': [x, y],
            'velocity': velocity,
            'color': color,
            'lifetime': lifetime,
            'max_lifetime': lifetime
        })

    def update(self):
        for particle in self.particles[:]:
            particle['pos'][0] += particle['velocity'][0]
            particle['pos'][1] += particle['velocity'][1]
            particle['lifetime'] -= 1
            if particle['lifetime'] <= 0:
                self.particles.remove(particle)

    def draw(self, surface):
        for particle in self.particles:
            alpha = int(255 * (particle['lifetime'] / particle['max_lifetime']))
            color = (*particle['color'][:3], alpha)
            pos = tuple(map(int, particle['pos']))
            pygame.draw.circle(surface, color, pos, 2)

class Button:
    def __init__(self, x, y, width, height, text, color=PRIMARY, hover_color=SECONDARY):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.hover_color = hover_color
        self.current_color = color
        self.font = pygame.font.Font(None, 36)
        self.hover = False
        self.animation_progress = 0

    def update(self, mouse_pos):
        self.hover = self.rect.collidepoint(mouse_pos)
        target = 1 if self.hover else 0
        self.animation_progress += (target - self.animation_progress) * 0.2
        self.current_color = tuple(np.array(self.color) * (1 - self.animation_progress) + 
                                 np.array(self.hover_color) * self.animation_progress)

    def draw(self, surface):
        Utils.draw_rounded_rect(surface, self.current_color, self.rect, 10)
        text_surface = self.font.render(self.text, True, WHITE)
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)

class Slider:
    def __init__(self, x, y, width, height, min_value=0, max_value=1, value=0.5):
        self.rect = pygame.Rect(x, y, width, height)
        self.min_value = min_value
        self.max_value = max_value
        self.value = value
        self.dragging = False

    def update(self, mouse_pos, mouse_pressed):
        if mouse_pressed[0]:
            if self.rect.collidepoint(mouse_pos):
                self.dragging = True
            if self.dragging:
                self.value = (mouse_pos[0] - self.rect.x) / self.rect.width
                self.value = max(0, min(1, self.value))
        else:
            self.dragging = False

    def draw(self, surface):
        pygame.draw.rect(surface, PRIMARY, self.rect, border_radius=5)
        pos = self.rect.x + self.value * self.rect.width
        pygame.draw.circle(surface, SECONDARY, (int(pos), self.rect.centery), 10)

class Settings:
    def __init__(self):
        self.difficulty = "normal"
        self.volume = 0.5
        self.background_theme = "default"
        self.particle_effects = True
        self.show_fps = True
        self.fullscreen = False
        self.vsync = True
        self.screen_shake = True
        self.music_volume = 0.5
        self.sfx_volume = 0.7
        self.high_score = 0
        self.total_score = 0
        self.coins = 0
        self.unlocked_birds = ["default"]
        self.unlocked_obstacles = ["default"]
        self.current_bird = "default"
        self.current_obstacle = "default"
        self.background_style = "dynamic"  # dynamic, static, minimal
        self.color_theme = "default"       # default, dark, neon, pastel
        self.controls = {
            "jump": pygame.K_SPACE,
            "pause": pygame.K_ESCAPE,
            "quick_reset": pygame.K_r
        }

    def save(self):
        data = {
            'difficulty': self.difficulty,
            'volume': self.volume,
            'background_theme': self.background_theme,
            'coins': self.coins,
            'unlocked_birds': self.unlocked_birds,
            'unlocked_obstacles': self.unlocked_obstacles,
            'current_bird': self.current_bird,
            'current_obstacle': self.current_obstacle
        }
        with open('settings.json', 'w') as f:
            json.dump(data, f)

    def load(self):
        try:
            with open('settings.json', 'r') as f:
                data = json.load(f)
                self.__dict__.update(data)
        except FileNotFoundError:
            pass

class Game:
    def __init__(self):
        global SCREEN_WIDTH, SCREEN_HEIGHT
        
        # Initialize display - get actual screen size for mobile
        self.settings = Settings()
        self.settings.load()
        
        # Auto-detect screen size for mobile/web
        if IS_MOBILE:
            info = pygame.display.Info()
            SCREEN_WIDTH = info.current_w
            SCREEN_HEIGHT = info.current_h
        
        # Choose appropriate display flags for mobile vs desktop
        display_flags = pygame.HWSURFACE | pygame.DOUBLEBUF
        try:
            if IS_MOBILE:
                # On mobile prefer fullscreen + scaled rendering for different device sizes
                display_flags |= pygame.FULLSCREEN | pygame.SCALED
            else:
                if self.settings.vsync:
                    display_flags |= pygame.SCALED
        except Exception:
            # Fallback if pygame doesn't support SCALED or FULLSCREEN on some builds
            pass

        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), display_flags)
        pygame.display.set_caption("Modern Flappy Bird")
        self.clock = pygame.time.Clock()
        self.state = "menu"
        self.particles = ParticleSystem()
        self.background_offset = 0
        self.font = pygame.font.Font(None, 36)
        
        # Create UI elements
        self.create_ui_elements()
        
        # Initialize sound effects
        self.init_sounds()

    def run(self):
        while True:
            if self.state == "menu":
                self.main_menu()
            elif self.state == "playing":
                self.play_game()
            elif self.state == "settings":
                self.settings_menu()
            elif self.state == "shop":
                self.shop_menu()
            elif self.state == "credits":
                self.credits_screen()

    def create_ui_elements(self):
        # Main menu buttons
        center_x = SCREEN_WIDTH // 2 - 100
        self.menu_buttons = [
            Button(center_x, 200, 200, 50, "Play"),
            Button(center_x, 275, 200, 50, "Settings"),
            Button(center_x, 350, 200, 50, "Shop"),
            Button(center_x, 425, 200, 50, "Credits")
        ]
        
        # Settings controls
        self.volume_slider = Slider(center_x, 300, 200, 20)

    def init_sounds(self):
        sample_rate = 44100
        
        # Jump sound (fun 8-bit style jump)
        t = np.linspace(0, 0.1, int(sample_rate * 0.1))
        freq = np.interp(t, [0, 0.1], [800, 1200])  # Frequency sweep
        jump_wave = np.sin(2 * np.pi * freq * t) * np.exp(-t * 10)
        # Add harmonics for richer sound
        jump_wave += 0.5 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 10)
        jump_wave += 0.25 * np.sin(8 * np.pi * freq * t) * np.exp(-t * 10)
        self.jump_sound = pygame.mixer.Sound(np.int16(jump_wave * 16383).tobytes())
        
        # Point sound (coin collect style)
        t = np.linspace(0, 0.1, int(sample_rate * 0.1))
        freq1 = np.interp(t, [0, 0.1], [600, 1000])
        freq2 = np.interp(t, [0, 0.1], [900, 1500])
        point_wave = np.sin(2 * np.pi * freq1 * t) * np.exp(-t * 15)
        point_wave += np.sin(2 * np.pi * freq2 * t) * np.exp(-t * 15)
        # Add sparkle effect
        sparkle = np.sin(2 * np.pi * 2000 * t) * np.exp(-t * 30) * 0.3
        point_wave = point_wave + sparkle
        self.point_sound = pygame.mixer.Sound(np.int16(point_wave * 16383).tobytes())
        
        # Death sound (dramatic failure)
        t = np.linspace(0, 0.3, int(sample_rate * 0.3))
        freq_death = np.interp(t, [0, 0.3], [400, 200])
        death_wave = np.sin(2 * np.pi * freq_death * t) * np.exp(-t * 3)
        # Add impact effect
        impact = np.sin(2 * np.pi * 100 * t) * np.exp(-t * 20)
        death_wave = death_wave + impact
        # Add distortion for dramatic effect
        death_wave = np.clip(death_wave * 1.3, -1, 1)
        self.death_sound = pygame.mixer.Sound(np.int16(death_wave * 16383).tobytes())
        
        # Create UI feedback sound (soft click)
        t = np.linspace(0, 0.05, int(sample_rate * 0.05))
        click_wave = np.sin(2 * np.pi * 800 * t) * np.exp(-t * 50)
        self.ui_click = pygame.mixer.Sound(np.int16(click_wave * 8191).tobytes())

    def draw_background(self):
        current_time = pygame.time.get_ticks() / 1000
        
        if self.settings.background_style == "dynamic":
            # Create amazing animated gradient background
            gradient_offset = (math.sin(current_time * 0.5) + 1) / 2
            color1 = PRIMARY
            color2 = SECONDARY
            color3 = ACCENT
            
            # Create multiple layers of gradients
            base_gradient = Utils.create_gradient_surface(
                SCREEN_WIDTH, SCREEN_HEIGHT,
                tuple(map(lambda x, y: x * (1-gradient_offset) + y * gradient_offset, color1, color2)),
                tuple(map(lambda x, y: x * gradient_offset + y * (1-gradient_offset), color2, color3))
            )
            self.screen.blit(base_gradient, (0, 0))
            
            # Add animated particles in background
            if self.settings.particle_effects:
                if random.random() < 0.1:
                    self.particles.add_particle(
                        random.randint(0, SCREEN_WIDTH),
                        random.randint(0, SCREEN_HEIGHT),
                        (*PRIMARY, 100),
                        (random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5)),
                        random.randint(50, 150)
                    )
            
            # Draw multiple animated wave patterns
            for i in range(3):
                points = []
                amplitude = 20 * (i + 1)
                frequency = (i + 1) * 0.5
                y_offset = SCREEN_HEIGHT - 150 + i * 50
                
                for x in range(0, SCREEN_WIDTH + 10, 5):
                    y = math.sin((x + self.background_offset * (i+1)) / 100 + current_time * frequency) * amplitude
                    points.append((x, y_offset + y))
                
                if len(points) >= 2:
                    color = tuple(map(lambda x: x * (0.5 - i * 0.1), WHITE))
                    pygame.draw.aalines(self.screen, color, False, points)
        
        elif self.settings.background_style == "minimal":
            # Simple, clean background with subtle patterns
            self.screen.fill(BACKGROUND)
            for i in range(10):
                pos = ((current_time * 50 + i * 100) % (SCREEN_WIDTH + 200)) - 100
                pygame.draw.circle(
                    self.screen,
                    tuple(map(lambda x: x * 0.3, PRIMARY)),
                    (int(pos), int(SCREEN_HEIGHT/2 + math.sin(current_time + i) * 50)),
                    20
                )
        
        # Add parallax effect stars
        for i in range(50):
            x = (self.background_offset * (i % 3 + 1) / 5 + i * 30) % SCREEN_WIDTH
            y = (math.sin(current_time + i) * 10 + i * 20) % SCREEN_HEIGHT
            size = (math.sin(current_time * 2 + i) + 2) * 2
            alpha = int(((math.sin(current_time + i) + 1) / 2) * 255)
            star_color = (*PRIMARY, alpha)
            pygame.draw.circle(self.screen, star_color, (int(x), int(y)), int(size))
        
        self.background_offset = (self.background_offset + 1) % 100

    def draw_bird(self, x, y, angle=0, invincibility_frames=0):
        # Draw a more stylized bird using shapes
        bird_color = (255, 200, 31)  # Yellow
        
        # Create a surface for the bird with alpha channel
        bird_surface = pygame.Surface((40, 40), pygame.SRCALPHA)
        
        # If invincible, create flashing effect
        if invincibility_frames > 0:
            flash_intensity = abs(math.sin(pygame.time.get_ticks() / 100))
            bird_color = tuple(map(lambda x: int(x * 0.7 + 255 * 0.3 * flash_intensity), bird_color))
        
        # Draw body with optional glow for invincibility
        pygame.draw.ellipse(bird_surface, bird_color, (5, 5, 30, 20))
        if invincibility_frames > 0:
            glow_color = (*GOLD, int(64 * abs(math.sin(pygame.time.get_ticks() / 50))))
            pygame.draw.ellipse(bird_surface, glow_color, (3, 3, 34, 24), 2)
        
        # Draw wing
        wing_y = 15 + math.sin(pygame.time.get_ticks() / 100) * 3
        wing_color = tuple(map(lambda x: int(x * 0.9), bird_color))
        pygame.draw.ellipse(bird_surface, wing_color, (10, wing_y, 15, 10))
        
        # Draw eye
        pygame.draw.circle(bird_surface, WHITE, (28, 12), 4)
        pygame.draw.circle(bird_surface, BLACK, (29, 12), 2)
        
        # Rotate bird surface
        rotated_bird = pygame.transform.rotate(bird_surface, angle)
        bird_rect = rotated_bird.get_rect(center=(x, y))
        self.screen.blit(rotated_bird, bird_rect)

    def main_menu(self):
        # Start UI music if not already playing
        if hasattr(self, 'ui_music') and self.ui_music is not None:
            if not pygame.mixer.Channel(1).get_busy():
                pygame.mixer.Channel(1).play(self.ui_music, loops=-1)
        
        # Animation variables for floating title
        title_offset = 0
        particle_spawn_timer = 0
        
        while self.state == "menu":
            mouse_pos = pygame.mouse.get_pos()
            current_time = pygame.time.get_ticks()
            
            # Spawn ambient particles for visual flair
            particle_spawn_timer += 1
            if particle_spawn_timer > 10:
                particle_spawn_timer = 0
                # Random particles floating up
                x = random.randint(0, SCREEN_WIDTH)
                y = SCREEN_HEIGHT
                self.particles.add_particle(
                    x, y,
                    (*ACCENT, 80),
                    (random.uniform(-0.5, 0.5), random.uniform(-3, -1))
                )
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.settings.save()
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    # Handle close button
                    if self.close_button.rect.collidepoint(mouse_pos):
                        if hasattr(self, 'ui_click') and self.ui_click:
                            self.ui_click.play()
                        self.settings.save()
                        pygame.quit()
                        sys.exit()
                    
                    for i, button in enumerate(self.menu_buttons):
                        if button.rect.collidepoint(mouse_pos):
                            if hasattr(self, 'ui_click') and self.ui_click:
                                self.ui_click.play()
                            states = ["playing", "settings", "shop", "credits"]
                            self.state = states[i]
                            # Stop UI music when starting game
                            if states[i] == "playing":
                                pygame.mixer.Channel(1).stop()
                            # Add click particles
                            for _ in range(10):
                                angle = random.uniform(0, 2*math.pi)
                                speed = random.uniform(2, 5)
                                self.particles.add_particle(
                                    mouse_pos[0], mouse_pos[1],
                                    (*PRIMARY, 200),
                                    (speed * math.cos(angle), speed * math.sin(angle))
                                )

            self.draw_background()
            
            # Update and draw particles
            self.particles.update()
            self.particles.draw(self.screen)
            
            # Draw floating title with sine wave animation
            title_offset = math.sin(current_time / 500) * 10
            title_font = pygame.font.Font(None, 72)
            title = title_font.render("Modern Flappy Bird", True, WHITE)
            title_shadow = title_font.render("Modern Flappy Bird", True, (*BLACK, 100))
            title_rect = title.get_rect(center=(SCREEN_WIDTH//2, 100 + title_offset))
            shadow_rect = title_rect.copy()
            shadow_rect.y += 5
            shadow_rect.x += 5
            self.screen.blit(title_shadow, shadow_rect)
            self.screen.blit(title, title_rect)
            
            # Draw subtitle
            subtitle_font = pygame.font.Font(None, 28)
            subtitle = subtitle_font.render("Touch/Click anywhere to jump!", True, ACCENT)
            subtitle_rect = subtitle.get_rect(center=(SCREEN_WIDTH//2, 160))
            self.screen.blit(subtitle, subtitle_rect)
            
            # Update and draw buttons with hover glow effect
            for button in self.menu_buttons:
                button.update(mouse_pos)
                button.draw(self.screen)
                # Add glow effect on hover
                if button.rect.collidepoint(mouse_pos):
                    glow_surface = pygame.Surface((button.rect.width + 20, button.rect.height + 20), pygame.SRCALPHA)
                    glow_color = (*ACCENT, 50)
                    Utils.draw_rounded_rect(glow_surface, glow_color, 
                                          (0, 0, button.rect.width + 20, button.rect.height + 20), 15)
                    self.screen.blit(glow_surface, (button.rect.x - 10, button.rect.y - 10))
            
            # Draw close button
            self.close_button.update(mouse_pos)
            self.close_button.draw(self.screen)
            
            # Draw version info
            version_font = pygame.font.Font(None, 20)
            version_text = version_font.render("v1.0.0 - Touch Enabled", True, (*WHITE, 150))
            version_rect = version_text.get_rect(bottomright=(SCREEN_WIDTH - 10, SCREEN_HEIGHT - 10))
            self.screen.blit(version_text, version_rect)
            
            pygame.display.flip()
            self.clock.tick(FPS)

    def settings_menu(self):
        difficulties = ["Easy", "Normal", "Hardcore"]
        current_diff_idx = difficulties.index(self.settings.difficulty.capitalize())
        
        # Create sliders if they don't exist
        if not hasattr(self, 'settings_sliders'):
            self.settings_sliders = {
                'music': Slider(SCREEN_WIDTH//2 - 100, 270, 200, 20, value=self.settings.music_volume),
                'sfx': Slider(SCREEN_WIDTH//2 - 100, 330, 200, 20, value=self.settings.sfx_volume)
            }
        
        # Create toggle buttons if they don't exist
        if not hasattr(self, 'settings_toggles'):
            self.settings_toggles = {
                'particles': Button(SCREEN_WIDTH//2 - 100, 390, 200, 40, "Particles: ON", 
                                 color=PRIMARY if self.settings.particle_effects else BACKGROUND),
                'screen_shake': Button(SCREEN_WIDTH//2 - 100, 440, 200, 40, "Screen Shake: ON",
                                    color=PRIMARY if self.settings.screen_shake else BACKGROUND),
                'vsync': Button(SCREEN_WIDTH//2 - 100, 490, 200, 40, "VSync: ON",
                              color=PRIMARY if self.settings.vsync else BACKGROUND),
                'fullscreen': Button(SCREEN_WIDTH//2 - 100, 540, 200, 40, "Fullscreen: OFF",
                                  color=PRIMARY if self.settings.fullscreen else BACKGROUND)
            }

        while self.state == "settings":
            mouse_pos = pygame.mouse.get_pos()
            mouse_pressed = pygame.mouse.get_pressed()
            current_time = pygame.time.get_ticks()
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.settings.save()
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.state = "menu"
                        self.settings.save()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    # Handle difficulty selection with particle effect
                    diff_rect = pygame.Rect(SCREEN_WIDTH//2 - 100, 200, 200, 50)
                    if diff_rect.collidepoint(mouse_pos):
                        current_diff_idx = (current_diff_idx + 1) % len(difficulties)
                        self.settings.difficulty = difficulties[current_diff_idx].lower()
                        # Add particle effect on change
                        for _ in range(10):
                            angle = random.uniform(0, 2*math.pi)
                            speed = random.uniform(2, 5)
                            self.particles.add_particle(
                                mouse_pos[0], mouse_pos[1],
                                ACCENT,
                                (speed * math.cos(angle), speed * math.sin(angle)),
                                30
                            )
                    
                    # Handle toggle buttons
                    for key, button in self.settings_toggles.items():
                        if button.rect.collidepoint(mouse_pos):
                            if key == 'particles':
                                self.settings.particle_effects = not self.settings.particle_effects
                                button.text = f"Particles: {'ON' if self.settings.particle_effects else 'OFF'}"
                                button.color = PRIMARY if self.settings.particle_effects else BACKGROUND
                            elif key == 'screen_shake':
                                self.settings.screen_shake = not self.settings.screen_shake
                                button.text = f"Screen Shake: {'ON' if self.settings.screen_shake else 'OFF'}"
                                button.color = PRIMARY if self.settings.screen_shake else BACKGROUND
                            elif key == 'vsync':
                                self.settings.vsync = not self.settings.vsync
                                button.text = f"VSync: {'ON' if self.settings.vsync else 'OFF'}"
                                button.color = PRIMARY if self.settings.vsync else BACKGROUND
                                pygame.display.set_vsync(self.settings.vsync)
                            elif key == 'fullscreen':
                                self.settings.fullscreen = not self.settings.fullscreen
                                button.text = f"Fullscreen: {'ON' if self.settings.fullscreen else 'OFF'}"
                                button.color = PRIMARY if self.settings.fullscreen else BACKGROUND
                                pygame.display.toggle_fullscreen()

            # Update sliders
            for slider_key, slider in self.settings_sliders.items():
                slider.update(mouse_pos, mouse_pressed)
                if slider_key == 'music':
                    self.settings.music_volume = slider.value
                elif slider_key == 'sfx':
                    self.settings.sfx_volume = slider.value
            
            # Draw settings screen
            self.draw_background()
            
            # Draw animated title
            title_color = tuple(map(lambda x: x * (math.sin(current_time/500) * 0.2 + 0.8), WHITE))
            title = self.font.render("Settings", True, title_color)
            title_rect = title.get_rect(center=(SCREEN_WIDTH//2, 100))
            self.screen.blit(title, title_rect)
            
            # Draw sections with hover effects
            sections = ["Game", "Audio", "Graphics", "Controls"]
            for i, section in enumerate(sections):
                y = 150 + i * 100
                section_color = ACCENT if mouse_pos[1] in range(y, y+80) else WHITE
                text = self.font.render(section, True, section_color)
                self.screen.blit(text, (50, y))
            
            # Draw difficulty selector with animation
            diff_color = tuple(map(lambda x: x * (math.sin(current_time/300) * 0.2 + 0.8), PRIMARY))
            Utils.draw_rounded_rect(
                self.screen,
                diff_color,
                (SCREEN_WIDTH//2 - 100, 200, 200, 50),
                10
            )
            diff_text = self.font.render(f"Difficulty: {difficulties[current_diff_idx]}", True, WHITE)
            diff_rect = diff_text.get_rect(center=(SCREEN_WIDTH//2, 225))
            self.screen.blit(diff_text, diff_rect)
            
            # Draw volume controls
            music_text = self.font.render("Music Volume", True, WHITE)
            sfx_text = self.font.render("SFX Volume", True, WHITE)
            self.screen.blit(music_text, (SCREEN_WIDTH//2 - 100, 250))
            self.screen.blit(sfx_text, (SCREEN_WIDTH//2 - 100, 310))
            
            # Draw sliders
            for slider in self.settings_sliders.values():
                slider.draw(self.screen)
            
            # Draw toggle buttons with hover effects
            for button in self.settings_toggles.values():
                button.update(mouse_pos)
                button.draw(self.screen)
            
            # Update sound volumes
            for sound in [self.jump_sound, self.point_sound, self.death_sound]:
                sound.set_volume(self.settings.sfx_volume)
            
            # Draw particles
            self.particles.update()
            self.particles.draw(self.screen)
            
            # Draw key bindings preview
            key_text = self.font.render("Press ESC to save and return", True, 
                                      tuple(map(lambda x: x * (math.sin(current_time/500) * 0.2 + 0.8), WHITE)))
            self.screen.blit(key_text, (SCREEN_WIDTH//2 - key_text.get_width()//2, SCREEN_HEIGHT - 50))
            
            pygame.display.flip()
            self.clock.tick(FPS)

    def shop_menu(self):
        birds = {
            "default": {"price": 0, "color": (255, 200, 31)},
            "golden": {"price": 100, "color": (255, 215, 0)},
            "rainbow": {"price": 500, "color": (255, 100, 100)},
            "robot": {"price": 999, "color": (192, 192, 192)}
        }
        
        obstacles = {
            "default": {"price": 0, "color": PRIMARY},
            "crystal": {"price": 150, "color": (173, 216, 230)},
            "neon": {"price": 300, "color": (255, 110, 199)},
            "gold": {"price": 750, "color": (255, 215, 0)}
        }

        while self.state == "shop":
            mouse_pos = pygame.mouse.get_pos()
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.settings.save()
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.state = "menu"
                        self.settings.save()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    # Handle bird purchases
                    y = 150
                    for bird, info in birds.items():
                        rect = pygame.Rect(SCREEN_WIDTH//4 - 100, y, 200, 50)
                        if rect.collidepoint(mouse_pos):
                            if bird not in self.settings.unlocked_birds and self.settings.coins >= info["price"]:
                                self.settings.coins -= info["price"]
                                self.settings.unlocked_birds.append(bird)
                                self.point_sound.play()
                        y += 70

                    # Handle obstacle purchases
                    y = 150
                    for obs, info in obstacles.items():
                        rect = pygame.Rect(3*SCREEN_WIDTH//4 - 100, y, 200, 50)
                        if rect.collidepoint(mouse_pos):
                            if obs not in self.settings.unlocked_obstacles and self.settings.coins >= info["price"]:
                                self.settings.coins -= info["price"]
                                self.settings.unlocked_obstacles.append(obs)
                                self.point_sound.play()
                        y += 70

            self.draw_background()
            
            # Draw title
            title = self.font.render("Shop", True, WHITE)
            title_rect = title.get_rect(center=(SCREEN_WIDTH//2, 50))
            self.screen.blit(title, title_rect)
            
            # Draw coins
            coins_text = self.font.render(f"Coins: ${self.settings.coins}", True, WHITE)
            self.screen.blit(coins_text, (20, 20))
            
            # Draw bird section
            birds_title = self.font.render("Bird Skins", True, WHITE)
            self.screen.blit(birds_title, (SCREEN_WIDTH//4 - birds_title.get_width()//2, 100))
            
            y = 150
            for bird, info in birds.items():
                color = info["color"]
                price = info["price"]
                unlocked = bird in self.settings.unlocked_birds
                
                rect = pygame.Rect(SCREEN_WIDTH//4 - 100, y, 200, 50)
                Utils.draw_rounded_rect(
                    self.screen,
                    color if unlocked else (100, 100, 100),
                    rect,
                    10
                )
                
                text = self.font.render(
                    bird.capitalize() if unlocked else f"${price}",
                    True,
                    WHITE
                )
                text_rect = text.get_rect(center=rect.center)
                self.screen.blit(text, text_rect)
                y += 70
            
            # Draw obstacles section
            obs_title = self.font.render("Obstacle Styles", True, WHITE)
            self.screen.blit(obs_title, (3*SCREEN_WIDTH//4 - obs_title.get_width()//2, 100))
            
            y = 150
            for obs, info in obstacles.items():
                color = info["color"]
                price = info["price"]
                unlocked = obs in self.settings.unlocked_obstacles
                
                rect = pygame.Rect(3*SCREEN_WIDTH//4 - 100, y, 200, 50)
                Utils.draw_rounded_rect(
                    self.screen,
                    color if unlocked else (100, 100, 100),
                    rect,
                    10
                )
                
                text = self.font.render(
                    obs.capitalize() if unlocked else f"${price}",
                    True,
                    WHITE
                )
                text_rect = text.get_rect(center=rect.center)
                self.screen.blit(text, text_rect)
                y += 70
            
            pygame.display.flip()
            self.clock.tick(FPS)

    def credits_screen(self):
        credits = [
            {"name": "Daffa Aditya Pratama", "role": "Lead Developer"},
            {"name": "Samsul Bahrur", "role": "Game Designer"}
        ]
        
        title_font = pygame.font.Font(None, 48)
        credit_font = pygame.font.Font(None, 36)
        role_font = pygame.font.Font(None, 24)
        
        while self.state == "credits":
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.state = "menu"
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if hasattr(self, 'close_button') and self.close_button.rect.collidepoint(pygame.mouse.get_pos()):
                        self.state = 'menu'
                        if hasattr(self, 'ui_click') and self.ui_click:
                            self.ui_click.play()

            self.draw_background()
            
            # Draw title
            title = title_font.render("Credits", True, WHITE)
            title_rect = title.get_rect(center=(SCREEN_WIDTH//2, 100))
            self.screen.blit(title, title_rect)
            
            # Draw credits with animation
            time = pygame.time.get_ticks() / 1000
            for i, credit in enumerate(credits):
                y_offset = math.sin(time + i) * 10
                y_pos = 250 + i * 100 + y_offset
                
                # Draw name
                name_text = credit_font.render(credit["name"], True, WHITE)
                name_rect = name_text.get_rect(center=(SCREEN_WIDTH//2, y_pos))
                self.screen.blit(name_text, name_rect)
                
                # Draw role
                role_text = role_font.render(credit["role"], True, SECONDARY)
                role_rect = role_text.get_rect(center=(SCREEN_WIDTH//2, y_pos + 30))
                self.screen.blit(role_text, role_rect)
            
            # Draw close button
            if hasattr(self, 'close_button'):
                self.close_button.update(pygame.mouse.get_pos())
                self.close_button.draw(self.screen)
            
            pygame.display.flip()
            self.clock.tick(FPS)

    def play_game(self):
        # Get difficulty settings
        diff_settings = DIFFICULTY_SETTINGS[self.settings.difficulty]
        
        # Initialize game state
        game_over = False
        
        # Initialize game variables with difficulty settings
        bird_y = SCREEN_HEIGHT // 2
        bird_velocity = 0
        gravity = diff_settings["gravity"]
        jump_strength = diff_settings["jump_strength"]
        pipe_gap = diff_settings["pipe_gap"]
        pipe_width = 70
        pipe_speed = diff_settings["initial_speed"]
        score_multiplier = diff_settings["score_multiplier"]
        pipes = []
        score = 0
        combo = 0
        perfect_passes = 0
        screen_shake = 0
        rainbow_effect = 0
        angle = 0
        invincibility_frames = 0  # Number of frames of invincibility left
        collisions = 0  # Number of collisions before game over
        max_collisions = 1  # Number of hits player can take before game over
        
        # Background particles
        self.particles.particles.clear()  # Reset particles
        last_particle_time = 0
        particle_interval = 100  # milliseconds
        
        # Game stats for this session
        stats = {
            'perfect_passes': 0,
            'near_misses': 0,
            'max_combo': 0,
            'total_coins': 0
        }
        
        game_over_start_time = 0
        last_speed_increase = pygame.time.get_ticks()
        start_time = pygame.time.get_ticks()
        
        # Create helper function for pipe creation
        def create_pipe(x_pos):
            return {
                'x': x_pos,
                'height': np.random.randint(100, SCREEN_HEIGHT - pipe_gap - 100),
                'passed': False,
                'color': PRIMARY,
                'particles': []
            }
        
        # Initial pipe
        pipes.append(create_pipe(SCREEN_WIDTH))

        while self.state == "playing":
            mouse_pos = pygame.mouse.get_pos()
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.settings.save()
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.state = "menu"
                        # Save settings and clean up when exiting
                        self.settings.save()
                        self.particles.particles.clear()

                # Centralized jump handler to support keyboard, mouse and touch
                def do_jump():
                    nonlocal bird_velocity, bird_y
                    bird_velocity = jump_strength
                    try:
                        self.jump_sound.play()
                    except Exception:
                        pass
                    # Add jump particles
                    for _ in range(5):
                        angle = random.uniform(0, 2*math.pi)
                        speed = random.uniform(1, 3)
                        self.particles.add_particle(
                            100, bird_y,
                            (*PRIMARY, 150),
                            (speed * math.cos(angle), speed * math.sin(angle))
                        )

                # Keyboard jump
                if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE and not game_over:
                    do_jump()

                # Mouse click (desktop/web) jump
                if event.type == pygame.MOUSEBUTTONDOWN and not game_over:
                    # Accept left click or touch-simulated mouse click
                    do_jump()

                # Touch event on Android (FINGERDOWN)
                if event.type == pygame.FINGERDOWN and not game_over:
                    # Convert normalized touch coords to screen coords if needed
                    try:
                        tx = int(event.x * SCREEN_WIDTH)
                        ty = int(event.y * SCREEN_HEIGHT)
                    except Exception:
                        tx, ty = SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2
                    do_jump()

            if not game_over:
                # Update bird position and angle
                bird_velocity += gravity
                bird_y += bird_velocity
                angle = np.clip(bird_velocity * 3, -45, 45)
                
                # Update pipes
                for pipe in pipes:
                    pipe['x'] -= pipe_speed

                # Remove off-screen pipes
                pipes = [pipe for pipe in pipes if pipe['x'] > -pipe_width]

                # Add new pipes
                if pipes[-1]['x'] < SCREEN_WIDTH - 300:
                    pipes.append(create_pipe(SCREEN_WIDTH))

                # Check collisions and score
                bird_rect = pygame.Rect(85, bird_y, 30, 30)
                for pipe in pipes:
                    upper_pipe = pygame.Rect(pipe['x'], 0, pipe_width, pipe['height'])
                    lower_pipe = pygame.Rect(pipe['x'], pipe['height'] + pipe_gap, 
                                          pipe_width, SCREEN_HEIGHT)
                    if (bird_rect.colliderect(upper_pipe) or bird_rect.colliderect(lower_pipe)) and invincibility_frames <= 0:
                        collisions += 1
                        if collisions >= max_collisions:
                            game_over = True
                            game_over_start_time = pygame.time.get_ticks()
                        self.death_sound.play()
                        
                        # Add dramatic multi-layered explosion particles
                        colors = [ACCENT, GOLD, WHITE]
                        for color in colors:
                            for _ in range(15):
                                angle = np.random.uniform(0, 2*np.pi)
                                speed = np.random.uniform(3, 7)
                                lifetime = np.random.randint(40, 80)
                                self.particles.add_particle(
                                    100, bird_y,
                                    color,
                                    (speed * np.cos(angle), speed * np.sin(angle)),
                                    lifetime
                                )
                                
                        # Add secondary particles for more dramatic effect
                        for _ in range(10):
                            angle = np.random.uniform(-np.pi/4, np.pi/4)  # Focused direction
                            speed = np.random.uniform(2, 4)
                            self.particles.add_particle(
                                100, bird_y,
                                ACCENT_SECONDARY,
                                (-speed * np.cos(angle), -speed * np.sin(angle)),  # Moving backwards
                                60
                            )
                            
                        # Add screen shake effect
                        if self.settings.screen_shake:
                            screen_shake = 20  # Will be used in screen rendering
                            
                        # Grant invincibility frames
                        invincibility_frames = 60  # 1 second at 60 FPS
                    
                    # Score point if passing pipe
                    if not pipe['passed'] and pipe['x'] < 85:
                        pipe['passed'] = True
                        score += 1 * score_multiplier
                        
                        # Calculate center-line deviation for perfect pass bonus
                        pipe_center = pipe['height'] + pipe_gap / 2
                        bird_center = bird_y + 15
                        deviation = abs(bird_center - pipe_center)
                        
                        # Perfect pass bonus (within 10 pixels of center)
                        if deviation < 10:
                            score += 2 * score_multiplier
                            combo += 1
                            perfect_passes += 1
                            stats['perfect_passes'] += 1
                            # Add sparkle effect
                            for _ in range(15):
                                angle = random.uniform(0, 2*math.pi)
                                speed = random.uniform(3, 7)
                                self.particles.add_particle(
                                    85, bird_y,
                                    GOLD,
                                    (speed * math.cos(angle), speed * math.sin(angle)),
                                    40
                                )
                        # Near miss bonus (within 30 pixels of center)
                        elif deviation < 30:
                            score += 1 * score_multiplier
                            combo += 1
                            stats['near_misses'] += 1
                            # Add smaller sparkle effect
                            for _ in range(8):
                                angle = random.uniform(0, 2*math.pi)
                                speed = random.uniform(2, 5)
                                self.particles.add_particle(
                                    85, bird_y,
                                    ACCENT_SECONDARY,
                                    (speed * math.cos(angle), speed * math.sin(angle)),
                                    30
                                )
                        else:
                            combo = 0
                        
                        # Update max combo
                        stats['max_combo'] = max(stats['max_combo'], combo)
                        
                        # Award coins based on performance
                        coin_bonus = (1 + (combo // 3)) * score_multiplier
                        self.settings.coins += coin_bonus
                        stats['total_coins'] += coin_bonus
                        
                        # Play sound with pitch variation based on combo
                        self.point_sound.set_volume(min(1.0, 0.5 + combo * 0.1))
                        self.point_sound.play()
                        
                        # Speed increase every 10 points with visual feedback
                        if score % 10 == 0:
                            pipe_speed += diff_settings["speed_increment"]
                            # Add speed up effect
                            for _ in range(20):
                                self.particles.add_particle(
                                    random.randint(0, SCREEN_WIDTH),
                                    random.randint(0, SCREEN_HEIGHT),
                                    ACCENT,
                                    (random.uniform(-3, 3), random.uniform(-3, 3)),
                                    40
                                )

                # Check if bird hits boundaries
                if bird_y < 0 or bird_y > SCREEN_HEIGHT:
                    game_over = True
                    self.death_sound.play()

            # Draw game with screen shake effect
            shake_offset = (0, 0)
            if screen_shake > 0 and self.settings.screen_shake:
                shake_offset = (
                    random.randint(-screen_shake, screen_shake),
                    random.randint(-screen_shake, screen_shake)
                )
                screen_shake = max(0, screen_shake - 1)
                
            # Create a temporary surface for shake effect
            if shake_offset != (0, 0):
                temp_surface = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
                draw_surface = temp_surface
            else:
                draw_surface = self.screen
            
            # Draw on the appropriate surface
            self.draw_background()
            
            # Update and draw particles
            self.particles.update()
            self.particles.draw(draw_surface)
            
            # Draw pipes with gradient effect
            for pipe in pipes:
                # Upper pipe
                Utils.draw_rounded_rect(
                    self.screen,
                    PRIMARY,
                    (pipe['x'], 0, pipe_width, pipe['height']),
                    5
                )
                # Lower pipe
                Utils.draw_rounded_rect(
                    self.screen,
                    PRIMARY,
                    (pipe['x'], pipe['height'] + pipe_gap, 
                     pipe_width, SCREEN_HEIGHT - (pipe['height'] + pipe_gap)),
                    5
                )

            # Update and draw bird
            if invincibility_frames > 0:
                invincibility_frames -= 1
            self.draw_bird(100, bird_y, angle, invincibility_frames)

            # Draw score UI with enhanced visuals
            # Score
            score_color = GOLD if combo > 5 else WHITE
            score_size = min(48, 36 + combo * 2)  # Score text grows with combo
            score_font = pygame.font.Font(None, score_size)
            score_text = score_font.render(f'Score: {score}', True, score_color)
            score_rect = score_text.get_rect(midtop=(SCREEN_WIDTH//2, 20))
            
            # Add glow effect for high scores
            if score > 50:
                glow_surf = score_text.copy()
                glow_surf.fill((50, 50, 50, 0), special_flags=pygame.BLEND_RGBA_ADD)
                self.screen.blit(glow_surf, (score_rect.x + 2, score_rect.y + 2))
            
            self.screen.blit(score_text, score_rect)
            
            # Combo counter
            if combo > 0:
                combo_text = self.font.render(f'Combo: x{combo}', True, ACCENT_SECONDARY)
                combo_rect = combo_text.get_rect(midtop=(SCREEN_WIDTH//2, 60))
                self.screen.blit(combo_text, combo_rect)
            
            # Perfect passes
            if perfect_passes > 0:
                perfect_text = self.font.render(f'Perfect: {perfect_passes}', True, GOLD)
                self.screen.blit(perfect_text, (20, 20))
            
            # Coins with animation
            coin_color = tuple(map(lambda x: x * (math.sin(pygame.time.get_ticks()/200) * 0.2 + 0.8), GOLD))
            coin_text = self.font.render(f'${self.settings.coins}', True, coin_color)
            coin_rect = coin_text.get_rect(topright=(SCREEN_WIDTH - 20, 20))
            
            # Draw coin icon
            coin_size = 24
            pygame.draw.circle(self.screen, coin_color, (coin_rect.left - 15, coin_rect.centery), coin_size//2)
            pygame.draw.circle(self.screen, (50, 50, 50), (coin_rect.left - 15, coin_rect.centery), coin_size//2, 2)
            
            self.screen.blit(coin_text, coin_rect)
            
            # Difficulty indicator
            diff_text = self.font.render(
                f'{self.settings.difficulty.capitalize()} Mode', 
                True, 
                PRIMARY
            )
            self.screen.blit(diff_text, (20, SCREEN_HEIGHT - 30))
            
            # Speed indicator
            speed_text = self.font.render(
                f'Speed: {pipe_speed:.1f}x', 
                True, 
                ACCENT if pipe_speed > diff_settings["initial_speed"] * 1.5 else WHITE
            )
            self.screen.blit(speed_text, (SCREEN_WIDTH - 150, SCREEN_HEIGHT - 30))

            if game_over:
                # Update high score
                if score > self.settings.high_score:
                    self.settings.high_score = score
                    self.settings.save()
                
                # Create dynamic overlay with gradient and pulse effect
                current_time = pygame.time.get_ticks()
                time_since_game_over = current_time - game_over_start_time
                fade_progress = min(1.0, time_since_game_over / 1000)  # Complete fade in 1 second
                
                # Create gradient overlay
                overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
                gradient_colors = [
                    (0, 0, 0, int(192 * fade_progress)),  # Dark at top
                    (ACCENT[0], ACCENT[1], ACCENT[2], int(64 * fade_progress)),  # Accent color in middle
                    (0, 0, 0, int(192 * fade_progress))   # Dark at bottom
                ]
                
                gradient_height = SCREEN_HEIGHT // len(gradient_colors)
                for i in range(len(gradient_colors) - 1):
                    start_color = gradient_colors[i]
                    end_color = gradient_colors[i + 1]
                    for y in range(gradient_height):
                        progress = y / gradient_height
                        color = tuple(int(start + (end - start) * progress) 
                                   for start, end in zip(start_color, end_color))
                        pygame.draw.line(overlay, color, 
                                       (0, i * gradient_height + y),
                                       (SCREEN_WIDTH, i * gradient_height + y))
                
                # Add pulse effect
                pulse = (math.sin(current_time / 300) + 1) / 2
                pulse_overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
                pulse_alpha = int(32 * pulse * fade_progress)
                pulse_overlay.fill((ACCENT[0], ACCENT[1], ACCENT[2], pulse_alpha))
                
                # Apply overlays
                self.screen.blit(overlay, (0, 0))
                self.screen.blit(pulse_overlay, (0, 0))
                
                # Calculate time-based animations
                time_since_game_over = pygame.time.get_ticks() - game_over_start_time
                fade_in_duration = 1000  # ms
                text_delay = 500  # ms between each stat appearing
                fade_progress = min(1.0, time_since_game_over / fade_in_duration)
                
                # Create larger font for game over text with animation
                large_font = pygame.font.Font(None, 72)
                game_over_text = large_font.render('Game Over!', True, WHITE)
                game_over_rect = game_over_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2 - 120))
                
                # Dramatic entrance animation for game over text
                if time_since_game_over < fade_in_duration:
                    scale = 1.5 - (0.5 * fade_progress)
                    offset_y = -50 * (1 - fade_progress)
                    scaled_text = pygame.transform.scale(
                        game_over_text,
                        (int(game_over_text.get_width() * scale),
                         int(game_over_text.get_height() * scale))
                    )
                    scaled_rect = scaled_text.get_rect(center=(SCREEN_WIDTH//2, game_over_rect.centery + offset_y))
                    game_over_rect = scaled_rect
                    game_over_text = scaled_text
                
                # Add pulsing glow effect to game over text
                pulse = (math.sin(time_since_game_over / 200) + 1) / 2
                glow_color = tuple(map(lambda x: int(x * pulse), ACCENT))
                glow_surf = game_over_text.copy()
                glow_surf.fill((*glow_color, 0), special_flags=pygame.BLEND_RGBA_ADD)
                
                # Apply glow and draw text
                self.screen.blit(glow_surf, (game_over_rect.x + 2, game_over_rect.y + 2))
                self.screen.blit(game_over_text, game_over_rect)
                
                # Stats display with sequential animations
                stats_data = [
                    {'text': f'Final Score: {score}', 
                     'color': GOLD if score > self.settings.high_score else WHITE},
                    {'text': f'High Score: {self.settings.high_score}', 'color': GOLD},
                    {'text': f'Perfect Passes: {stats["perfect_passes"]}', 'color': ACCENT_SECONDARY},
                    {'text': f'Max Combo: x{stats["max_combo"]}', 'color': PRIMARY},
                    {'text': f'Coins Earned: ${stats["total_coins"]}', 'color': GOLD}
                ]
                
                stats_y = SCREEN_HEIGHT//2 - 40
                stats_spacing = 40
                
                for i, stat in enumerate(stats_data):
                    # Calculate individual stat timing
                    stat_delay = text_delay * (i + 1)
                    if time_since_game_over > stat_delay:
                        stat_progress = min(1.0, (time_since_game_over - stat_delay) / 500)
                        
                        # Create sliding and fading animation
                        x_offset = (1 - stat_progress) * 100
                        alpha = int(255 * stat_progress)
                        
                        # Create text surface with alpha
                        text_surface = self.font.render(stat['text'], True, stat['color'])
                        alpha_surface = pygame.Surface(text_surface.get_size(), pygame.SRCALPHA)
                        alpha_surface.fill((255, 255, 255, alpha))
                        text_surface.blit(alpha_surface, (0, 0), special_flags=pygame.BLEND_RGBA_MULT)
                        
                        # Position and draw text
                        text_rect = text_surface.get_rect(
                            center=(SCREEN_WIDTH//2 + x_offset, stats_y + stats_spacing * i)
                        )
                        self.screen.blit(text_surface, text_rect)
                
                # Restart instructions with pulsing effect
                pulse = (math.sin(pygame.time.get_ticks() / 300) + 1) / 2
                restart_color = tuple(map(lambda x: int(x * (0.7 + 0.3 * pulse)), WHITE))
                restart_text = self.font.render('Press ESC to return to menu', True, restart_color)
                self.screen.blit(restart_text, restart_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT - 100)))
                
                # Add floating particles for visual effect
                if random.random() < 0.1:
                    self.particles.add_particle(
                        random.randint(0, SCREEN_WIDTH),
                        SCREEN_HEIGHT,
                        PRIMARY,
                        (random.uniform(-1, 1), random.uniform(-3, -1)),
                        random.randint(60, 120)
                    )

            pygame.display.flip()
            self.clock.tick(FPS)

if __name__ == "__main__":
    game = Game()
    game.run()
