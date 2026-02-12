declare module 'arabic-reshaper' {
  function ArabicReshaper(text: string): string;
  export default ArabicReshaper;
}

declare module 'bidi-js' {
  interface Bidi {
    getReorderedString(text: string): string;
    getBidiCharType(char: string): number;
    getEmbeddingLevels(text: string, direction?: string): number[];
  }
  
  function bidiFactory(): Bidi;
  export default bidiFactory;
}
