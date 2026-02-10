/**
 * Type definitions for html2pdf.js
 */

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: 'jpeg' | 'png';
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      allowTaint?: boolean;
      letterRendering?: boolean;
      logging?: boolean;
      backgroundColor?: string;
      removeContainer?: boolean;
      imageTimeout?: number;
      onclone?: (clonedDoc: Document) => void;
    };
    jsPDF?: {
      unit?: 'mm' | 'pt' | 'px' | 'in';
      format?: 'a4' | 'letter' | [number, number];
      orientation?: 'portrait' | 'landscape';
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    save(): Promise<void>;
  }

  function html2pdf(): Html2Pdf;

  export default html2pdf;
}

