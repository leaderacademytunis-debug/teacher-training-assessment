/**
 * VideoRenderer - Client-side video rendering engine using FFmpeg.wasm
 * Merges storyboard images + audio into a single branded MP4 video
 * Features: Intro card, Outro card, Smart watermark, Resolution normalization
 * Enhanced: Per-scene progress, Quality selector (720p/1080p), Preview mode
 * All processing happens in the user's browser (zero server cost)
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// ─── Quality Presets ───
export type VideoQuality = '720p' | '1080p';

interface QualityConfig {
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
  label: string;
}

export const QUALITY_PRESETS: Record<VideoQuality, QualityConfig> = {
  '720p': { width: 1280, height: 720, videoBitrate: '2000k', audioBitrate: '128k', label: 'HD 720p' },
  '1080p': { width: 1920, height: 1080, videoBitrate: '4000k', audioBitrate: '192k', label: 'Full HD 1080p' },
};

// ─── Constants ───
const INTRO_DURATION = 3;
const OUTRO_DURATION = 3;
const BRAND_COLOR_HEX = '#F59E0B'; // amber-500
const WATERMARK_TEXT = 'Created via Leader Academy';

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
  // Enhanced per-scene tracking
  currentScene?: number;
  totalScenes?: number;
  scenePhase?: 'downloading' | 'encoding' | 'complete';
}

export type ProgressCallback = (progress: RenderProgress) => void;

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;

/**
 * Check if the browser supports WebAssembly
 */
export function isWasmSupported(): boolean {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
}

/**
 * Load the FFmpeg.wasm core (downloads ~31MB on first use, cached after)
 * Uses single-threaded mode (no SharedArrayBuffer requirement)
 */
async function loadFFmpeg(onProgress?: ProgressCallback): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) return ffmpegInstance;

  onProgress?.({
    phase: 'loading',
    percent: 5,
    message: 'جاري تحميل محرك الفيديو...',
  });

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      await ffmpeg.load({ coreURL, wasmURL });
      break;
    } catch (loadError: any) {
      console.error(`[FFmpeg] Load attempt ${attempt + 1} failed:`, loadError);
      if (attempt < maxRetries) {
        onProgress?.({
          phase: 'loading',
          percent: 5,
          message: `إعادة المحاولة... (${attempt + 2}/${maxRetries + 1})`,
        });
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      if (loadError.message?.includes('SharedArrayBuffer') || loadError.message?.includes('cross-origin')) {
        throw new Error('CROSS_ORIGIN_ISOLATION');
      }
      throw new Error(`FFMPEG_LOAD_FAILED: ${loadError.message || 'Unknown error'}`);
    }
  }

  ffmpegInstance = ffmpeg;
  isLoaded = true;

  onProgress?.({
    phase: 'loading',
    percent: 15,
    message: 'تم تحميل محرك الفيديو بنجاح',
  });

  return ffmpeg;
}

/**
 * Fetch a remote file as Uint8Array with CORS handling
 */
async function fetchFileData(url: string): Promise<Uint8Array> {
  try {
    const data = await fetchFile(url);
    return new Uint8Array(data);
  } catch (fetchError) {
    console.warn('[VideoRenderer] fetchFile failed, trying direct fetch:', fetchError);
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
}

/**
 * Get audio duration by decoding it in the browser
 */
async function getAudioDuration(audioData: Uint8Array): Promise<number> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      URL.revokeObjectURL(url);
      resolve(isFinite(duration) ? duration : 5);
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve(5);
    });
    audio.src = url;
  });
}

/**
 * Generate a branded card image (intro or outro) using Canvas API
 */
