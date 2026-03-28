import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Video Generation Fix', () => {
  const videoRendererPath = path.join(__dirname, '../client/src/lib/videoRenderer.ts');
  const ultimateStudioPath = path.join(__dirname, '../client/src/pages/UltimateStudio.tsx');
  const translationsPath = path.join(__dirname, '../client/src/lib/ultimateStudioTranslations.ts');

  it('should have videoRenderer.ts file', () => {
    expect(fs.existsSync(videoRendererPath)).toBe(true);
  });

  it('should NOT have crossOriginIsolated check that causes infinite reload', () => {
    const content = fs.readFileSync(ultimateStudioPath, 'utf-8');
    expect(content).not.toContain('window.crossOriginIsolated');
    expect(content).not.toContain('window.location.reload()');
  });

  it('should use single-threaded FFmpeg ESM core (no SharedArrayBuffer needed)', () => {
    const content = fs.readFileSync(videoRendererPath, 'utf-8');
    expect(content).toContain('dist/esm');
    expect(content).toContain('ffmpeg-core.js');
    expect(content).toContain('ffmpeg-core.wasm');
  });

  it('should NOT reference multi-threaded FFmpeg core', () => {
    const content = fs.readFileSync(videoRendererPath, 'utf-8');
    expect(content).not.toContain('ffmpeg-core.worker.js');
    expect(content).not.toContain('dist/umd');
  });

  it('should have retry logic for FFmpeg loading', () => {
    const content = fs.readFileSync(videoRendererPath, 'utf-8');
    expect(content).toContain('maxRetries');
    expect(content).toContain('attempt');
  });

  it('should have proper error handling for FFMPEG_LOAD_FAILED', () => {
    const content = fs.readFileSync(ultimateStudioPath, 'utf-8');
    expect(content).toContain('FFMPEG_LOAD_FAILED');
    expect(content).toContain('videoTryChrome');
  });

  it('should have proper error handling for network errors', () => {
    const content = fs.readFileSync(ultimateStudioPath, 'utf-8');
    expect(content).toContain('videoNetworkError');
    expect(content).toContain('Failed to fetch');
  });

  it('should have videoTryChrome translation in Arabic', () => {
    const content = fs.readFileSync(translationsPath, 'utf-8');
    expect(content).toContain('videoTryChrome');
    expect(content).toContain('Google Chrome على الحاسوب');
  });

  it('should have videoTryChrome translation in French', () => {
    const content = fs.readFileSync(translationsPath, 'utf-8');
    expect(content).toContain('Google Chrome sur ordinateur');
  });

  it('should have videoTryChrome translation in English', () => {
    const content = fs.readFileSync(translationsPath, 'utf-8');
    expect(content).toContain('Chrome on desktop');
  });

  it('should have videoNetworkError translation in all 3 languages', () => {
    const content = fs.readFileSync(translationsPath, 'utf-8');
    const networkErrorCount = (content.match(/videoNetworkError/g) || []).length;
    expect(networkErrorCount).toBeGreaterThanOrEqual(3);
  });

  it('should use ArrayBuffer cast for Blob creation (TS fix)', () => {
    const content = fs.readFileSync(videoRendererPath, 'utf-8');
    expect(content).toContain('as ArrayBuffer');
    expect(content).toContain('as BlobPart');
  });

  it('should have comment explaining no crossOriginIsolated needed', () => {
    const content = fs.readFileSync(ultimateStudioPath, 'utf-8');
    expect(content).toContain('single-threaded FFmpeg');
    expect(content).toContain('No reload needed');
  });
});
