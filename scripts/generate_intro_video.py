#!/usr/bin/env python3
"""
Dramify -- Simple Motion Graphics Intro Video
Clean, minimal 20-second introduction video. Text-first, 5 neat scenes.

Scenes:
  0 -  4s  Scene 1: Title Card  (Logo + DRAMIFY + Korean subtitle)
  4 -  8s  Scene 2: What Is It  (Platform one-liner)
  8 - 12s  Scene 3: Features    (3 bullet lines staggered in)
 12 - 16s  Scene 4: Screenshots (Home + Profile side by side)
 16 - 20s  Scene 5: CTA         ("Track. Discover. Rate. Devote.")

Usage:
    python scripts/generate_intro_video.py
Output:
    docs/videos/dramify_intro.mp4
"""

import os
import sys
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Fix Windows console encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from moviepy import VideoClip, AudioArrayClip

# ── Config ────────────────────────────────────────────────────────────────────
W, H   = 1920, 1080
FPS    = 30
TOTAL  = 20.0

SCENE_BREAKS = [0.0, 4.0, 8.0, 12.0, 16.0, 20.0]
FADE_DUR     = 0.55   # cross-fade duration between scenes

OUTPUT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "docs", "videos", "dramify_intro.mp4")
)

# ── Palette ───────────────────────────────────────────────────────────────────
BG      = (8,   9,  12)
WHITE   = (255, 255, 255)
CRIMSON = (225,  29,  72)
GOLD    = (245, 158,  11)
MUTED   = (148, 163, 184)

# ── Fonts ─────────────────────────────────────────────────────────────────────
FONT_DIR = "C:/Windows/Fonts"

def font(size, bold=False, korean=False):
    candidates = []
    if korean:
        candidates += [
            os.path.join(FONT_DIR, "malgunbd.ttf" if bold else "malgun.ttf"),
            os.path.join(FONT_DIR, "gulim.ttc"),
        ]
    candidates += [
        os.path.join(FONT_DIR, "segoeuib.ttf" if bold else "segoeui.ttf"),
        os.path.join(FONT_DIR, "arialbd.ttf"  if bold else "arial.ttf"),
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, int(size))
            except Exception:
                pass
    return ImageFont.load_default()

# ── Easing ────────────────────────────────────────────────────────────────────
def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

