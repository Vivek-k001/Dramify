#!/usr/bin/env python3
"""
Dramify Motion Graphics Video Generator
Renders a 1080p, 60/30fps cinema-grade promotional motion graphics video for Dramify.
Features:
- Obsidian Cinema design philosophy (Deep OLED #08090C, Crimson Rose #E11D48, Amber Gold #F59E0B)
- Authentic Korean Hangul typography ("드라마")
- 5 choreographed scenes:
    1. Cinematic Cold Open & Brand Identity
    2. 147 Curated Korean Titles Showcase & 3D Cards
    3. Signature Sliding Pill Navigation (K-Dramas 83 <-> K-Movies 64)
    4. Dynamic Top 3 Podium & Dual Rating HUD (TMDB 8.8 vs Dramify 9.4)
    5. Converged UI Showcase & Call-to-Action
- Synthesized cinematic stereo soundtrack with sub-bass, harmonic pads, and transition risers
"""

import os
import sys
import math
import numpy as np

# Ensure Windows terminal doesn't choke on unicode output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from PIL import Image, ImageDraw, ImageFont, ImageFilter
from moviepy import VideoClip, AudioArrayClip

# Video configuration
WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 25.0  # seconds (750 frames total)
OUTPUT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "videos", "dramify_promo.mp4"))

# Color Palette (Obsidian Cinema)
C_BG = (8, 9, 12)
C_SURFACE = (16, 18, 23)
C_CARD = (21, 24, 32)
C_CRIMSON = (225, 29, 72)     # #E11D48
C_ROSE_ACCENT = (244, 63, 94) # #F43F5E
C_GOLD = (245, 158, 11)       # #F59E0B
C_AMBER = (251, 191, 36)      # #FBBF24
C_CYAN = (6, 182, 212)        # #06B6D4
C_WHITE = (255, 255, 255)
C_MUTED = (148, 163, 184)
C_SUBTLE = (100, 116, 139)

# Paths to assets and fonts
DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs"))
SCREENSHOTS_DIR = os.path.join(DOCS_DIR, "screenshots")

def get_font(size, bold=False, hangul=False):
    """Load system font with graceful fallbacks"""
    candidates = []
    if hangul:
        candidates += [
            "C:/Windows/Fonts/malgunbd.ttf" if bold else "C:/Windows/Fonts/malgun.ttf",
            "C:/Windows/Fonts/gulim.ttc",
        ]
    if bold:
        candidates += [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ]
    else:
        candidates += [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ]

    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, int(size))
            except Exception:
                pass
    return ImageFont.load_default()

# Load screenshots if present
SCREENSHOTS = {}
for name in ["home.png", "profile.png", "discover.png"]:
    p = os.path.join(SCREENSHOTS_DIR, name)
    if os.path.exists(p):
        try:
            img = Image.open(p).convert("RGBA")
            SCREENSHOTS[name] = img
        except Exception as e:
            print(f"Warning loading {name}: {e}")

# Precompute fixed stars/particles for ambient backdrop
np.random.seed(42)
NUM_STARS = 120
STAR_X = np.random.uniform(0, WIDTH, NUM_STARS)
STAR_Y = np.random.uniform(0, HEIGHT, NUM_STARS)
STAR_R = np.random.uniform(1.0, 2.5, NUM_STARS)
STAR_SPEED = np.random.uniform(0.5, 2.0, NUM_STARS)

