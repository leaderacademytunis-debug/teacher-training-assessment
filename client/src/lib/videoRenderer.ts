/**
 * VideoRenderer - Client-side video rendering engine using Canvas + MediaRecorder
 * Merges storyboard images + audio into a single branded WebM/MP4 video
 * Features: Intro card, Outro card, Smart watermark, Resolution normalization
 * Enhanced: Per-scene progress, Quality selector (720p/1080p), Preview mode
 * 
 * This version uses native browser APIs (Canvas + MediaRecorder) instead of FFmpeg.wasm
 * for maximum compatibility and reliability. No 31MB download required.
 */

// ─── Quality Presets ───
export type VideoQuality = '720p' | '1080p';

interface QualityConfig {
  width: number;
  height: number;
  videoBitrate: number;
  label: string;
}

export const QUALITY_PRESETS: Record<VideoQuality, QualityConfig> = {
  '720p': { width: 1280, height: 720, videoBitrate: 2_500_000, label: 'HD 720p' },
  '1080p': { width: 1920, height: 1080, videoBitrate: 5_000_000, label: 'Full HD 1080p' },
};

// ─── Constants ───
const INTRO_DURATION = 3; // seconds
const OUTRO_DURATION = 3;
const BRAND_COLOR_HEX = '#F59E0B';
const WATERMARK_TEXT = 'Created via Leader Academy';
const FPS = 30;

export interface SceneData {
  sceneNumber: number;
  imageUrl: string;
  audioUrl: string;
  duration?: number;
}

export interface BrandingOptions {
  lessonTitle: string;
  teacherName: string;
  logoUrl?: string;
}

export interface RenderProgress {
  phase: 'loading' | 'preparing' | 'rendering' | 'finalizing' | 'done' | 'error';
  percent: number;
  message: string;
  currentScene?: number;
  totalScenes?: number;
  scenePhase?: 'downloading' | 'encoding' | 'complete';
}

export type ProgressCallback = (progress: RenderProgress) => void;

/**
 * Check if the browser supports MediaRecorder with video
 */
export function isWasmSupported(): boolean {
  // We no longer need WASM, but keep the function for API compatibility
  // Check for Canvas + MediaRecorder support instead
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const stream = canvas.captureStream(1);
    if (!stream) return false;
    const supported = typeof MediaRecorder !== 'undefined';
    stream.getTracks().forEach(t => t.stop());
    return supported;
  } catch {
    return false;
  }
}

/**
 * Load an image from URL and return it as HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin for same-origin images
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img2.src = url;
    };
    img.src = url;
  });
}

/**
 * Load audio from URL and return AudioBuffer + duration
 */
