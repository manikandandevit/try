/**
 * PDF Generation Utility
 * Handles PDF generation using html2pdf.js
 */

import html2pdf from 'html2pdf.js';

export const generatePdf = async (elementId: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Quotation preview element not found');
  }

  const options = {
    margin: [0, 0, 0, 0],
    filename: `quotation_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: true,
      imageTimeout: 15000,
      onclone: (clonedDoc: Document) => {
        const clonedBody = clonedDoc.body;
        const clonedHtml = clonedDoc.documentElement;
        const clonedPreview = clonedDoc.getElementById(elementId);

        if (clonedBody) {
          clonedBody.style.margin = '0';
          clonedBody.style.padding = '0';
        }

        if (clonedHtml) {
          clonedHtml.style.margin = '0';
          clonedHtml.style.padding = '0';
        }

        if (clonedPreview) {
          clonedPreview.style.margin = '0';
          clonedPreview.style.padding = '0';
          clonedPreview.style.width = '100%';
          // Use absolute positioning for footer - more reliable with html2pdf.js
          // A4 height at 96dpi = 1123px (297mm)
          clonedPreview.style.position = 'relative';
          clonedPreview.style.minHeight = '1123px';
          clonedPreview.style.height = '1123px';
          clonedPreview.style.boxSizing = 'border-box';

          // Find and configure content wrapper with padding for footer space
          const contentWrapper = clonedPreview.querySelector('[data-content-wrapper="true"]') as HTMLElement;
          if (contentWrapper) {
            contentWrapper.style.display = 'block';
            contentWrapper.style.position = 'relative';
            contentWrapper.style.minHeight = '0';
            // Add padding-bottom to prevent content from overlapping footer (reduced for very small footer)
            contentWrapper.style.paddingBottom = '60px';
          }

          // Configure footer to appear at absolute bottom of page
          const footer = clonedPreview.querySelector('[data-footer="true"]') as HTMLElement;
          if (footer) {
            // Use absolute positioning to place footer at bottom
            footer.style.position = 'absolute';
            footer.style.bottom = '0';
            footer.style.left = '0';
            footer.style.right = '0';
            footer.style.width = '100%';
            footer.style.display = 'block';
            footer.style.boxSizing = 'border-box';
            
            // PDF page break handling - keep footer together
            footer.style.pageBreakInside = 'avoid';
            footer.style.pageBreakBefore = 'avoid';
            footer.style.breakInside = 'avoid';
            footer.style.breakBefore = 'avoid';
            // Prevent footer from splitting across pages
            footer.style.orphans = '1000';
            footer.style.widows = '1000';
          }
          
          // Ensure content containers handle page breaks properly
          const contentContainers = clonedPreview.querySelectorAll('.quotationTableContainer, .totalsSection');
          contentContainers.forEach((container) => {
            const el = container as HTMLElement;
            el.style.pageBreakAfter = 'auto';
            el.style.breakAfter = 'auto';
            el.style.pageBreakInside = 'avoid';
            el.style.breakInside = 'avoid';
          });

          // Apply @page rules and absolute positioning styles for PDF generation
          const style = clonedDoc.createElement('style');
          style.textContent = `
            @page {
              size: A4 portrait;
              margin: 0;
            }
            #${elementId} {
              position: relative !important;
              min-height: 1123px !important;
              height: 1123px !important;
              box-sizing: border-box !important;
            }
            #${elementId} [data-content-wrapper="true"] {
              display: block !important;
              position: relative !important;
              min-height: 0 !important;
              padding-bottom: 60px !important;
            }
            /* Footer at bottom of page using absolute positioning */
            #${elementId} [data-footer="true"] {
              position: absolute !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            /* Ensure content doesn't overlap with footer */
            body {
              padding-bottom: 0 !important;
              margin: 0 !important;
            }
            /* Ensure header is full-width in PDF */
            .previewHeaderBanner {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              left: 0 !important;
              right: 0 !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Remove transitions and animations for PDF
          const clonedElements = clonedPreview.querySelectorAll('*');
          clonedElements.forEach((el) => {
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.transition = 'none';
            (el as HTMLElement).style.animation = 'none';
          });
        }
      },
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
  };

  await html2pdf()
    .set(options)
    .from(element)
    .save();
};

