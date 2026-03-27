/**
 * VideoRenderer - Client-side video rendering engine using FFmpeg.wasm
 * Merges storyboard images + audio into a single branded MP4 video
 * Features: Intro card, Outro card, Smart watermark, Resolution normalization
 * All processing happens in the user's browser (zero server cost)
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// ─── Constants ───
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const INTRO_DURATION = 3;
const OUTRO_DURATION = 3;
const BRAND_COLOR_HEX = '#F59E0B'; // amber-500
const BRAND_BG_HEX = '#0F172A';    // slate-900
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
  logoUrl?: string;      // Optional logo image URL
}

export interface RenderProgress {
  phase: 'loading' | 'preparing' | 'rendering' | 'finalizing' | 'done' | 'error';
  percent: number;
  message: string;
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

  try {
    // Use the ESM single-threaded core (no SharedArrayBuffer needed)
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  } catch (loadError: any) {
    console.error('[FFmpeg] Load error:', loadError);
    // If the error is about SharedArrayBuffer, provide a clear message
    if (loadError.message?.includes('SharedArrayBuffer') || loadError.message?.includes('cross-origin')) {
      throw new Error('CROSS_ORIGIN_ISOLATION');
    }
    throw new Error(`FFMPEG_LOAD_FAILED: ${loadError.message || 'Unknown error'}`);
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
 * In cross-origin isolated context, we need to handle CORS carefully
 */
async function fetchFileData(url: string): Promise<Uint8Array> {
  try {
    const data = await fetchFile(url);
    return new Uint8Array(data);
  } catch (fetchError) {
    // Fallback: try fetching with no-cors mode and converting
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
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
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
 * Returns PNG data as Uint8Array
 */
function generateCardImage(options: {
  type: 'intro' | 'outro';
  lessonTitle: string;
  teacherName: string;
}): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  gradient.addColorStop(0, '#0F172A');   // slate-900
  gradient.addColorStop(0.5, '#1E293B'); // slate-800
  gradient.addColorStop(1, '#0F172A');   // slate-900
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // Decorative elements - subtle grid pattern
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < TARGET_WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TARGET_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < TARGET_HEIGHT; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TARGET_WIDTH, y);
    ctx.stroke();
  }

  // Decorative corner accents
  const accentSize = 120;
  ctx.strokeStyle = BRAND_COLOR_HEX;
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(40, 40 + accentSize);
  ctx.lineTo(40, 40);
  ctx.lineTo(40 + accentSize, 40);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(TARGET_WIDTH - 40 - accentSize, 40);
  ctx.lineTo(TARGET_WIDTH - 40, 40);
  ctx.lineTo(TARGET_WIDTH - 40, 40 + accentSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(40, TARGET_HEIGHT - 40 - accentSize);
  ctx.lineTo(40, TARGET_HEIGHT - 40);
  ctx.lineTo(40 + accentSize, TARGET_HEIGHT - 40);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(TARGET_WIDTH - 40 - accentSize, TARGET_HEIGHT - 40);
  ctx.lineTo(TARGET_WIDTH - 40, TARGET_HEIGHT - 40);
  ctx.lineTo(TARGET_WIDTH - 40, TARGET_HEIGHT - 40 - accentSize);
  ctx.stroke();

  // Central glowing circle
  const centerX = TARGET_WIDTH / 2;
  const centerY = TARGET_HEIGHT / 2 - 40;
  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
  glowGradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
  glowGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (options.type === 'intro') {
    // ─── INTRO CARD ───
    // Small top label
    ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('🎬 Leader Academy Presents', centerX, TARGET_HEIGHT * 0.25);

    // Horizontal divider line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 300, TARGET_HEIGHT * 0.32);
    ctx.lineTo(centerX + 300, TARGET_HEIGHT * 0.32);
    ctx.stroke();

    // Lesson title (main text)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px Arial, sans-serif';
    // Word wrap for long titles
    const titleLines = wrapText(ctx, options.lessonTitle, TARGET_WIDTH - 200, 64);
    const titleStartY = TARGET_HEIGHT * 0.45 - ((titleLines.length - 1) * 40);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, centerX, titleStartY + i * 80);
    });

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 200, TARGET_HEIGHT * 0.62);
    ctx.lineTo(centerX + 200, TARGET_HEIGHT * 0.62);
    ctx.stroke();

    // Teacher name
    ctx.fillStyle = BRAND_COLOR_HEX;
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText(`إعداد الأستاذ: ${options.teacherName}`, centerX, TARGET_HEIGHT * 0.72);

    // Bottom branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('leaderacademy.school', centerX, TARGET_HEIGHT * 0.88);

  } else {
    // ─── OUTRO CARD ───
    // Academy logo text
    ctx.fillStyle = BRAND_COLOR_HEX;
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.fillText('Leader Academy', centerX, TARGET_HEIGHT * 0.30);

    // Tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '32px Arial, sans-serif';
    ctx.fillText('نحو تعليم رقمي متميز', centerX, TARGET_HEIGHT * 0.40);

    // Divider
    ctx.strokeStyle = BRAND_COLOR_HEX;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 150, TARGET_HEIGHT * 0.47);
    ctx.lineTo(centerX + 150, TARGET_HEIGHT * 0.47);
    ctx.stroke();

    // Main motivational text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial, sans-serif';
    const outroLines = wrapText(ctx, 'صُنع هذا الدرس السحري باستخدام الذكاء الاصطناعي', TARGET_WIDTH - 200, 40);
    outroLines.forEach((line, i) => {
      ctx.fillText(line, centerX, TARGET_HEIGHT * 0.57 + i * 55);
    });

    // Sparkle emoji decoration
    ctx.font = '48px Arial, sans-serif';
    ctx.fillText('✨ 🤖 ✨', centerX, TARGET_HEIGHT * 0.72);

    // Website URL
    ctx.fillStyle = BRAND_COLOR_HEX;
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText('leaderacademy.school', centerX, TARGET_HEIGHT * 0.82);

    // Bottom credit
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('Powered by AI • Made for Tunisian Teachers', centerX, TARGET_HEIGHT * 0.92);
  }

  // Convert canvas to PNG data
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

  // If text is too long, reduce and try again (max 4 lines)
  if (lines.length > 4) {
    return lines.slice(0, 4).map((l, i) => i === 3 ? l.substring(0, 40) + '...' : l);
  }

  return lines;
}