async function loadAudio(url: string): Promise<{ buffer: AudioBuffer; duration: number }> {
  const response = await fetch(url, { mode: 'cors' }).catch(() => fetch(url));
  if (!response.ok) throw new Error(`Failed to fetch audio: ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return { buffer: audioBuffer, duration: audioBuffer.duration };
  } finally {
    audioContext.close();
  }
}

/**
 * Get audio duration without full decode
 */
async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.addEventListener('loadedmetadata', () => {
      resolve(isFinite(audio.duration) ? audio.duration : 5);
    });
    audio.addEventListener('error', () => resolve(5));
    audio.src = url;
  });
}

/**
 * Draw a branded card (intro or outro) on canvas
 */
function drawCardOnCanvas(
  ctx: CanvasRenderingContext2D,
  options: {
    type: 'intro' | 'outro';
    lessonTitle: string;
    teacherName: string;
    width: number;
    height: number;
  }
) {
  const { width, height } = options;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0F172A');
  gradient.addColorStop(0.5, '#1E293B');
  gradient.addColorStop(1, '#0F172A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative grid
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // Corner accents
  const accentSize = Math.round(120 * (width / 1920));
  ctx.strokeStyle = BRAND_COLOR_HEX;
  ctx.lineWidth = 3;
  const m = 40;
  ctx.beginPath(); ctx.moveTo(m, m + accentSize); ctx.lineTo(m, m); ctx.lineTo(m + accentSize, m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(width - m - accentSize, m); ctx.lineTo(width - m, m); ctx.lineTo(width - m, m + accentSize); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m, height - m - accentSize); ctx.lineTo(m, height - m); ctx.lineTo(m + accentSize, height - m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(width - m - accentSize, height - m); ctx.lineTo(width - m, height - m); ctx.lineTo(width - m, height - m - accentSize); ctx.stroke();

  // Central glow
  const centerX = width / 2;
  const centerY = height / 2 - 40;
  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
  glowGradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
  glowGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const scale = width / 1920;

  if (options.type === 'intro') {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.font = `bold ${Math.round(28 * scale)}px Arial, sans-serif`;
    ctx.fillText('Leader Academy Presents', centerX, height * 0.25);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 300 * scale, height * 0.32);
    ctx.lineTo(centerX + 300 * scale, height * 0.32);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(64 * scale)}px Arial, sans-serif`;
    const titleLines = wrapText(ctx, options.lessonTitle, width - 200, Math.round(64 * scale));
    const titleStartY = height * 0.45 - ((titleLines.length - 1) * 40 * scale);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, centerX, titleStartY + i * 80 * scale);
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 200 * scale, height * 0.62);
    ctx.lineTo(centerX + 200 * scale, height * 0.62);
    ctx.stroke();

    ctx.fillStyle = BRAND_COLOR_HEX;
    ctx.font = `bold ${Math.round(36 * scale)}px Arial, sans-serif`;
    ctx.fillText(`${options.teacherName} :إعداد`, centerX, height * 0.72);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = `${Math.round(24 * scale)}px Arial, sans-serif`;
    ctx.fillText('leaderacademy.school', centerX, height * 0.88);
  } else {
    ctx.fillStyle = BRAND_COLOR_HEX;
    ctx.font = `bold ${Math.round(72 * scale)}px Arial, sans-serif`;
    ctx.fillText('Leader Academy', centerX, height * 0.30);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `${Math.round(32 * scale)}px Arial, sans-serif`;
    ctx.fillText('نحو تعليم رقمي متميز', centerX, height * 0.40);

    ctx.strokeStyle = BRAND_COLOR_HEX;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 150 * scale, height * 0.47);
    ctx.lineTo(centerX + 150 * scale, height * 0.47);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(40 * scale)}px Arial, sans-serif`;
    const outroLines = wrapText(ctx, 'صُنع هذا الدرس باستخدام الذكاء الاصطناعي', width - 200, Math.round(40 * scale));
    outroLines.forEach((line, i) => {
      ctx.fillText(line, centerX, height * 0.57 + i * 55 * scale);
    });

    ctx.fillStyle = BRAND_COLOR_HEX;
    ctx.font = `bold ${Math.round(36 * scale)}px Arial, sans-serif`;
    ctx.fillText('leaderacademy.school', centerX, height * 0.82);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = `${Math.round(22 * scale)}px Arial, sans-serif`;
    ctx.fillText(`© ${new Date().getFullYear()} Leader Academy - All Rights Reserved`, centerX, height * 0.92);
  }
}

/**
 * Draw watermark on canvas
 */
function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.font = '18px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(WATERMARK_TEXT, width - 20, height - 15);
  ctx.restore();
}

/**
 * Draw scene image fitted to canvas with letterboxing
 */
function drawImageFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) {
  // Black background
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Calculate fit
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth: number, drawHeight: number, drawX: number, drawY: number;

  if (imgRatio > canvasRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

/**
 * Helper: wrap text to fit within maxWidth
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, _fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length > 4) {
    return lines.slice(0, 4).map((l, i) => i === 3 ? l.substring(0, 40) + '...' : l);
  }

  return lines;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Record a sequence of canvas frames with optional audio as a video blob
 * Uses MediaRecorder API for native browser video encoding
 */
async function recordCanvasSequence(
  canvas: HTMLCanvasElement,
  segments: Array<{
    type: 'card' | 'scene';
    draw: (ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) => void;
    durationSec: number;
    audioUrl?: string;
  }>,
  quality: QualityConfig,
  onProgress?: ProgressCallback,
  totalScenes?: number
): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const canvasStream = canvas.captureStream(FPS);

  // Determine the best supported MIME type
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  let selectedMime = 'video/webm';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  // Create AudioContext for mixing all scene audio
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioDestination = audioContext.createMediaStreamDestination();

  // Combine canvas video stream with audio destination
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDestination.stream.getAudioTracks(),
  ]);

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: quality.videoBitrate,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingDone = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: selectedMime.split(';')[0] });
      resolve(blob);
    };
  });

  recorder.start(100); // Collect data every 100ms

  // Process each segment sequentially
  let sceneCounter = 0;
  for (let segIdx = 0; segIdx < segments.length; segIdx++) {
    const segment = segments[segIdx];
    const totalFrames = Math.ceil(segment.durationSec * FPS);
    const frameDuration = 1000 / FPS;

    // Start audio playback for this segment if it has audio
    let audioSource: AudioBufferSourceNode | null = null;
    if (segment.audioUrl) {
      try {
        const response = await fetch(segment.audioUrl, { mode: 'cors' }).catch(() => fetch(segment.audioUrl!));
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioDestination);
        audioSource.start(audioContext.currentTime);
      } catch (audioErr) {
        console.warn('[VideoRenderer] Audio load failed for segment, continuing without audio:', audioErr);
      }
    }

    if (segment.type === 'scene') {
      sceneCounter++;
    }

    // Render frames
    for (let frame = 0; frame < totalFrames; frame++) {
      const startTime = performance.now();

      segment.draw(ctx, frame, totalFrames);

      // Calculate timing to maintain FPS
      const elapsed = performance.now() - startTime;
      const waitTime = Math.max(0, frameDuration - elapsed);
      if (waitTime > 0) {
        await sleep(waitTime);
      }

      // Report progress periodically (every 10 frames)
      if (frame % 10 === 0 && onProgress && segment.type === 'scene') {
        const sceneProgress = frame / totalFrames;
        const overallPercent = 25 + ((sceneCounter - 1 + sceneProgress) / (totalScenes || 1)) * 60;
        onProgress({
          phase: 'rendering',
          percent: Math.round(Math.min(85, overallPercent)),
          message: `المشهد ${sceneCounter}/${totalScenes}: دمج الصورة والصوت...`,
          currentScene: sceneCounter,
          totalScenes,
          scenePhase: 'encoding',
        });
      }
    }

    // Stop audio source
    if (audioSource) {
      try { audioSource.stop(); } catch { /* ignore */ }
    }

    // Report scene complete
    if (segment.type === 'scene' && onProgress) {
      onProgress({
        phase: 'rendering',
        percent: Math.round(25 + (sceneCounter / (totalScenes || 1)) * 60),
        message: `المشهد ${sceneCounter}/${totalScenes}: تم ✓`,
        currentScene: sceneCounter,
        totalScenes,
        scenePhase: 'complete',
      });
    }
  }

  // Stop recording
  recorder.stop();
  audioContext.close();

  return recordingDone;
}

/**
 * Main render function: takes scenes + branding and produces a branded video blob
 * Uses Canvas + MediaRecorder for maximum browser compatibility
 */
export async function renderVideo(
  scenes: SceneData[],
  onProgress?: ProgressCallback,
  branding?: BrandingOptions,
  quality: VideoQuality = '1080p'
): Promise<Blob> {
  if (!isWasmSupported()) {
    throw new Error('BROWSER_NOT_SUPPORTED');
  }

  if (scenes.length === 0) {
    throw new Error('NO_SCENES');
  }

  const qConfig = QUALITY_PRESETS[quality];
  const WIDTH = qConfig.width;
  const HEIGHT = qConfig.height;
  const hasBranding = !!branding;
  const totalScenes = scenes.length;

  try {
    // ═══ Phase 1: Create Canvas ═══
    onProgress?.({
      phase: 'loading',
      percent: 5,
      message: 'جاري تجهيز محرك الفيديو...',
    });

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d')!;

    // ═══ Phase 2: Pre-load all assets ═══
    onProgress?.({
      phase: 'preparing',
      percent: 10,
      message: 'جاري تحميل الملفات...',
      totalScenes,
    });

    // Pre-load all images and get audio durations
    const preloadedImages: HTMLImageElement[] = [];
    const audioDurations: number[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      onProgress?.({
        phase: 'preparing',
        percent: 10 + Math.round((i / scenes.length) * 15),
        message: `تحميل المشهد ${i + 1}/${totalScenes}...`,
        currentScene: i + 1,
        totalScenes,
        scenePhase: 'downloading',
      });

      // Load image
      const img = await loadImage(scene.imageUrl);
      preloadedImages.push(img);

      // Get audio duration
      const duration = scene.duration || await getAudioDuration(scene.audioUrl);
      audioDurations.push(Math.max(2, duration)); // Minimum 2 seconds
    }

    onProgress?.({
      phase: 'preparing',
      percent: 25,
      message: 'تم تحميل جميع الملفات. جاري بدء التسجيل...',
      totalScenes,
    });

    // ═══ Phase 3: Build segment list ═══
    const segments: Array<{
      type: 'card' | 'scene';
      draw: (ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) => void;
      durationSec: number;
      audioUrl?: string;
    }> = [];

    // Intro card
    if (hasBranding) {
      segments.push({
        type: 'card',
        durationSec: INTRO_DURATION,
        draw: (ctx, frame, totalFrames) => {
          const progress = frame / totalFrames;
          drawCardOnCanvas(ctx, {
            type: 'intro',
            lessonTitle: branding!.lessonTitle,
            teacherName: branding!.teacherName,
            width: WIDTH,
            height: HEIGHT,
          });
          // Fade in effect
          if (progress < 0.15) {
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - progress / 0.15})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
          }
          // Fade out effect
          if (progress > 0.85) {
            ctx.fillStyle = `rgba(0, 0, 0, ${(progress - 0.85) / 0.15})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
          }
        },
      });
    }

    // Scene segments
    for (let i = 0; i < scenes.length; i++) {
      const img = preloadedImages[i];
      const duration = audioDurations[i];
      const scene = scenes[i];

      segments.push({
        type: 'scene',
        durationSec: duration,
        audioUrl: scene.audioUrl,
        draw: (ctx, frame, totalFrames) => {
          const progress = frame / totalFrames;

          // Draw scene image
          drawImageFitted(ctx, img, WIDTH, HEIGHT);

          // Watermark
          if (hasBranding) {
            drawWatermark(ctx, WIDTH, HEIGHT);
          }

          // Scene number badge
          const badgeSize = Math.round(50 * (WIDTH / 1920));
          ctx.save();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
          ctx.beginPath();
          ctx.roundRect(20, 20, badgeSize * 2, badgeSize, [8]);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(22 * (WIDTH / 1920))}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${i + 1}`, 20 + badgeSize, 20 + badgeSize / 2);
          ctx.restore();

          // Fade in
          if (progress < 0.05) {
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - progress / 0.05})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
          }
          // Fade out
          if (progress > 0.95) {
            ctx.fillStyle = `rgba(0, 0, 0, ${(progress - 0.95) / 0.05})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
          }
        },
      });
    }

    // Outro card
    if (hasBranding) {
      segments.push({
        type: 'card',
        durationSec: OUTRO_DURATION,
        draw: (ctx, frame, totalFrames) => {
          const progress = frame / totalFrames;
          drawCardOnCanvas(ctx, {
            type: 'outro',
            lessonTitle: branding!.lessonTitle,
            teacherName: branding!.teacherName,
            width: WIDTH,
            height: HEIGHT,
          });
          // Fade in
          if (progress < 0.15) {
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - progress / 0.15})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
          }
          // Fade out
          if (progress > 0.85) {
            ctx.fillStyle = `rgba(0, 0, 0, ${(progress - 0.85) / 0.15})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
          }
        },
      });
    }

    // ═══ Phase 4: Record everything ═══
    onProgress?.({
      phase: 'rendering',
      percent: 25,
      message: 'جاري تسجيل الفيديو...',
      totalScenes,
    });

    const blob = await recordCanvasSequence(canvas, segments, qConfig, onProgress, totalScenes);

    // ═══ Phase 5: Done ═══
    onProgress?.({
      phase: 'finalizing',
      percent: 95,
      message: 'جاري إنهاء الفيديو...',
      totalScenes,
    });

    // Small delay to ensure all data is flushed
    await sleep(200);

    onProgress?.({
      phase: 'done',
      percent: 100,
      message: 'تم إنشاء الفيديو بنجاح!',
      totalScenes,
    });

    return blob;

  } catch (error: any) {
    console.error('[VideoRenderer] Error:', error);
    onProgress?.({
      phase: 'error',
      percent: 0,
      message: error.message || 'حدث خطأ أثناء إنشاء الفيديو',
    });
    throw error;
  }
}

/**
 * Trigger automatic download of a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string = 'Leader-Lesson-Video.webm') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
