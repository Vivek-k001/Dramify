import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Download, 
  Video, ArrowLeft, CheckCircle2, Layers
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SceneMarker {
  id: number;
  time: number;
  label: string;
  badge: string;
}

const SCENES: SceneMarker[] = [
  { id: 1, time: 0, label: '01. Cold Open', badge: 'BRAND IDENTITY' },
  { id: 2, time: 5, label: '02. 147 Titles', badge: 'CURATED ARCHIVE' },
  { id: 3, time: 10, label: '03. Sliding Pill', badge: 'SIGNATURE UX' },
  { id: 4, time: 15, label: '04. Top 3 Podium', badge: 'DUAL RATINGS' },
  { id: 5, time: 20, label: '05. Finale & CTA', badge: 'JOIN DRAMIFY' },
];

const TOTAL_DURATION = 25.0; // 25 seconds

export const PromoPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [hasMp4Video, setHasMp4Video] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Check if rendered mp4 is available
  useEffect(() => {
    fetch('/videos/dramify_promo.mp4', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setHasMp4Video(true);
      })
      .catch(() => {});
  }, []);

  // Web Audio Synth for cinematic sound in browser
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.22, ctx.currentTime);
      masterGain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      audioGainRef.current = masterGain;

      // Deep cinematic ambient drone (55Hz and 110Hz)
      const oscSub = ctx.createOscillator();
      oscSub.type = 'sawtooth';
      oscSub.frequency.setValueAtTime(55, ctx.currentTime);
      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(140, ctx.currentTime);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.18, ctx.currentTime);
      oscSub.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);
      oscSub.start();

      // Atmospheric chord pad
      const chords = [146.83, 174.61, 220.00, 261.63]; // Dm
      chords.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const pGain = ctx.createGain();
        pGain.gain.setValueAtTime(0.06, ctx.currentTime);
        osc.connect(pGain);
        pGain.connect(masterGain);
        osc.start();
      });
    } catch {
      // Audio not permitted without user gesture
    }
  };

  const toggleSound = () => {
    if (!audioCtxRef.current) {
      initAudio();
      setIsMuted(false);
      return;
    }
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioGainRef.current && audioCtxRef.current) {
      audioGainRef.current.gain.setTargetAtTime(nextMuted ? 0 : 0.25, audioCtxRef.current.currentTime, 0.05);
    }
  };

  // Easing utilities
  const easeOutBack = (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  // Canvas Motion Graphics Renderer
  const renderFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.clearRect(0, 0, width, height);

    // Deep OLED Background with subtle gradient
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.75);
    bgGrad.addColorStop(0, '#101217');
    bgGrad.addColorStop(1, '#07080B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const spacing = 80;
    for (let x = 0; x < width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dynamic Atmospheric Radial Glow
    const glowPulse = Math.sin(time * 2.5);
    const glowRad = ctx.createRadialGradient(width / 2, height / 2 - 30, 20, width / 2, height / 2 - 30, 480);
    glowRad.addColorStop(0, `rgba(225, 29, 72, ${0.12 + 0.06 * glowPulse})`);
    glowRad.addColorStop(0.6, `rgba(245, 158, 11, ${0.04 + 0.02 * glowPulse})`);
    glowRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowRad;
    ctx.fillRect(0, 0, width, height);

    // Ambient floating particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      const px = ((i * 137.5 + time * 24 * ((i % 3) + 1)) % width);
      const py = ((i * 89.3 + time * 16 * ((i % 2) + 1)) % height);
      const pr = 1 + (i % 3) * 0.7;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // -------------------------------------------------------------
    // SCENE 1: COLD OPEN & BRAND IDENTITY (0.0s - 5.0s)
    // -------------------------------------------------------------
    if (time < 5.0) {

      // Giant Hangul Watermark ("드라마")
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 180px "Plus Jakarta Sans", sans-serif';
      const hAlpha = 0.04 + 0.02 * Math.sin(time * 2);
      ctx.fillStyle = `rgba(244, 63, 94, ${hAlpha})`;
      ctx.fillText('드라마', width / 2, height / 2 - 40);
      ctx.restore();

      // Brand Clapperboard Icon
      const logoScale = easeOutBack(Math.min(1.0, time / 1.2));
      const logoY = height / 2 - 130 + (1.0 - logoScale) * 60;
      const logoSize = 88 * logoScale;

      if (logoSize > 2) {
        ctx.save();
        ctx.translate(width / 2, logoY);
        // Glow shadow
        ctx.shadowColor = 'rgba(225, 29, 72, 0.6)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.roundRect(-logoSize / 2, -logoSize / 2, logoSize, logoSize, 24);
        ctx.fill();

        // Border highlight
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Clapperboard 'D'
        ctx.font = `800 ${logoSize * 0.56}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('D', 0, -2);
        ctx.restore();
      }

      // Pill Eyebrow
      if (time > 0.6) {
        const p1 = easeInOutCubic(Math.min(1.0, (time - 0.6) / 0.8));
        ctx.save();
        ctx.globalAlpha = p1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 160, logoY + 65, 320, 32, 16);
        ctx.fill();
        ctx.stroke();

        ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#F59E0B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OBSIDIAN CINEMA EXPERIENCE', width / 2, logoY + 81);
        ctx.restore();
      }

      // Title Typography ("DRAMIFY")
      if (time > 0.8) {
        const p2 = easeInOutCubic(Math.min(1.0, (time - 0.8) / 0.9));
        ctx.save();
        ctx.globalAlpha = p2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 78px "Outfit", "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillText('D R A M I F Y', width / 2, logoY + 140);

        // Tagline
        ctx.shadowBlur = 0;
        ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('The Premium Social Tracking & Discovery Platform for Korean Cinema', width / 2, logoY + 205);
        ctx.restore();
      }

      // Feature preview pills at bottom
      if (time > 2.0) {
        const fp = easeInOutCubic(Math.min(1.0, (time - 2.0) / 0.8));
        ctx.save();
        ctx.globalAlpha = fp;
        const pills = [
          { text: '★ 147 Curated Titles', color: '#F59E0B' },
          { text: '🎚️ Sliding Pill View', color: '#F43F5E' },
          { text: '🏆 Top 3 Podium', color: '#FBBF24' },
          { text: '⭐ Dual Rating HUD', color: '#06B6D4' }
        ];
        const startX = width / 2 - 420;
        pills.forEach((pill, idx) => {
          const px = startX + idx * 220;
          ctx.fillStyle = 'rgba(21, 24, 32, 0.85)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(px, height - 120, 200, 42, 21);
          ctx.fill();
          ctx.stroke();

          ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = pill.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pill.text, px + 100, height - 99);
        });
        ctx.restore();
      }
    }

    // -------------------------------------------------------------
    // SCENE 2: 147 CURATED KOREAN TITLES & 3D CARDS (5.0s - 10.0s)
    // -------------------------------------------------------------
    else if (time >= 5.0 && time < 10.0) {
      const st = (time - 5.0) / 5.0;

      // Header
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Eyebrow
      ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 100, 60, 200, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#F43F5E';
      ctx.fillText('CURATED ARCHIVE', width / 2, 74);

      // Main Heading
      ctx.font = '800 44px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('147 Hand-Curated Korean Masterpieces', width / 2, 120);

      ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('Zero Broken Posters • Resilient Hangul Typography • Dual TMDB & Fan Reviews', width / 2, 160);
      ctx.restore();

      // 4 Dynamic Cards
      const cards = [
        { en: 'Crash Landing on You', kr: '사랑의 불시착', meta: '2019 • Romance', rating: '9.8 ★', col: '#E11D48' },
        { en: 'Goblin: The Lonely God', kr: '도깨비', meta: '2016 • Fantasy', rating: '9.6 ★', col: '#F59E0B' },
        { en: 'Parasite', kr: '기생충', meta: '2019 • Thriller', rating: '9.9 ★', col: '#06B6D4' },
        { en: 'Weak Hero Class 1', kr: '약한영웅 Class 1', meta: '2022 • Action Noir', rating: '9.7 ★', col: '#A855F7' },
      ];

      const cardW = 280;
      const cardH = 430;
      const totalW = cards.length * cardW + (cards.length - 1) * 24;
      const startX = width / 2 - totalW / 2;

      cards.forEach((card, idx) => {
        const delay = idx * 0.12;
        const cardT = Math.max(0, (st - delay) / 0.4);
        if (cardT <= 0) return;
        const p = easeOutBack(Math.min(1.0, cardT));

        const floatOff = Math.sin(time * 3 + idx * 1.5) * 6;
        const cx = startX + idx * (cardW + 24);
        const cy = 230 + (1.0 - p) * 100 + floatOff;

        ctx.save();
        // Double-bezel shell
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = `${card.col}60`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - 3, cy - 3, cardW + 6, cardH + 6, 22);
        ctx.fill();
        ctx.stroke();

        // Card Core
        ctx.fillStyle = '#101217';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 20);
        ctx.fill();
        ctx.stroke();

        // Poster Area
        ctx.fillStyle = '#151820';
        ctx.beginPath();
        ctx.roundRect(cx + 10, cy + 10, cardW - 20, 240, 16);
        ctx.fill();

        // Ambient poster glow
        const pGlow = ctx.createRadialGradient(cx + cardW / 2, cy + 130, 10, cx + cardW / 2, cy + 130, 90);
        pGlow.addColorStop(0, `${card.col}40`);
        pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGlow;
        ctx.fillRect(cx + 10, cy + 10, cardW - 20, 240);

        // Poster Hangul Title
        ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.kr.slice(0, 5), cx + cardW / 2, cy + 130);

        // Rank pill
        ctx.fillStyle = card.col;
        ctx.beginPath();
        ctx.roundRect(cx + 20, cy + 20, 42, 24, 12);
        ctx.fill();
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`#${idx + 1}`, cx + 41, cy + 32);

        // Rating badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.beginPath();
        ctx.roundRect(cx + cardW - 80, cy + 20, 60, 24, 12);
        ctx.fill();
        ctx.stroke();
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(card.rating, cx + cardW - 50, cy + 32);

        // Title and details
        ctx.textAlign = 'left';
        ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#F43F5E';
        ctx.fillText(card.kr, cx + 18, cy + 275);

        ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(card.en.slice(0, 18), cx + 18, cy + 304);

        ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText(card.meta, cx + 18, cy + 332);

        // Buttons
        ctx.fillStyle = 'rgba(52, 211, 153, 0.12)';
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
        ctx.beginPath();
        ctx.roundRect(cx + 18, cy + cardH - 42, 95, 28, 14);
        ctx.fill();
        ctx.stroke();
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#34D399';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Watched', cx + 65, cy + cardH - 28);

        ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.35)';
        ctx.beginPath();
        ctx.roundRect(cx + cardW - 113, cy + cardH - 42, 95, 28, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#F43F5E';
        ctx.fillText('♥ Favorite', cx + cardW - 65, cy + cardH - 28);

        ctx.restore();
      });
    }

    // -------------------------------------------------------------
    // SCENE 3: SLIDING PILL NAVIGATION (10.0s - 15.0s)
    // -------------------------------------------------------------
    else if (time >= 10.0 && time < 15.0) {
      const cycle = (time - 10.0) % 3.0;
      const pillPos = cycle < 1.5 
        ? easeInOutCubic(Math.min(1.0, cycle / 0.8))
        : 1.0 - easeInOutCubic(Math.min(1.0, (cycle - 1.5) / 0.8));

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Eyebrow
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 90, 60, 180, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('INTERACTIVE UX', width / 2, 74);

      // Main Heading
      ctx.font = '800 44px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Signature Sliding Pill Navigation', width / 2, 118);

      ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('Effortlessly glide between 83 TV Series and 64 Blockbuster Films with fluid spring physics', width / 2, 158);

      // The Sliding Pill Container
      const pillW = 540;
      const pillH = 64;
      const pillX = width / 2 - pillW / 2;
      const pillY = 210;

      // Chassis
      ctx.fillStyle = '#101217';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 32);
      ctx.fill();
      ctx.stroke();

      // Active Indicator
      const tabW = (pillW - 12) / 2;
      const activeX = pillX + 6 + pillPos * tabW;
      ctx.shadowColor = 'rgba(225, 29, 72, 0.4)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.roundRect(activeX, pillY + 6, tabW, pillH - 12, 26);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tab Labels
      ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = pillPos < 0.5 ? '#FFFFFF' : '#94A3B8';
      ctx.fillText('📺  K-Dramas (83)', pillX + 6 + tabW / 2, pillY + pillH / 2);

      ctx.fillStyle = pillPos >= 0.5 ? '#FFFFFF' : '#94A3B8';
      ctx.fillText('🎬  K-Movies (64)', pillX + 6 + tabW + tabW / 2, pillY + pillH / 2);

      // Filtered State Badge
      const isMovie = pillPos >= 0.5;
      const activeText = isMovie ? 'Viewing: K-Movies • 64 Films Tracked' : 'Viewing: K-Dramas • 83 TV Series Tracked';
      ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.35)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 160, 305, 320, 32, 16);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#F43F5E';
      ctx.fillText(activeText, width / 2, 321);

      // Simulated grid cards below
      const gridCount = 5;
      const gw = 180;
      const gh = 250;
      const gStartX = width / 2 - (gridCount * gw + (gridCount - 1) * 16) / 2;
      for (let i = 0; i < gridCount; i++) {
        const gx = gStartX + i * (gw + 16);
        const gy = 360;
        ctx.fillStyle = '#151820';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(gx, gy, gw, gh, 16);
        ctx.fill();
        ctx.stroke();

        // Card header
        ctx.fillStyle = isMovie ? 'rgba(6, 182, 212, 0.15)' : 'rgba(225, 29, 72, 0.15)';
        ctx.beginPath();
        ctx.roundRect(gx + 8, gy + 8, gw - 16, 150, 12);
        ctx.fill();

        ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(isMovie ? `Movie #${i + 1}` : `Drama #${i + 1}`, gx + gw / 2, gy + 190);

        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isMovie ? '#06B6D4' : '#F43F5E';
        ctx.fillText(isMovie ? '🎬 Blockbuster' : '📺 TV Series', gx + gw / 2, gy + 215);
      }

      ctx.restore();
    }

    // -------------------------------------------------------------
    // SCENE 4: DYNAMIC TOP 3 PODIUM & DUAL RATINGS (15.0s - 20.0s)
    // -------------------------------------------------------------
    else if (time >= 15.0 && time < 20.0) {
      const st = (time - 15.0) / 5.0;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Eyebrow
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 110, 50, 220, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('HALL OF FAME & RATINGS', width / 2, 64);

      // Main Heading
      ctx.font = '800 42px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Dynamic Top 3 Podium & Dual Critic Ratings', width / 2, 108);

      ctx.font = '400 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('Compare Official TMDB Critic Scores against Dramify Community Ratings', width / 2, 148);

      // Podium Pillars
      const podium = [
        { rank: '2nd Place', title: 'Goblin', kr: '도깨비', h: 280, xOff: -280, col: '#CBD5E1', tmdb: '8.8', comm: '9.6' },
        { rank: '1st Place', title: 'Crash Landing on You', kr: '사랑의 불시착', h: 360, xOff: 0, col: '#F59E0B', tmdb: '8.9', comm: '9.8' },
        { rank: '3rd Place', title: 'Weak Hero Class 1', kr: '약한영웅', h: 230, xOff: 280, col: '#D97706', tmdb: '8.6', comm: '9.5' },
      ];

      const baseY = height - 80;
      const colW = 240;

      podium.forEach((p) => {
        const rise = easeOutBack(Math.min(1.0, (st - 0.1) / 0.5));
        const currentH = p.h * rise;
        const cx = width / 2 + p.xOff - colW / 2;
        const cy = baseY - currentH;

        // Pillar shell
        ctx.fillStyle = '#101217';
        ctx.strokeStyle = `${p.col}60`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx, cy, colW, currentH, [18, 18, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // Medal Pill
        ctx.fillStyle = `${p.col}25`;
        ctx.strokeStyle = p.col;
        ctx.beginPath();
        ctx.roundRect(cx + colW / 2 - 60, cy + 20, 120, 32, 16);
        ctx.fill();
        ctx.stroke();
        ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = p.col;
        ctx.fillText(p.rank, cx + colW / 2, cy + 36);

        // Titles
        ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#F43F5E';
        ctx.fillText(p.kr, cx + colW / 2, cy + 74);

        ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(p.title.slice(0, 16), cx + colW / 2, cy + 98);

        // Dual Rating HUD
        const hudY = cy + 135;
        // TMDB Pill
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        ctx.roundRect(cx + 20, hudY, colW - 40, 26, 13);
        ctx.fill();
        ctx.stroke();
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#06B6D4';
        ctx.fillText(`TMDB Score: ★ ${p.tmdb}`, cx + colW / 2, hudY + 13);

        // Community Pill
        ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
        ctx.beginPath();
        ctx.roundRect(cx + 20, hudY + 34, colW - 40, 26, 13);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#F43F5E';
        ctx.fillText(`Dramify Score: ★ ${p.comm}`, cx + colW / 2, hudY + 47);
      });

      ctx.restore();
    }

    // -------------------------------------------------------------
    // SCENE 5: FINALE & CALL TO ACTION (20.0s - 25.0s)
    // -------------------------------------------------------------
    else {
      const fade = time > 24.2 ? Math.max(0, (25.0 - time) / 0.8) : 1.0;

      ctx.save();
      ctx.globalAlpha = fade;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Eyebrow
      ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 140, 110, 280, 32, 16);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#F43F5E';
      ctx.fillText('ELEVATE YOUR K-DRAMA JOURNEY', width / 2, 126);

      // Headline
      ctx.font = '900 62px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Track. Discover. Rate. Devote.', width / 2, 185);

      // Korean Subtitle
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('한국 드라마 & 영화 아카이브 소셜 플랫폼', width / 2, 240);

      // Features list
      const feats = [
        '✦ 147 Iconic Korean Titles',
        '✦ Dual Critic & Fan Ratings',
        '✦ Dynamic Top 3 Podiums',
        '✦ Obsidian Cinema Aesthetic'
      ];
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(feats.join('    •    '), width / 2, 310);

      // Big CTA Button
      const ctaW = 340;
      const ctaH = 64;
      const ctaX = width / 2 - ctaW / 2;
      const ctaY = 400;

      ctx.shadowColor = 'rgba(225, 29, 72, 0.6)';
      ctx.shadowBlur = 35;
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 32);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('EXPLORE DRAMIFY TODAY', width / 2, ctaY + ctaH / 2);

      // Sub-label
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Available Now • Open Source on GitHub: Vivek-k001/Dramify', width / 2, ctaY + 100);

      ctx.restore();
    }

    // Micro-tech Watermark in bottom corner
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.textAlign = 'right';
    ctx.fillText(`DRAMIFY PROMO • ${time.toFixed(1)}s / ${TOTAL_DURATION}s`, width - 20, height - 16);
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= TOTAL_DURATION) {
            return 0; // Loop seamlessly
          }
          return next;
        });
      }

      renderFrame(ctx, canvas.width, canvas.height, currentTime);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    animationFrameRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
      lastTimestampRef.current = null;
    };
  }, [isPlaying, currentTime, renderFrame]);

  // Start in-browser video export via MediaRecorder
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(60); // 60 FPS
      const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      let selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setIsRecording(false);
      };

      // Reset to 0 and record the full 25-second sequence
      setCurrentTime(0);
      setIsPlaying(true);
      recorder.start();
      setIsRecording(true);

      // Auto-stop when full video finishes
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, TOTAL_DURATION * 1000 + 500);

    } catch (err) {
      console.error('Failed to record video:', err);
      alert('Your browser does not support canvas video recording.');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const activeScene = SCENES.slice().reverse().find((s) => currentTime >= s.time) || SCENES[0];

  return (
    <div className="min-h-screen bg-dramify-bg text-white pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> BACK TO DRAMIFY
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white flex items-center gap-3">
              🎬 Motion Graphics Studio
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                1080P 60FPS
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Interactive promotional motion graphics showcase featuring Dramify's Obsidian Cinema experience.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3">
            {hasMp4Video && (
              <a
                href="/videos/dramify_promo.mp4"
                download="dramify_promo.mp4"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson hover:bg-crimsonHover text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-crimson/25 hover:scale-105"
              >
                <Download size={14} /> Download MP4 (1080p)
              </a>
            )}

            <button
              onClick={isRecording ? undefined : startRecording}
              disabled={isRecording}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all border",
                isRecording
                  ? "bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse cursor-not-allowed"
                  : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-white/20"
              )}
            >
              <Video size={14} className={isRecording ? "text-rose-400 animate-spin" : ""} />
              {isRecording ? "Recording Video..." : "Export WebM Video"}
            </button>
          </div>
        </div>

        {/* Video Player Chassis */}
        <div 
          ref={containerRef}
          className="relative rounded-3xl overflow-hidden bg-[#0A0C10] border border-white/10 shadow-2xl shadow-black/80 group"
        >
          {/* Active Scene Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {activeScene.badge}
            </div>
            <div className="hidden sm:block px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300">
              {activeScene.label}
            </div>
          </div>

          {/* 16:9 Cinema Canvas */}
          <div className="relative aspect-video w-full flex items-center justify-center bg-black">
            <canvas 
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            />
          </div>

          {/* Player Controller Deck */}
          <div className="p-4 sm:p-5 bg-gradient-to-t from-[#08090C] via-[#0E1017] to-transparent border-t border-white/10 space-y-3">
            
            {/* Timeline Scrubber */}
            <div className="space-y-1.5">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={TOTAL_DURATION}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:h-2 transition-all"
                />
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                <span>00:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
                <span className="text-slate-500">{activeScene.label}</span>
                <span>00:{Math.floor(TOTAL_DURATION).toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Deck Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-crimson hover:bg-crimsonHover text-white flex items-center justify-center shadow-md shadow-crimson/30 transition-transform active:scale-95"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Restart"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  onClick={toggleSound}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                    isMuted 
                      ? "bg-white/5 text-slate-400 hover:text-white" 
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  )}
                  title={isMuted ? 'Unmute Cinematic Audio' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Scene Jump Pills */}
              <div className="hidden lg:flex items-center gap-1.5">
                {SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => setCurrentTime(scene.time)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all",
                      activeScene.id === scene.id
                        ? "bg-white/15 text-white font-bold border border-white/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {scene.label.split('. ')[1]}
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Download Link Notice if recording completed */}
        {recordedBlobUrl && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Video Render Complete!</h4>
                <p className="text-xs text-slate-400">Your high-definition motion graphics recording is ready to download.</p>
              </div>
            </div>
            <a
              href={recordedBlobUrl}
              download="dramify-motion-graphics.webm"
              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold tracking-wide transition-all shadow-lg shadow-emerald-500/20"
            >
              Download Recording (.webm)
            </a>
          </div>
        )}

        {/* Storyboard & Architecture Bento */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Layers size={20} className="text-rose-400" />
            Motion Graphics Choreography & Storyboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SCENES.map((scene) => (
              <div 
                key={scene.id}
                onClick={() => setCurrentTime(scene.time)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer group space-y-2",
                  activeScene.id === scene.id
                    ? "bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-900/20 scale-[1.02]"
                    : "bg-[#101217] border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    {scene.time}s - {scene.time + 5}s
                  </span>
                  {activeScene.id === scene.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                  {scene.label}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {scene.id === 1 && "Cold open with breathing Hangul 드라마 glow and clapperboard emblem."}
                  {scene.id === 2 && "147 Curated Korean titles with 3D cascading poster cards & star ratings."}
                  {scene.id === 3 && "Signature sliding pill toggle: K-Dramas (83) vs K-Movies (64)."}
                  {scene.id === 4 && "Dynamic 3D podium with Gold, Silver, Bronze and TMDB vs Community HUD."}
                  {scene.id === 5 && "Full UI convergence, features summary, and punchy call to action."}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default PromoPage;