# Pre-render subtle radial glow background base to maximize frame rate
def create_background_base():
    base = Image.new("RGBA", (WIDTH, HEIGHT), (*C_BG, 255))
    draw = ImageDraw.Draw(base)

    # Grid lines (tactile blueprint texture)
    grid_spacing = 80
    for x in range(0, WIDTH, grid_spacing):
        draw.line([(x, 0), (x, HEIGHT)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, HEIGHT, grid_spacing):
        draw.line([(0, y), (WIDTH, y)], fill=(255, 255, 255, 6), width=1)

    return base

BG_BASE = create_background_base()

def ease_in_out_cubic(t):
    """Smooth cubic bezier easing"""
    t = max(0.0, min(1.0, t))
    if t < 0.5:
        return 4 * t * t * t
    else:
        return 1 - math.pow(-2 * t + 2, 3) / 2

def ease_out_back(t, s=1.70158):
    """Elastic overshoot spring easing"""
    t = max(0.0, min(1.0, t)) - 1
    return t * t * ((s + 1) * t + s) + 1

def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """Helper for rounded rectangle with border"""
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def draw_pill_badge(draw, center_x, center_y, text, font, bg_color, text_color, border_color=None, pad_x=20, pad_y=8):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    w = tw + pad_x * 2
    h = th + pad_y * 2
    x0 = center_x - w // 2
    y0 = center_y - h // 2
    x1 = x0 + w
    y1 = y0 + h
    draw.rounded_rectangle([x0, y0, x1, y1], radius=h // 2, fill=bg_color, outline=border_color, width=1)
    draw.text((center_x - tw // 2, center_y - th // 2 - 2), text, font=font, fill=text_color)
    return x0, y0, x1, y1

# Pre-compile scenes
def render_scene_1(t, img, draw):
    """Scene 1: Cinematic Cold Open (0.0s - 5.0s)"""
    # Normalized time in scene [0, 1]
    st = t / 5.0

    # Ambient breathing radial lighting
    glow_alpha = int(45 + 30 * math.sin(t * 2.5))
    cx, cy = WIDTH // 2, HEIGHT // 2 - 20
    glow_r = 450 + int(30 * math.sin(t * 1.8))
    draw.ellipse([cx - glow_r, cy - glow_r // 2, cx + glow_r, cy + glow_r // 2], fill=(225, 29, 72, glow_alpha // 2))

    # Giant atmospheric Hangul watermark in background ("드라마")
    hangul_font = get_font(210, bold=True, hangul=True)
    hangul_alpha = int(24 + 12 * math.sin(t * 1.5))
    h_text = "드라마"
    h_bbox = hangul_font.getbbox(h_text)
    hw = h_bbox[2] - h_bbox[0]
    hh = h_bbox[3] - h_bbox[1]
    draw.text((WIDTH // 2 - hw // 2, HEIGHT // 2 - hh // 2 - 120), h_text, font=hangul_font, fill=(244, 63, 94, hangul_alpha))

    # Brand Logo Icon (Film Clapperboard badge)
    logo_progress = ease_out_back(min(1.0, t / 1.2))
    logo_scale = logo_progress
    logo_y = int(HEIGHT // 2 - 150 + (1.0 - logo_progress) * 80)
    logo_size = int(88 * logo_scale)

    if logo_size > 4:
        lx0 = WIDTH // 2 - logo_size // 2
        ly0 = logo_y - logo_size // 2
        lx1 = lx0 + logo_size
        ly1 = ly0 + logo_size
        # Glowing shadow
        draw.rounded_rectangle([lx0 - 6, ly0 - 6, lx1 + 6, ly1 + 6], radius=28, fill=(225, 29, 72, int(80 * logo_progress)))
        # Crimson badge
        draw.rounded_rectangle([lx0, ly0, lx1, ly1], radius=24, fill=(225, 29, 72, 255), outline=(255, 255, 255, 180), width=2)
        # Letter 'D' inside
        d_font = get_font(logo_size * 0.58, bold=True)
        d_bbox = d_font.getbbox("D")
        dw = d_bbox[2] - d_bbox[0]
        dh = d_bbox[3] - d_bbox[1]
        draw.text((WIDTH // 2 - dw // 2, logo_y - dh // 2 - 4), "D", font=d_font, fill=(255, 255, 255, 255))

    # Eyebrow Tag ("OBSIDIAN CINEMA EXPERIENCE")
    if t > 0.6:
        tag_p = ease_in_out_cubic(min(1.0, (t - 0.6) / 0.8))
        tag_font = get_font(15, bold=True)
        tag_alpha = int(255 * tag_p)
        draw_pill_badge(draw, WIDTH // 2, logo_y + 80, "OBSIDIAN CINEMA EXPERIENCE", tag_font,
                        bg_color=(255, 255, 255, int(18 * tag_p)),
                        text_color=(245, 158, 11, tag_alpha),
                        border_color=(245, 158, 11, int(90 * tag_p)),
                        pad_x=22, pad_y=7)

    # Main Brand Typography ("DRAMIFY")
    if t > 0.8:
        title_p = ease_in_out_cubic(min(1.0, (t - 0.8) / 0.9))
        title_font = get_font(86, bold=True)
        title_y = int(logo_y + 160 - (1.0 - title_p) * 30)
        title_text = "D R A M I F Y"
        t_bbox = title_font.getbbox(title_text)
        tw = t_bbox[2] - t_bbox[0]
        # Drop shadow
        draw.text((WIDTH // 2 - tw // 2 + 2, title_y + 3), title_text, font=title_font, fill=(0, 0, 0, int(180 * title_p)))
        # Main text
        draw.text((WIDTH // 2 - tw // 2, title_y), title_text, font=title_font, fill=(255, 255, 255, int(255 * title_p)))

    # Tagline ("The Premium Social Tracking & Discovery Platform for Korean Cinema")
    if t > 1.6:
        sub_p = ease_in_out_cubic(min(1.0, (t - 1.6) / 1.0))
        sub_font = get_font(26, bold=False)
        sub_text = "The Premium Social Tracking & Discovery Platform for Korean Drama & Cinema"
        s_bbox = sub_font.getbbox(sub_text)
        sw = s_bbox[2] - s_bbox[0]
        draw.text((WIDTH // 2 - sw // 2, logo_y + 248), sub_text, font=sub_font, fill=(203, 213, 225, int(230 * sub_p)))

    # Feature preview pills at bottom
    if t > 2.4:
        feat_p = ease_in_out_cubic(min(1.0, (t - 2.4) / 0.8))
        feat_font = get_font(16, bold=True)
        features = [
            ("147 Iconic Titles", (245, 158, 11)),
            ("Sliding Pill View", (244, 63, 94)),
            ("Top 3 Podium", (251, 191, 36)),
            ("Dual Rating HUD", (6, 182, 212))
        ]
        start_x = WIDTH // 2 - 380
        for idx, (ftext, color) in enumerate(features):
            fx = start_x + idx * 250
            draw_pill_badge(draw, fx, HEIGHT - 130, ftext, feat_font,
                            bg_color=(21, 24, 32, int(220 * feat_p)),
                            text_color=(*color, int(255 * feat_p)),
                            border_color=(255, 255, 255, int(35 * feat_p)),
                            pad_x=24, pad_y=10)

def render_scene_2(t, img, draw):
    """Scene 2: 147 Curated Korean Titles & 3D Cards (5.0s - 10.0s)"""
    st = (t - 5.0) / 5.0

    # Header section
    head_p = ease_in_out_cubic(min(1.0, st / 0.2))
    tag_font = get_font(15, bold=True)
    draw_pill_badge(draw, WIDTH // 2, 85, "CURATED ARCHIVE", tag_font,
                    bg_color=(225, 29, 72, 35), text_color=C_ROSE_ACCENT, border_color=(225, 29, 72, 80))

    title_font = get_font(52, bold=True)
    main_head = "147 Hand-Curated Korean Masterpieces"
    hb = title_font.getbbox(main_head)
    hw = hb[2] - hb[0]
    draw.text((WIDTH // 2 - hw // 2, 120), main_head, font=title_font, fill=C_WHITE)

    sub_font = get_font(22, bold=False)
    sub_text = "Zero Broken Posters • Resilient Hangul Typography • Dual TMDB & Fan Reviews"
    sb = sub_font.getbbox(sub_text)
    sw = sb[2] - sb[0]
    draw.text((WIDTH // 2 - sw // 2, 185), sub_text, font=sub_font, fill=C_MUTED)

    # 4 Iconic titles presented as double-bezel cards
    sample_titles = [
        ("Crash Landing on You", "사랑의 불시착", "2019 • Romance / Drama", "9.6 ★", (225, 29, 72)),
        ("Goblin (Guardian)", "쓸쓸하고 찬란하神 - 도깨비", "2016 • Fantasy / Romance", "9.5 ★", (245, 158, 11)),
        ("Parasite", "기생충", "2019 • Thriller / Oscar Winner", "9.8 ★", (6, 182, 212)),
        ("Weak Hero Class 1", "약한영웅 Class 1", "2022 • Action / Youth Noir", "9.7 ★", (168, 85, 247)),
    ]

    card_w = 390
    card_h = 560
    total_w = len(sample_titles) * card_w + (len(sample_titles) - 1) * 35
    start_x = WIDTH // 2 - total_w // 2

    for idx, (en_title, kr_title, meta, score, accent) in enumerate(sample_titles):
        delay = idx * 0.15
        card_t = max(0.0, (st - delay) / 0.4)
        if card_t <= 0:
            continue
        p = ease_out_back(min(1.0, card_t))

        # Floating motion
        float_offset = math.sin(t * 3.0 + idx * 1.2) * 8
        card_x = start_x + idx * (card_w + 35)
        card_y = int(260 + (1.0 - p) * 120 + float_offset)

        # Outer double-bezel shell
        draw.rounded_rectangle([card_x - 3, card_y - 3, card_x + card_w + 3, card_y + card_h + 3],
                               radius=26, fill=(255, 255, 255, 12), outline=(*accent, 90), width=1)

        # Inner card core
        draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h],
                               radius=24, fill=(16, 18, 23, 245), outline=(255, 255, 255, 30), width=1)

        # Card Poster Simulation (Cinematic Gradient Header)
        poster_h = 320
        # Draw gradient simulated poster block
        draw.rounded_rectangle([card_x + 12, card_y + 12, card_x + card_w - 12, card_y + poster_h],
                               radius=18, fill=(21, 24, 32, 255))
        # Atmospheric color wash
        draw.ellipse([card_x + card_w // 2 - 120, card_y + poster_h // 2 - 60,
                      card_x + card_w // 2 + 120, card_y + poster_h // 2 + 60],
                     fill=(*accent, 45))

        # Big Hangul watermark on poster
        ph_font = get_font(56, bold=True, hangul=True)
        ph_bbox = ph_font.getbbox(kr_title[:6])
        phw = ph_bbox[2] - ph_bbox[0]
        draw.text((card_x + card_w // 2 - phw // 2, card_y + 80), kr_title[:6], font=ph_font, fill=(255, 255, 255, 65))

        # Score badge at top-right of poster
        badge_font = get_font(16, bold=True)
        draw_pill_badge(draw, card_x + card_w - 65, card_y + 38, score, badge_font,
                        bg_color=(0, 0, 0, 200), text_color=(251, 191, 36),
                        border_color=(251, 191, 36, 120), pad_x=14, pad_y=5)

        # Rank pill at top-left
        rank_text = f"#{idx + 1}"
        draw_pill_badge(draw, card_x + 45, card_y + 38, rank_text, badge_font,
                        bg_color=(*accent, 220), text_color=C_WHITE, pad_x=12, pad_y=5)

        # Card Typography details
        kr_display_font = get_font(20, bold=True, hangul=True)
        draw.text((card_x + 22, card_y + poster_h + 20), kr_title, font=kr_display_font, fill=C_ROSE_ACCENT)

        en_display_font = get_font(24, bold=True)
        draw.text((card_x + 22, card_y + poster_h + 52), en_title[:24], font=en_display_font, fill=C_WHITE)

        meta_font = get_font(15, bold=False)
        draw.text((card_x + 22, card_y + poster_h + 90), meta, font=meta_font, fill=C_SUBTLE)

        # Watch status pill
        status_font = get_font(13, bold=True)
        draw_pill_badge(draw, card_x + 75, card_y + card_h - 38, "✓ Watched", status_font,
                        bg_color=(255, 255, 255, 12), text_color=(52, 211, 153),
                        border_color=(52, 211, 153, 90), pad_x=14, pad_y=6)

        draw_pill_badge(draw, card_x + card_w - 70, card_y + card_h - 38, "Favorite ♥", status_font,
                        bg_color=(225, 29, 72, 35), text_color=C_ROSE_ACCENT,
                        border_color=(225, 29, 72, 90), pad_x=14, pad_y=6)

def render_scene_3(t, img, draw):
    """Scene 3: Signature Sliding Pill Navigation (10.0s - 15.0s)"""
    st = (t - 10.0) / 5.0

    # Header
    tag_font = get_font(15, bold=True)
    draw_pill_badge(draw, WIDTH // 2, 75, "INTERACTIVE UX", tag_font,
                    bg_color=(245, 158, 11, 30), text_color=C_GOLD, border_color=(245, 158, 11, 80))

    title_font = get_font(50, bold=True)
    main_head = "Signature Sliding Pill Navigation"
    hb = title_font.getbbox(main_head)
    hw = hb[2] - hb[0]
    draw.text((WIDTH // 2 - hw // 2, 108), main_head, font=title_font, fill=C_WHITE)

    sub_font = get_font(21, bold=False)
    sub_text = "Effortlessly glide between 83 TV Series and 64 Blockbuster Films with fluid spring physics"
    sb = sub_font.getbbox(sub_text)
    sw = sb[2] - sb[0]
    draw.text((WIDTH // 2 - sw // 2, 170), sub_text, font=sub_font, fill=C_MUTED)

    # Big Interactive Sliding Pill Component
    pill_w = 640
    pill_h = 76
    pill_x0 = WIDTH // 2 - pill_w // 2
    pill_y0 = 220
    pill_x1 = pill_x0 + pill_w
    pill_y1 = pill_y0 + pill_h

    # Outer pill chassis
    draw.rounded_rectangle([pill_x0 - 4, pill_y0 - 4, pill_x1 + 4, pill_y1 + 4],
                           radius=pill_h // 2 + 4, fill=(255, 255, 255, 10), outline=(255, 255, 255, 25), width=1)
    draw.rounded_rectangle([pill_x0, pill_y0, pill_x1, pill_y1],
                           radius=pill_h // 2, fill=(16, 18, 23, 240), outline=(255, 255, 255, 35), width=1)

    # Dynamic toggle motion: 0 = K-Dramas, 1 = K-Movies
    # Animates from Dramas (left) to Movies (right) then back
    cycle = (t - 10.0) % 3.0
    if cycle < 1.5:
        pill_pos = ease_in_out_cubic(min(1.0, cycle / 0.8))
    else:
        pill_pos = 1.0 - ease_in_out_cubic(min(1.0, (cycle - 1.5) / 0.8))

    tab_w = (pill_w - 16) // 2
    active_x0 = pill_x0 + 8 + int(pill_pos * tab_w)
    active_x1 = active_x0 + tab_w
    active_y0 = pill_y0 + 7
    active_y1 = pill_y1 - 7

    # Glowing active pill indicator
    draw.rounded_rectangle([active_x0 - 2, active_y0 - 2, active_x1 + 2, active_y1 + 2],
                           radius=(active_y1 - active_y0) // 2 + 2, fill=(225, 29, 72, 80))
    draw.rounded_rectangle([active_x0, active_y0, active_x1, active_y1],
                           radius=(active_y1 - active_y0) // 2, fill=C_CRIMSON, outline=(255, 255, 255, 90), width=1)

    # Tab labels
    tab_font = get_font(21, bold=True)

    # Left Tab: K-Dramas (83)
    t1_text = "K-Dramas (83)"
    t1_b = tab_font.getbbox(t1_text)
    t1_w = t1_b[2] - t1_b[0]
    t1_color = C_WHITE if pill_pos < 0.5 else C_MUTED
    draw.text((pill_x0 + 8 + tab_w // 2 - t1_w // 2, pill_y0 + 24), t1_text, font=tab_font, fill=t1_color)

    # Right Tab: K-Movies (64)
    t2_text = "K-Movies (64)"
    t2_b = tab_font.getbbox(t2_text)
    t2_w = t2_b[2] - t2_b[0]
    t2_color = C_WHITE if pill_pos >= 0.5 else C_MUTED
    draw.text((pill_x0 + 8 + tab_w + tab_w // 2 - t2_w // 2, pill_y0 + 24), t2_text, font=tab_font, fill=t2_color)

    # Active State Badge Indicator
    active_name = "K-Dramas" if pill_pos < 0.5 else "K-Movies"
    active_count = "83 Titles Tracked" if pill_pos < 0.5 else "64 Masterpieces Tracked"
    badge_font = get_font(15, bold=True)
    draw_pill_badge(draw, WIDTH // 2, 325, f"Viewing: {active_name} • {active_count}", badge_font,
                    bg_color=(225, 29, 72, 35), text_color=C_ROSE_ACCENT, border_color=(225, 29, 72, 80))

    # Embed App Screenshot (Profile Page showcase)
    if "profile.png" in SCREENSHOTS:
        scr = SCREENSHOTS["profile.png"]
        # Crop & resize to fit center viewport
        # Original is 1440x1100 -> display as 1280x640 window
        scr_resized = scr.resize((1240, 680), Image.Resampling.LANCZOS)
        scr_x = WIDTH // 2 - 620
        scr_y = 360

        # Double-bezel hardware frame for screenshot
        draw.rounded_rectangle([scr_x - 4, scr_y - 4, scr_x + 1244, scr_y + 684],
                               radius=26, fill=(255, 255, 255, 15), outline=(255, 255, 255, 40), width=1)

        # Composite screenshot inside clipping mask
        mask = Image.new("L", (1240, 680), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, 1240, 680], radius=22, fill=255)
        img.paste(scr_resized, (scr_x, scr_y), mask)

def render_scene_4(t, img, draw):
    """Scene 4: Dynamic Top 3 Podium & Dual Rating Showcase (15.0s - 20.0s)"""
    st = (t - 15.0) / 5.0

    # Header
    tag_font = get_font(15, bold=True)
    draw_pill_badge(draw, WIDTH // 2, 70, "HALL OF FAME & RATINGS", tag_font,
                    bg_color=(245, 158, 11, 35), text_color=C_GOLD, border_color=(245, 158, 11, 90))

    title_font = get_font(48, bold=True)
    main_head = "Dynamic Top 3 Podium & Dual Critic Ratings"
    hb = title_font.getbbox(main_head)
    hw = hb[2] - hb[0]
    draw.text((WIDTH // 2 - hw // 2, 102), main_head, font=title_font, fill=C_WHITE)

    sub_font = get_font(21, bold=False)
    sub_text = "Compare Official TMDB Critic Scores against Dramify Community Ratings"
    sb = sub_font.getbbox(sub_text)
    sw = sb[2] - sb[0]
    draw.text((WIDTH // 2 - sw // 2, 162), sub_text, font=sub_font, fill=C_MUTED)

    # 3 Podium Pedestals: Silver (#2, left), Gold (#1, center), Bronze (#3, right)
    podium_data = [
        # (Rank, Title, Hangul, Height, X-Offset, Accent, ScoreTMDB, ScoreCommunity)
        ("2nd Place", "Goblin: The Lonely God", "도깨비", 340, -380, (203, 213, 225), "8.8", "9.6"),
        ("1st Place", "Crash Landing on You", "사랑의 불시착", 430, 0, (245, 158, 11), "8.9", "9.8"),
        ("3rd Place", "Weak Hero Class 1", "약한영웅", 280, 380, (217, 119, 6), "8.6", "9.5"),
    ]

    base_y = 960

    for rank_txt, en_t, kr_t, target_h, x_off, accent_col, tmdb_sc, comm_sc in podium_data:
        # Rising pillar animation
        rise_p = ease_out_back(min(1.0, (st - 0.1) / 0.5))
        current_h = int(target_h * rise_p)

        col_w = 340
        col_x0 = WIDTH // 2 + x_off - col_w // 2
        col_x1 = col_x0 + col_w
        col_y0 = base_y - current_h
        col_y1 = base_y

        # Ambient pillar glow for Gold
        if "1st" in rank_txt:
            draw.ellipse([col_x0 - 40, col_y0 - 60, col_x1 + 40, col_y0 + 100], fill=(245, 158, 11, 45))

        # Outer pedestal shell
        draw.rounded_rectangle([col_x0 - 3, col_y0 - 3, col_x1 + 3, col_y1],
                               radius=24, fill=(255, 255, 255, 12), outline=(*accent_col, 80), width=1)
        # Pedestal core
        draw.rounded_rectangle([col_x0, col_y0, col_x1, col_y1],
                               radius=22, fill=(21, 24, 32, 250), outline=(255, 255, 255, 30), width=1)

        # Medal Badge at top of pillar
        m_font = get_font(24, bold=True)
        draw_pill_badge(draw, col_x0 + col_w // 2, col_y0 + 40, rank_txt, m_font,
                        bg_color=(*accent_col, 40), text_color=accent_col,
                        border_color=(*accent_col, 130), pad_x=22, pad_y=8)

        # Title text
        k_font = get_font(18, bold=True, hangul=True)
        kb = k_font.getbbox(kr_t)
        kw = kb[2] - kb[0]
        draw.text((col_x0 + col_w // 2 - kw // 2, col_y0 + 85), kr_t, font=k_font, fill=C_ROSE_ACCENT)

        e_font = get_font(21, bold=True)
        eb = e_font.getbbox(en_t[:19])
        ew = eb[2] - eb[0]
        draw.text((col_x0 + col_w // 2 - ew // 2, col_y0 + 118), en_t[:19], font=e_font, fill=C_WHITE)

        # Dual Rating HUD Section
        hud_y = col_y0 + 170
        r_font = get_font(14, bold=True)

        # TMDB Score Pill
        draw_pill_badge(draw, col_x0 + col_w // 2, hud_y, f"TMDB Critic: ★ {tmdb_sc}", r_font,
                        bg_color=(6, 182, 212, 25), text_color=(6, 182, 212),
                        border_color=(6, 182, 212, 80), pad_x=18, pad_y=6)

        # Dramify Community Pill
        draw_pill_badge(draw, col_x0 + col_w // 2, hud_y + 45, f"Dramify Score: ★ {comm_sc}", r_font,
                        bg_color=(225, 29, 72, 35), text_color=C_ROSE_ACCENT,
                        border_color=(225, 29, 72, 90), pad_x=18, pad_y=6)

        # Progress fill bar
        bar_w = 260
        bar_h = 10
        bx0 = col_x0 + col_w // 2 - bar_w // 2
        by0 = hud_y + 85
        draw.rounded_rectangle([bx0, by0, bx0 + bar_w, by0 + bar_h], radius=5, fill=(255, 255, 255, 15))
        score_val = float(comm_sc) / 10.0
        draw.rounded_rectangle([bx0, by0, bx0 + int(bar_w * score_val), by0 + bar_h], radius=5, fill=C_CRIMSON)

def render_scene_5(t, img, draw):
    """Scene 5: Converged UI Showcase & Call to Action (20.0s - 25.0s)"""
    st = (t - 20.0) / 5.0

    # Fade to black at very end (last 0.8s)
    fade = 1.0
    if t > 24.2:
        fade = max(0.0, (25.0 - t) / 0.8)

    # Ambient golden-crimson center glow
    glow_alpha = int(60 * fade)
    draw.ellipse([WIDTH // 2 - 500, HEIGHT // 2 - 300, WIDTH // 2 + 500, HEIGHT // 2 + 300], fill=(225, 29, 72, glow_alpha))

    # Top Eyebrow
    tag_font = get_font(16, bold=True)
    draw_pill_badge(draw, WIDTH // 2, 140, "ELEVATE YOUR K-DRAMA JOURNEY", tag_font,
                    bg_color=(225, 29, 72, int(35 * fade)),
                    text_color=(*C_ROSE_ACCENT, int(255 * fade)),
                    border_color=(225, 29, 72, int(90 * fade)))

    # Giant Headline
    h1_p = ease_out_back(min(1.0, st / 0.3))
    h1_font = get_font(68, bold=True)
    h1_text = "Track. Discover. Rate. Devote."
    h1_b = h1_font.getbbox(h1_text)
    h1_w = h1_b[2] - h1_b[0]
    draw.text((WIDTH // 2 - h1_w // 2, 185), h1_text, font=h1_font, fill=(*C_WHITE, int(255 * fade)))

    # Hangul subtitle ("한국 드라마 & 영화 소셜 플랫폼")
    sub_k_font = get_font(26, bold=True, hangul=True)
    sub_k_text = "한국 드라마 & 영화 아카이브 소셜 플랫폼"
    sk_b = sub_k_font.getbbox(sub_k_text)
    sk_w = sk_b[2] - sk_b[0]
    draw.text((WIDTH // 2 - sk_w // 2, 275), sub_k_text, font=sub_k_font, fill=(*C_GOLD, int(240 * fade)))

    # Dual UI Cards Preview (Home showcase & Discover feed)
    if "home.png" in SCREENSHOTS:
        h_scr = SCREENSHOTS["home.png"].resize((720, 420), Image.Resampling.LANCZOS)
        hx = WIDTH // 2 - 760
        hy = 360
        draw.rounded_rectangle([hx - 3, hy - 3, hx + 723, hy + 423], radius=20, fill=(255, 255, 255, int(15 * fade)))
        mask = Image.new("L", (720, 420), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, 720, 420], radius=18, fill=int(255 * fade))
        img.paste(h_scr, (hx, hy), mask)

    if "discover.png" in SCREENSHOTS:
        d_scr = SCREENSHOTS["discover.png"].resize((720, 420), Image.Resampling.LANCZOS)
        dx = WIDTH // 2 + 40
        dy = 360
        draw.rounded_rectangle([dx - 3, dy - 3, dx + 723, dy + 423], radius=20, fill=(255, 255, 255, int(15 * fade)))
        mask = Image.new("L", (720, 420), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, 720, 420], radius=18, fill=int(255 * fade))
        img.paste(d_scr, (dx, dy), mask)

    # Big CTA Button at Bottom ("Explore Dramify Today")
    cta_font = get_font(24, bold=True)
    draw_pill_badge(draw, WIDTH // 2, 860, "EXPLORE DRAMIFY TODAY", cta_font,
                    bg_color=(*C_CRIMSON, int(255 * fade)),
                    text_color=(*C_WHITE, int(255 * fade)),
                    border_color=(255, 255, 255, int(160 * fade)),
                    pad_x=45, pad_y=16)

    # Sub-caption
    meta_font = get_font(18, bold=False)
    meta_txt = "Available on Web • Open Source on GitHub: Vivek-k001/Dramify"
    mb = meta_font.getbbox(meta_txt)
    mw = mb[2] - mb[0]
    draw.text((WIDTH // 2 - mw // 2, 925), meta_txt, font=meta_font, fill=(*C_MUTED, int(200 * fade)))

def render_frame(t):
    """Main frame rendering dispatcher"""
    # Create base frame
    frame = BG_BASE.copy()
    draw = ImageDraw.Draw(frame)

    # Subtle particle drift
    for idx in range(NUM_STARS):
        sx = int((STAR_X[idx] + t * STAR_SPEED[idx] * 12) % WIDTH)
        sy = int((STAR_Y[idx] + t * STAR_SPEED[idx] * 8) % HEIGHT)
        sr = STAR_R[idx]
        alpha = int(120 + 90 * math.sin(t * 3.0 + idx))
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 255, 255, alpha))

    # Dispatch scenes based on timestamp
    if t < 5.0:
        render_scene_1(t, frame, draw)
    elif t < 10.0:
        render_scene_2(t, frame, draw)
    elif t < 15.0:
        render_scene_3(t, frame, draw)
    elif t < 20.0:
        render_scene_4(t, frame, draw)
    else:
        render_scene_5(t, frame, draw)

    # Frame number & watermark in microscopic text (tech aesthetic)
    dbg_font = get_font(11, bold=False)
    draw.text((WIDTH - 210, HEIGHT - 28), f"DRAMIFY PROMO • 1080P60", font=dbg_font, fill=(255, 255, 255, 45))

    # Convert to RGB numpy array for MoviePy
    return np.array(frame.convert("RGB"))

def synthesize_cinematic_audio(duration, sample_rate=44100):
    """
    Synthesize an atmospheric cinematic soundtrack:
    - Deep sub-bass drone
    - Warm minor chord progression (D minor -> Bb -> F -> C)
    - High shimmering harmonics and ambient stereo movement
    - Transition swoosh/riser cues at 5.0s, 10.0s, 15.0s, 20.0s
    """
    num_samples = int(duration * sample_rate)
    t = np.linspace(0, duration, num_samples, endpoint=False)

    # Chord progression intervals (in seconds): [0..5] Dm, [5..10] Bb, [10..15] F, [15..20] C, [20..25] Dm
    # Base frequencies (Hz)
    chords = [
        [73.42, 110.00, 146.83, 220.00, 261.63], # Dm9
        [58.27, 116.54, 174.61, 233.08, 293.66], # Bb maj7
        [87.31, 130.81, 174.61, 261.63, 329.63], # F maj9
        [65.41, 130.81, 196.00, 261.63, 392.00], # C sus2
        [73.42, 110.00, 146.83, 220.00, 329.63], # Dm finale
    ]

    left_ch = np.zeros(num_samples)
    right_ch = np.zeros(num_samples)

    for seg_idx, chord_notes in enumerate(chords):
        t_start = seg_idx * 5.0
        t_end = min(duration, (seg_idx + 1) * 5.0)
        idx_mask = (t >= t_start) & (t < t_end)
        seg_t = t[idx_mask] - t_start
        seg_len = t_end - t_start

        # Smooth envelope for each segment
        seg_env = np.sin(np.pi * seg_t / seg_len) ** 0.6

        seg_wave_l = np.zeros_like(seg_t)
        seg_wave_r = np.zeros_like(seg_t)

        for n_idx, freq in enumerate(chord_notes):
            # Rich saw/sine blend
            note_wave = 0.6 * np.sin(2 * np.pi * freq * seg_t) + 0.25 * np.sin(4 * np.pi * freq * seg_t)
            # Stereo panning
            pan_l = 0.5 + 0.3 * math.sin(n_idx * 1.5)
            pan_r = 1.0 - pan_l
            seg_wave_l += note_wave * pan_l
            seg_wave_r += note_wave * pan_r

        left_ch[idx_mask] += seg_wave_l * seg_env * 0.18
        right_ch[idx_mask] += seg_wave_r * seg_env * 0.18

    # Continuous Deep Sub-Bass Drone (55 Hz)
    sub_drone = 0.22 * np.sin(2 * np.pi * 55.0 * t) + 0.12 * np.sin(2 * np.pi * 110.0 * t)
    left_ch += sub_drone
    right_ch += sub_drone

    # Cinematic Transition Risers / Impacts at each 5s boundary
    for cue_t in [5.0, 10.0, 15.0, 20.0]:
        # Whoosh riser leading up to cue_t (1.5s before)
        riser_mask = (t >= cue_t - 1.5) & (t < cue_t)
        if np.any(riser_mask):
            rt = (t[riser_mask] - (cue_t - 1.5)) / 1.5
            riser_freq = 150 + 600 * (rt ** 2)
            noise = np.random.uniform(-0.15, 0.15, len(rt))
            riser_wave = (np.sin(2 * np.pi * riser_freq * t[riser_mask]) + noise) * (rt ** 1.8) * 0.25
            left_ch[riser_mask] += riser_wave
            right_ch[riser_mask] += riser_wave

        # Impact hit right at cue_t (1.0s decay)
        hit_mask = (t >= cue_t) & (t < cue_t + 1.2)
        if np.any(hit_mask):
            ht = t[hit_mask] - cue_t
            hit_env = np.exp(-4.0 * ht)
            hit_wave = np.sin(2 * np.pi * 65.0 * np.exp(-3.0 * ht) * ht) * hit_env * 0.35
            left_ch[hit_mask] += hit_wave
            right_ch[hit_mask] += hit_wave

    # Global master volume envelope (Fade in 1.2s, Fade out 1.5s)
    master_env = np.ones(num_samples)
    fade_in_samples = int(1.2 * sample_rate)
    fade_out_samples = int(1.5 * sample_rate)
    master_env[:fade_in_samples] = np.linspace(0.0, 1.0, fade_in_samples)
    master_env[-fade_out_samples:] = np.linspace(1.0, 0.0, fade_out_samples)

    left_ch = np.clip(left_ch * master_env, -0.95, 0.95)
    right_ch = np.clip(right_ch * master_env, -0.95, 0.95)

    # Return shape: (num_samples, 2)
    return np.column_stack((left_ch, right_ch))

def main():
    print("=" * 60)
    print("[DRAMIFY] MOTION GRAPHICS VIDEO GENERATOR")
    print("=" * 60)
    print(f"Target: {OUTPUT_PATH}")
    print(f"Resolution: {WIDTH}x{HEIGHT} @ {FPS}fps")
    print(f"Duration: {DURATION}s (Total frames: {int(DURATION * FPS)})")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    print("\n[1/3] Synthesizing Cinematic Soundtrack...")
    audio_data = synthesize_cinematic_audio(DURATION)
    audio_clip = AudioArrayClip(audio_data, fps=44100)

    print("[2/3] Initializing Video Clip & Frame Sequencer...")
    clip = VideoClip(render_frame, duration=DURATION)
    clip.fps = FPS
    clip = clip.with_audio(audio_clip)

    print(f"[3/3] Rendering MP4 with libx264...")
    clip.write_videofile(
        OUTPUT_PATH,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        preset="medium",
        bitrate="6000k",
        threads=4,
        logger="bar"
    )

    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print("\n" + "=" * 60)
    print("[SUCCESS] Video Generated Successfully!")
    print(f"Output File: {OUTPUT_PATH}")
    print(f"Total Size: {file_size_mb:.2f} MB")
    print("=" * 60)

if __name__ == "__main__":
    main()
