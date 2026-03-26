import { create } from 'zustand';

/**
 * Global Extraction Store - العصب المركزي للنظام البيئي المتصل
 * يحفظ النص المقتطع من الكتب المدرسية ليتم تمريره لاحقاً إلى أدوات أخرى
 */

export interface ExtractionState {
  // النص المستخرج من الكتاب المدرسي
  extracted_payload: string;
  
  // معلومات المصدر
  sourceInfo: {
    fileName: string;
    pageNumber: number;
    extractedAt: Date | null;
  } | null;
  
  // حالة الاستخراج
  isExtracting: boolean;
  
  // الإجراءات
  setExtractedPayload: (text: string, source?: { fileName: string; pageNumber: number }) => void;
  appendToPayload: (text: string) => void;
  clearPayload: () => void;
  setIsExtracting: (value: boolean) => void;
}

export const useExtractionStore = create<ExtractionState>((set) => ({
  extracted_payload: '',
  sourceInfo: null,
  isExtracting: false,
  
  setExtractedPayload: (text, source) => set({
    extracted_payload: text,
    sourceInfo: source ? {
      fileName: source.fileName,
      pageNumber: source.pageNumber,
      extractedAt: new Date(),
    } : null,
  }),
  
  appendToPayload: (text) => set((state) => ({
    extracted_payload: state.extracted_payload ? `${state.extracted_payload}\n\n${text}` : text,
  })),
  
  clearPayload: () => set({
    extracted_payload: '',
    sourceInfo: null,
  }),
  
  setIsExtracting: (value) => set({ isExtracting: value }),
}));