function generateCardImage(options: {
  type: 'intro' | 'outro';
  lessonTitle: string;
  teacherName: string;
  width: number;
  height: number;
}): Uint8Array {
  const { width, height } = options;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

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

  const scale = width / 1920; // Scale factor for different resolutions

  if (options.type === 'intro') {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.font = `bold ${Math.round(28 * scale)}px Arial, sans-serif`;
    ctx.fillText('🎬 Leader Academy Presents', centerX, height * 0.25);

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
    ctx.fillText(`إعداد الأستاذ: ${options.teacherName}`, centerX, height * 0.72);

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
    const outroLines = wrapText(ctx, 'صُنع هذا الدرس السحري باستخدام الذكاء الاصطناعي', width - 200, Math.round(40 * scale));
    outroLines.forEach((line, i) => {
      ctx.fillText(line, centerX, height * 0.57 + i * 55 * scale);
    });

    ctx.font = `${Math.round(48 * scale)}px Arial, sans-serif`;
    ctx.fillText('✨ 🤖 ✨', centerX, height * 0.72);

    ctx.fillStyle = BRAND_COLOR_HEX;
    ctx.font = `bold ${Math.round(36 * scale)}px Arial, sans-serif`;
    ctx.fillText('leaderacademy.school', centerX, height * 0.82);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = `${Math.round(22 * scale)}px Arial, sans-serif`;
    ctx.fillText('Powered by AI • Made for Tunisian Teachers', centerX, height * 0.92);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const binaryStr = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Helper: wrap text to fit within maxWidth
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
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
 * Build the FFmpeg filter for watermark text overlay
 */
function buildWatermarkFilter(): string {
  const escapedText = WATERMARK_TEXT.replace(/'/g, "'\\''").replace(/:/g, '\\:');
  return `drawtext=text='${escapedText}':fontsize=22:fontcolor=white@0.25:x=w-tw-30:y=h-th-20:font=Arial`;
}

/**
 * Main render function: takes scenes + branding and produces a branded MP4 blob
 * Now supports quality selection and enhanced per-scene progress
 */
export async function renderVideo(
  scenes: SceneData[],
  onProgress?: ProgressCallback,
  branding?: BrandingOptions,
  quality: VideoQuality = '1080p'
): Promise<Blob> {
  if (!isWasmSupported()) {
    throw new Error('WASM_NOT_SUPPORTED');
  }

  if (scenes.length === 0) {
    throw new Error('NO_SCENES');
  }

  const qConfig = QUALITY_PRESETS[quality];
  const TARGET_WIDTH = qConfig.width;
  const TARGET_HEIGHT = qConfig.height;

  const ffmpeg = await loadFFmpeg(onProgress);
  const hasBranding = !!branding;
  const totalScenes = scenes.length;

  // Progress calculation:
  // Loading: 0-15%, Preparing (intro/outro): 15-25%, Scenes: 25-85%, Concat+Finalize: 85-100%
  const sceneProgressRange = 60; // 25% to 85%
  const perSceneRange = sceneProgressRange / totalScenes;

  try {
    // ═══ Phase 1: Generate Intro & Outro Cards ═══
    if (hasBranding) {
      onProgress?.({
        phase: 'preparing',
        percent: 16,
        message: 'جاري إنشاء شاشة البداية...',
        totalScenes,
      });

      const introImage = generateCardImage({
        type: 'intro',
        lessonTitle: branding!.lessonTitle,
        teacherName: branding!.teacherName,
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
      });
      await ffmpeg.writeFile('intro_card.png', introImage);

      await ffmpeg.exec([
        '-f', 'lavfi',
        '-i', `anullsrc=r=44100:cl=stereo`,
        '-t', String(INTRO_DURATION),
        '-c:a', 'aac',
        '-b:a', qConfig.audioBitrate,
        '-y',
        'intro_silence.aac',
      ]);

      await ffmpeg.exec([
        '-loop', '1',
        '-i', 'intro_card.png',
        '-i', 'intro_silence.aac',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', qConfig.audioBitrate,
        '-pix_fmt', 'yuv420p',
        '-vf', `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=decrease,pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0F172A,fade=t=in:st=0:d=0.8,fade=t=out:st=${INTRO_DURATION - 0.5}:d=0.5`,
        '-t', String(INTRO_DURATION),
        '-shortest',
        '-y',
        'clip_intro.mp4',
      ]);

      onProgress?.({
        phase: 'preparing',
        percent: 20,
        message: 'جاري إنشاء شاشة النهاية...',
        totalScenes,
      });

      const outroImage = generateCardImage({
        type: 'outro',
        lessonTitle: branding!.lessonTitle,
        teacherName: branding!.teacherName,
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
      });
      await ffmpeg.writeFile('outro_card.png', outroImage);

      await ffmpeg.exec([
        '-loop', '1',
        '-i', 'outro_card.png',
        '-i', 'intro_silence.aac',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', qConfig.audioBitrate,
        '-pix_fmt', 'yuv420p',
        '-vf', `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=decrease,pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0F172A,fade=t=in:st=0:d=0.5,fade=t=out:st=${OUTRO_DURATION - 0.5}:d=0.5`,
        '-t', String(OUTRO_DURATION),
        '-shortest',
        '-y',
        'clip_outro.mp4',
      ]);

      onProgress?.({
        phase: 'preparing',
        percent: 25,
        message: 'تم إنشاء شاشات البداية والنهاية',
        totalScenes,
      });
    }

    // ═══ Phase 2: Process Each Scene (Download + Encode) ═══
    const sceneDurations: number[] = [];
    const watermarkFilter = hasBranding ? `,${buildWatermarkFilter()}` : '';

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneIdx = i + 1;
      const sceneBasePercent = 25 + (i * perSceneRange);

      // Sub-step 1: Download image (33% of scene range)
      onProgress?.({
        phase: 'rendering',
        percent: Math.round(sceneBasePercent),
        message: `المشهد ${sceneIdx}/${totalScenes}: تحميل الصورة...`,
        currentScene: sceneIdx,
        totalScenes,
        scenePhase: 'downloading',
      });

      const imageData = await fetchFileData(scene.imageUrl);
      await ffmpeg.writeFile(`scene_${sceneIdx}.jpg`, imageData);

      // Sub-step 2: Download audio (66% of scene range)
      onProgress?.({
        phase: 'rendering',
        percent: Math.round(sceneBasePercent + perSceneRange * 0.33),
        message: `المشهد ${sceneIdx}/${totalScenes}: تحميل الصوت...`,
        currentScene: sceneIdx,
        totalScenes,
        scenePhase: 'downloading',
      });

      const audioData = await fetchFileData(scene.audioUrl);
      await ffmpeg.writeFile(`scene_${sceneIdx}.mp3`, audioData);

      const duration = scene.duration || await getAudioDuration(audioData);
      sceneDurations.push(duration);

      // Sub-step 3: Encode scene video (100% of scene range)
      onProgress?.({
        phase: 'rendering',
        percent: Math.round(sceneBasePercent + perSceneRange * 0.66),
        message: `المشهد ${sceneIdx}/${totalScenes}: دمج الصورة والصوت...`,
        currentScene: sceneIdx,
        totalScenes,
        scenePhase: 'encoding',
      });

      const fadeInDuration = Math.min(0.5, duration * 0.1);
      const fadeOutStart = Math.max(0, duration - 0.5);
      const fadeOutDuration = Math.min(0.5, duration * 0.1);

      const videoFilter = [
        `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=decrease`,
        `pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0F172A`,
        `fade=t=in:st=0:d=${fadeInDuration}`,
        `fade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}`,
      ].join(',') + watermarkFilter;

      await ffmpeg.exec([
        '-loop', '1',
        '-i', `scene_${sceneIdx}.jpg`,
        '-i', `scene_${sceneIdx}.mp3`,
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', qConfig.audioBitrate,
        '-pix_fmt', 'yuv420p',
        '-vf', videoFilter,
        '-t', String(Math.ceil(duration)),
        '-shortest',
        '-y',
        `clip_${sceneIdx}.mp4`,
      ]);

      // Scene complete
      onProgress?.({
        phase: 'rendering',
        percent: Math.round(sceneBasePercent + perSceneRange),
        message: `المشهد ${sceneIdx}/${totalScenes}: تم ✓`,
        currentScene: sceneIdx,
        totalScenes,
        scenePhase: 'complete',
      });
    }

    // ═══ Phase 3: Concatenate All Clips ═══
    onProgress?.({
      phase: 'finalizing',
      percent: 88,
      message: 'جاري تجميع الفيديو النهائي...',
      totalScenes,
    });

    let concatContent = '';
    if (hasBranding) {
      concatContent += "file 'clip_intro.mp4'\n";
    }
    for (let i = 1; i <= scenes.length; i++) {
      concatContent += `file 'clip_${i}.mp4'\n`;
    }
    if (hasBranding) {
      concatContent += "file 'clip_outro.mp4'\n";
    }
    await ffmpeg.writeFile('concat_list.txt', concatContent);

    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat_list.txt',
      '-c', 'copy',
      '-y',
      'final_output.mp4',
    ]);

    // ═══ Phase 4: Read Output & Cleanup ═══
    onProgress?.({
      phase: 'finalizing',
      percent: 95,
      message: 'جاري إنهاء الفيديو...',
      totalScenes,
    });

    const outputData = await ffmpeg.readFile('final_output.mp4');
    const outputBuffer = outputData instanceof Uint8Array ? outputData.buffer : outputData;
    const blob = new Blob([outputBuffer as BlobPart], { type: 'video/mp4' });

    // Cleanup virtual FS
    const filesToClean = ['concat_list.txt', 'final_output.mp4'];
    if (hasBranding) {
      filesToClean.push('intro_card.png', 'outro_card.png', 'intro_silence.aac', 'clip_intro.mp4', 'clip_outro.mp4');
    }
    for (let i = 1; i <= scenes.length; i++) {
      filesToClean.push(`scene_${i}.jpg`, `scene_${i}.mp3`, `clip_${i}.mp4`);
    }
    for (const f of filesToClean) {
      try { await ffmpeg.deleteFile(f); } catch { /* ignore */ }
    }

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
export function downloadBlob(blob: Blob, filename: string = 'Leader-Lesson-Video.mp4') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