# ── Drawing helpers ───────────────────────────────────────────────────────────
def centered_text(draw, text, fnt, cy, color, alpha=255):
    bb = fnt.getbbox(text)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    draw.text(((W - tw) // 2, cy - th // 2), text, font=fnt, fill=(*color[:3], alpha))

def element_alpha(t, appear_at, fade_in=0.45, hold_until=None, fade_out=0.45):
    if t < appear_at:
        return 0
    rel = t - appear_at
    a = ease(rel / fade_in)
    if hold_until is not None and t > hold_until:
        a = ease(max(0.0, (hold_until + fade_out - t) / fade_out))
    return int(255 * a)

# ── Screenshots ───────────────────────────────────────────────────────────────
SS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots"))
SCREENS = {}
for _name in ["home.png", "profile.png"]:
    _p = os.path.join(SS_DIR, _name)
    if os.path.exists(_p):
        try:
            SCREENS[_name] = Image.open(_p).convert("RGBA")
        except Exception:
            pass

def paste_screen(base, scr, box, radius=20, alpha=255):
    bw, bh = box[2] - box[0], box[3] - box[1]
    rs = scr.resize((bw, bh), Image.Resampling.LANCZOS)
    if alpha < 255:
        r2, g2, b2, a2 = rs.split()
        a2 = a2.point(lambda x: x * alpha // 255)
        rs = Image.merge("RGBA", (r2, g2, b2, a2))
    mask = Image.new("L", (bw, bh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, bw, bh], radius=radius, fill=255)
    base.paste(rs, (box[0], box[1]), mask)

# ── Static background ─────────────────────────────────────────────────────────
def build_bg():
    img = Image.new("RGBA", (W, H), (*BG, 255))
    return img

BG_LAYER = build_bg()

# ═════════════════════════════════════════════════════════════════════════════
# SCENE RENDERERS
# ═════════════════════════════════════════════════════════════════════════════

def scene_1(img, draw, t):
    """Title Card: Logo  --  DRAMIFY  --  Korean subtitle."""
    s, e = 0.0, 4.0

    # Soft glow
    glow_a = int(50 * ease((t - s) / 0.9))
    draw.ellipse([W//2 - 90, H//2 - 210, W//2 + 90, H//2 - 30], fill=(*CRIMSON, glow_a))

    # Logo circle
    a_logo = element_alpha(t, s + 0.1, 0.5, e - 0.5)
    if a_logo:
        r = 46
        cx, lcy = W // 2, H // 2 - 118
        draw.ellipse([cx-r, lcy-r, cx+r, lcy+r], fill=(*CRIMSON, a_logo))
        lf = font(50, bold=True)
        lb = lf.getbbox("D")
        lw, lh = lb[2] - lb[0], lb[3] - lb[1]
        draw.text((cx - lw//2, lcy - lh//2 - 2), "D", font=lf, fill=(*WHITE, a_logo))

    # DRAMIFY wordmark
    a_title = element_alpha(t, s + 0.35, 0.55, e - 0.5)
    if a_title:
        centered_text(draw, "DRAMIFY", font(88, bold=True), H // 2 - 10, WHITE, a_title)

    # Divider
    a_div = element_alpha(t, s + 0.65, 0.4, e - 0.5)
    if a_div:
        x0 = (W - 200) // 2
        draw.line([(x0, H//2 + 52), (x0 + 200, H//2 + 52)], fill=(255,255,255, a_div//5), width=1)

    # Korean subtitle
    a_kr = element_alpha(t, s + 0.75, 0.5, e - 0.5)
    if a_kr:
        centered_text(draw, "\ub4dc\ub77c\ub9c8", font(32, korean=True), H//2 + 76, GOLD, a_kr)


def scene_2(img, draw, t):
    """Platform description."""
    s, e = 4.0, 8.0

    a1 = element_alpha(t, s + 0.15, 0.5, e - 0.5)
    if a1:
        centered_text(draw, "The Premium Tracking & Discovery Platform",
                      font(46, bold=True), H//2 - 38, WHITE, a1)

    a2 = element_alpha(t, s + 0.45, 0.5, e - 0.5)
    if a2:
        centered_text(draw, "for Korean Drama & Cinema",
                      font(36), H//2 + 30, MUTED, a2)

    a3 = element_alpha(t, s + 0.7, 0.4, e - 0.5)
    if a3:
        x0 = (W - 80) // 2
        draw.line([(x0, H//2 + 82), (x0 + 80, H//2 + 82)],
                  fill=(*CRIMSON, a3), width=3)


def scene_3(img, draw, t):
    """3 staggered feature bullets."""
    s, e = 8.0, 12.0

    # Section label
    a_lbl = element_alpha(t, s + 0.1, 0.4, e - 0.5)
    if a_lbl:
        centered_text(draw, "CORE FEATURES", font(14, bold=True), H//2 - 138, MUTED, a_lbl // 2)

    bullets = [
        ("147 Curated Korean Titles",     WHITE,  s + 0.2),
        ("Dual TMDB & Community Ratings", MUTED,  s + 0.55),
        ("Dynamic Top 3 Podium",          MUTED,  s + 0.9),
    ]
    bf = font(38, bold=True)
    sf = font(26, bold=True)
    sy = H // 2 - 58

    for idx, (text, color, appear) in enumerate(bullets):
        ba = element_alpha(t, appear, 0.45, e - 0.5)
        if not ba:
            continue
        y = sy + idx * 78
        sb = sf.getbbox("*")
        sw = sb[2] - sb[0]
        tb = bf.getbbox(text)
        tw, th = tb[2] - tb[0], tb[3] - tb[1]
        total_w = sw + 16 + tw
        x0 = (W - total_w) // 2
        draw.text((x0, y - (sb[3] - sb[1]) // 2), "*", font=sf, fill=(*CRIMSON, ba))
        draw.text((x0 + sw + 16, y - th // 2), text, font=bf, fill=(*color, ba))


def scene_4(img, draw, t):
    """Two app screenshots side by side."""
    s, e = 12.0, 16.0

    a_lbl = element_alpha(t, s + 0.1, 0.4, e - 0.5)
    if a_lbl:
        centered_text(draw, "THE EXPERIENCE", font(14, bold=True), 130, MUTED, a_lbl // 2)

    a_scr = element_alpha(t, s + 0.2, 0.55, e - 0.5)
    if a_scr and SCREENS:
        gap = 32
        sw = (W - 240 - gap) // 2
        sh = int(sw * 0.60)
        ty = H // 2 - sh // 2 - 20

        pairs = []
        if "home.png" in SCREENS and "profile.png" in SCREENS:
            pairs = [
                ("home.png",    [120, ty, 120 + sw, ty + sh]),
                ("profile.png", [120 + sw + gap, ty, 120 + sw * 2 + gap, ty + sh]),
            ]
        elif SCREENS:
            key = list(SCREENS.keys())[0]
            pairs = [(key, [340, ty, W - 340, ty + sh])]

        for name, box in pairs:
            draw.rounded_rectangle(
                [box[0]-3, box[1]-3, box[2]+3, box[3]+3],
                radius=22,
                fill=(255, 255, 255, a_scr // 10),
                outline=(255, 255, 255, a_scr // 4),
                width=1,
            )
            paste_screen(img, SCREENS[name], box, radius=20, alpha=a_scr)

    a_cap = element_alpha(t, s + 0.7, 0.4, e - 0.5)
    if a_cap:
        centered_text(draw, "Beautiful. Fast. Obsidian Cinema.",
                      font(22), H - 158, MUTED, a_cap)


def scene_5(img, draw, t):
    """Closing CTA -- fades to black."""
    s, e = 16.0, 20.0

    a_h1 = element_alpha(t, s + 0.2, 0.6, e - 0.9)
    if a_h1:
        centered_text(draw, "Track. Discover. Rate. Devote.",
                      font(68, bold=True), H//2 - 38, WHITE, a_h1)

    a_br = element_alpha(t, s + 0.65, 0.5, e - 0.9)
    if a_br:
        centered_text(draw, "DRAMIFY  \u2022  \ub4dc\ub77c\ub9c8",
                      font(28, korean=True), H//2 + 50, GOLD, a_br)

    # Fade to black
    if t > e - 1.1:
        fade_a = int(255 * ease((t - (e - 1.1)) / 1.0))
        draw.rectangle([0, 0, W, H], fill=(0, 0, 0, min(255, fade_a)))


# ═════════════════════════════════════════════════════════════════════════════
# FRAME DISPATCHER
# ═════════════════════════════════════════════════════════════════════════════

RENDERERS = [scene_1, scene_2, scene_3, scene_4, scene_5]

def render_frame(t):
    frame = BG_LAYER.copy()
    draw  = ImageDraw.Draw(frame, "RGBA")

    # Which scene are we in?
    scene_idx = max(i for i, sb in enumerate(SCENE_BREAKS[:-1]) if t >= sb)
    s_start = SCENE_BREAKS[scene_idx]

    # Cross-fade at scene boundary
    is_cross = scene_idx > 0 and (t - s_start) < FADE_DUR

    if is_cross:
        prev_idx = scene_idx - 1
        out_a = ease(1.0 - (t - s_start) / FADE_DUR)
        in_a  = ease((t - s_start) / FADE_DUR)

        prev_layer = BG_LAYER.copy()
        RENDERERS[prev_idx](prev_layer, ImageDraw.Draw(prev_layer, "RGBA"),
                             SCENE_BREAKS[prev_idx + 1] - 0.02)
        frame = Image.alpha_composite(frame, prev_layer.point(lambda p: int(p * out_a)))

        cur_layer = BG_LAYER.copy()
        RENDERERS[scene_idx](cur_layer, ImageDraw.Draw(cur_layer, "RGBA"), t)
        frame = Image.alpha_composite(frame, cur_layer.point(lambda p: int(p * in_a)))
    else:
        RENDERERS[scene_idx](frame, draw, t)

    return np.array(frame.convert("RGB"))


# ═════════════════════════════════════════════════════════════════════════════
# AUDIO -- gentle ambient Dm pad
# ═════════════════════════════════════════════════════════════════════════════

def build_audio(duration, sr=44100):
    n = int(duration * sr)
    t = np.linspace(0, duration, n, endpoint=False)

    signal = np.zeros(n)
    for f in [146.83, 174.61, 220.00, 261.63]:   # Dm chord
        signal += 0.07 * np.sin(2 * np.pi * f * t)
        signal += 0.03 * np.sin(4 * np.pi * f * t)
    signal += 0.10 * np.sin(2 * np.pi * 55.0 * t)  # sub bass

    env = np.ones(n)
    fi = int(1.2 * sr); env[:fi]  = np.linspace(0, 1, fi)
    fo = int(1.5 * sr); env[-fo:] = np.linspace(1, 0, fo)
    signal = np.clip(signal * env, -0.9, 0.9)

    return np.column_stack([signal, signal])  # stereo


# ═════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═════════════════════════════════════════════════════════════════════════════

def main():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

    print("=" * 52)
    print("  Dramify -- Intro Motion Graphics Renderer")
    print("=" * 52)
    print(f"  Output  : {OUTPUT}")
    print(f"  Size    : {W}x{H}  |  {FPS}fps  |  {TOTAL:.0f}s")
    print()

    print("[1/3] Building audio ...")
    audio_clip = AudioArrayClip(build_audio(TOTAL), fps=44100)

    print("[2/3] Initialising video clip ...")
    clip = VideoClip(render_frame, duration=TOTAL)
    clip.fps = FPS
    clip = clip.with_audio(audio_clip)

    print("[3/3] Rendering (approx. 30-45s) ...")
    clip.write_videofile(
        OUTPUT, fps=FPS, codec="libx264", audio_codec="aac",
        preset="medium", bitrate="5000k", threads=4, logger="bar",
    )

    mb = os.path.getsize(OUTPUT) / 1024 / 1024
    print()
    print("=" * 52)
    print("  Done!")
    print(f"  File: {OUTPUT}")
    print(f"  Size: {mb:.2f} MB")
    print("=" * 52)


if __name__ == "__main__":
    main()
