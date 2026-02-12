declare module 'arabic-reshaper' {
  function ArabicReshaper(text: string): string;
  export default ArabicReshaper;
}

declare module 'bidi-js' {
  interface Bidi {
    applyBidi(text: string): string;
  }
  
  function bidiFactory(): Bidi;
  export default bidiFactory;
}