/**
 * Build the FFmpeg filter for watermark text overlay
 * Uses drawtext filter for a persistent semi-transparent watermark
 */
function buildWatermarkFilter(): string {
  // Escape special characters for FFmpeg drawtext
  const escapedText = WATERMARK_TEXT.replace(/'/g, "'\\''").replace(/:/g, '\\:');
  return `drawtext=text='${escapedText}':fontsize=22:fontcolor=white@0.25:x=w-tw-30:y=h-th-20:font=Arial`;
}

/**
 * Main render function: takes scenes + branding and produces a branded MP4 blob
 */
export async function renderVideo(
  scenes: SceneData[],
  onProgress?: ProgressCallback,
  branding?: BrandingOptions
): Promise<Blob> {
  if (!isWasmSupported()) {
    throw new Error('WASM_NOT_SUPPORTED');
  }

  if (scenes.length === 0) {
    throw new Error('NO_SCENES');
  }

  const ffmpeg = await loadFFmpeg(onProgress);
  const hasBranding = !!branding;

  // Total steps: intro + scenes * 3 (fetch img, fetch audio, render) + outro + concat + cleanup
  const totalSteps = (hasBranding ? 2 : 0) + scenes.length * 3 + 2;
  let currentStep = 0;

  const updateProgress = (phase: RenderProgress['phase'], message: string) => {
    currentStep++;
    const percent = Math.min(15 + Math.round((currentStep / totalSteps) * 80), 95);
    onProgress?.({ phase, percent, message });
  };

  try {
    // ═══ Phase 1: Generate Intro & Outro Cards ═══
    if (hasBranding) {
      onProgress?.({
        phase: 'preparing',
        percent: 16,
        message: 'جاري إنشاء شاشة البداية...',
      });

      // Generate intro card
      const introImage = generateCardImage({
        type: 'intro',
        lessonTitle: branding!.lessonTitle,
        teacherName: branding!.teacherName,
      });
      await ffmpeg.writeFile('intro_card.png', introImage);

      // Generate silent audio for intro (3 seconds)
      await ffmpeg.exec([
        '-f', 'lavfi',
        '-i', `anullsrc=r=44100:cl=stereo`,
        '-t', String(INTRO_DURATION),
        '-c:a', 'aac',
        '-b:a', '128k',
        '-y',
        'intro_silence.aac',
      ]);

      // Create intro video clip
      await ffmpeg.exec([
        '-loop', '1',
        '-i', 'intro_card.png',
        '-i', 'intro_silence.aac',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-vf', `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=decrease,pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0F172A,fade=t=in:st=0:d=0.8,fade=t=out:st=${INTRO_DURATION - 0.5}:d=0.5`,
        '-t', String(INTRO_DURATION),
        '-shortest',
        '-y',
        'clip_intro.mp4',
      ]);

      updateProgress('preparing', 'تم إنشاء شاشة البداية');

      // Generate outro card
      onProgress?.({
        phase: 'preparing',
        percent: 20,
        message: 'جاري إنشاء شاشة النهاية...',
      });

      const outroImage = generateCardImage({
        type: 'outro',
        lessonTitle: branding!.lessonTitle,
        teacherName: branding!.teacherName,
      });
      await ffmpeg.writeFile('outro_card.png', outroImage);

      // Create outro video clip
      await ffmpeg.exec([
        '-loop', '1',
        '-i', 'outro_card.png',
        '-i', 'intro_silence.aac',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-vf', `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=decrease,pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0F172A,fade=t=in:st=0:d=0.5,fade=t=out:st=${OUTRO_DURATION - 0.5}:d=0.5`,
        '-t', String(OUTRO_DURATION),
        '-shortest',
        '-y',
        'clip_outro.mp4',
      ]);

      updateProgress('preparing', 'تم إنشاء شاشة النهاية');
    }

    // ═══ Phase 2: Prepare Scene Assets ═══
    onProgress?.({
      phase: 'preparing',
      percent: 25,
      message: 'جاري تحضير ملفات المشاهد...',
    });

    const sceneDurations: number[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneIdx = i + 1;

      // Fetch image
      updateProgress('preparing', `جاري تحميل صورة المشهد ${sceneIdx}/${scenes.length}...`);
      const imageData = await fetchFileData(scene.imageUrl);
      await ffmpeg.writeFile(`scene_${sceneIdx}.jpg`, imageData);

      // Fetch audio
      updateProgress('preparing', `جاري تحميل صوت المشهد ${sceneIdx}/${scenes.length}...`);
      const audioData = await fetchFileData(scene.audioUrl);
      await ffmpeg.writeFile(`scene_${sceneIdx}.mp3`, audioData);

      // Get audio duration
      const duration = scene.duration || await getAudioDuration(audioData);
      sceneDurations.push(duration);
    }

    // ═══ Phase 3: Render Each Scene with Normalization + Watermark ═══
    onProgress?.({
      phase: 'rendering',
      percent: 45,
      message: 'جاري دمج المشاهد...',
    });

    const watermarkFilter = hasBranding ? `,${buildWatermarkFilter()}` : '';

    for (let i = 0; i < scenes.length; i++) {
      const sceneIdx = i + 1;
      const duration = sceneDurations[i];

      updateProgress('rendering', `جاري إنشاء فيديو المشهد ${sceneIdx}/${scenes.length}...`);

      const fadeInDuration = Math.min(0.5, duration * 0.1);
      const fadeOutStart = Math.max(0, duration - 0.5);
      const fadeOutDuration = Math.min(0.5, duration * 0.1);

      // Scale to 1920x1080 (pad with black if aspect ratio differs) + fade + watermark
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
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-vf', videoFilter,
        '-t', String(Math.ceil(duration)),
        '-shortest',
        '-y',
        `clip_${sceneIdx}.mp4`,
      ]);
    }

    // ═══ Phase 4: Concatenate All Clips (intro + scenes + outro) ═══
    onProgress?.({
      phase: 'finalizing',
      percent: 85,
      message: 'جاري تجميع الفيديو النهائي...',
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

    // ═══ Phase 5: Read Output & Cleanup ═══
    onProgress?.({
      phase: 'finalizing',
      percent: 95,
      message: 'جاري إنهاء الفيديو...',
    });

    const outputData = await ffmpeg.readFile('final_output.mp4');
    const blob = new Blob([outputData], { type: 'video/mp4' });

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
