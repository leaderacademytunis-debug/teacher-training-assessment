/**
 * VideoRenderer - Client-side video rendering engine using FFmpeg.wasm
 * Merges storyboard images + audio into a single MP4 video
 * All processing happens in the user's browser (zero server cost)
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface SceneData {
  sceneNumber: number;
  imageUrl: string;   // URL of the generated image
  audioUrl: string;   // URL of the audio MP3
  duration?: number;  // Optional duration hint in seconds
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

  // Use ESM build for Vite compatibility
  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

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
  const data = await fetchFile(url);
  return new Uint8Array(data);
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
      resolve(5); // fallback 5 seconds
    });
    audio.src = url;
  });
}

/**
 * Main render function: takes scenes and produces an MP4 blob
 */
export async function renderVideo(
  scenes: SceneData[],
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (!isWasmSupported()) {
    throw new Error('WASM_NOT_SUPPORTED');
  }

  if (scenes.length === 0) {
    throw new Error('NO_SCENES');
  }

  const ffmpeg = await loadFFmpeg(onProgress);

  const totalSteps = scenes.length * 3 + 2; // fetch + render per scene + concat + cleanup
  let currentStep = 0;

  const updateProgress = (message: string) => {
    currentStep++;
    const percent = Math.min(15 + Math.round((currentStep / totalSteps) * 80), 95);
    onProgress?.({
      phase: 'rendering',
      percent,
      message,
    });
  };

  try {
    // Phase 1: Prepare - fetch all assets and write to virtual FS
    onProgress?.({
      phase: 'preparing',
      percent: 18,
      message: 'جاري تحضير ملفات المشاهد...',
    });

    const sceneDurations: number[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneIdx = i + 1;

      // Fetch image
      updateProgress(`جاري تحميل صورة المشهد ${sceneIdx}/${scenes.length}...`);
      const imageData = await fetchFileData(scene.imageUrl);
      await ffmpeg.writeFile(`scene_${sceneIdx}.jpg`, imageData);

      // Fetch audio
      updateProgress(`جاري تحميل صوت المشهد ${sceneIdx}/${scenes.length}...`);
      const audioData = await fetchFileData(scene.audioUrl);
      await ffmpeg.writeFile(`scene_${sceneIdx}.mp3`, audioData);

      // Get audio duration
      const duration = scene.duration || await getAudioDuration(audioData);
      sceneDurations.push(duration);
    }

    // Phase 2: Render each scene as a video clip
    onProgress?.({
      phase: 'rendering',
      percent: 40,
      message: 'جاري دمج المشاهد...',
    });

    for (let i = 0; i < scenes.length; i++) {
      const sceneIdx = i + 1;
      const duration = sceneDurations[i];

      updateProgress(`جاري إنشاء فيديو المشهد ${sceneIdx}/${scenes.length}...`);

      // Create video from still image + audio
      // -loop 1: loop the image
      // -t duration: set duration to match audio
      // -c:v libx264: H.264 video codec
      // -tune stillimage: optimize for still images
      // -c:a aac: AAC audio codec
      // -pix_fmt yuv420p: compatible pixel format
      // -shortest: stop when shortest input ends
      // -vf fade: add fade in/out transitions
      const fadeInDuration = Math.min(0.5, duration * 0.1);
      const fadeOutStart = Math.max(0, duration - 0.5);
      const fadeOutDuration = Math.min(0.5, duration * 0.1);

      await ffmpeg.exec([
        '-loop', '1',
        '-i', `scene_${sceneIdx}.jpg`,
        '-i', `scene_${sceneIdx}.mp3`,
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-vf', `fade=t=in:st=0:d=${fadeInDuration},fade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}`,
        '-t', String(Math.ceil(duration)),
        '-shortest',
        '-y',
        `clip_${sceneIdx}.mp4`,
      ]);
    }

    // Phase 3: Concatenate all clips
    onProgress?.({
      phase: 'finalizing',
      percent: 85,
      message: 'جاري تجميع الفيديو النهائي...',
    });

    // Build concat file
    let concatContent = '';
    for (let i = 1; i <= scenes.length; i++) {
      concatContent += `file 'clip_${i}.mp4'\n`;
    }
    await ffmpeg.writeFile('concat_list.txt', concatContent);

    // Concatenate all clips into final video
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat_list.txt',
      '-c', 'copy',
      '-y',
      'final_output.mp4',
    ]);

    // Read the final output
    onProgress?.({
      phase: 'finalizing',
      percent: 95,
      message: 'جاري إنهاء الفيديو...',
    });

    const outputData = await ffmpeg.readFile('final_output.mp4');
    const blob = new Blob([outputData], { type: 'video/mp4' });

    // Cleanup virtual FS
    for (let i = 1; i <= scenes.length; i++) {
      try {
        await ffmpeg.deleteFile(`scene_${i}.jpg`);
        await ffmpeg.deleteFile(`scene_${i}.mp3`);
        await ffmpeg.deleteFile(`clip_${i}.mp4`);
      } catch { /* ignore cleanup errors */ }
    }
    try {
      await ffmpeg.deleteFile('concat_list.txt');
      await ffmpeg.deleteFile('final_output.mp4');
    } catch { /* ignore */ }

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
  // Revoke after a short delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
