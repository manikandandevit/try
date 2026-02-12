import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ShareButton = ({ selectedCustomer }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const element = document.getElementById("quotation-preview");
      if (!element) {
        alert("Quotation preview not found. Please ensure the quotation is visible.");
        return;
      }

      // Find the actual quotation content (the white card inside) - this contains header, content, and footer
      const quotationContent = element.querySelector('.bg-white.shadow.rounded-xl') || element;
      
      if (!quotationContent) {
        alert("Quotation content not found. Please ensure the quotation is fully loaded.");
        return;
      }

      // Wait a bit to ensure all images are loaded
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Scroll to top to capture full content from beginning
      element.scrollTop = 0;
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get footer element (for separate capture, so we can pin it to bottom of each PDF page)
      const footerElement = quotationContent.querySelector('.quotation-footer');

      // Get the full height of the quotation (header + content + footer)
      const fullHeight = quotationContent.scrollHeight || quotationContent.offsetHeight;
      const fullWidth = quotationContent.scrollWidth || quotationContent.offsetWidth;

      // Create a deep clone of the element to convert oklch colors
      const clone = quotationContent.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = fullWidth + 'px';
      clone.style.height = 'auto';
      clone.style.minHeight = fullHeight + 'px';
      clone.style.visibility = 'visible'; // Make it visible for capture
      clone.style.opacity = '1';
      clone.style.overflow = 'visible'; // Ensure all content is visible

      // In the cloned content, hide the footer so that the main canvas only contains
      // header + body. We'll capture the footer separately and draw it at the bottom
      // of every PDF page, so it always sits at the page bottom.
      const clonedFooter = clone.querySelector('.quotation-footer');
      if (clonedFooter) {
        clonedFooter.style.display = 'none';
      }

      document.body.appendChild(clone);

      // Convert all modern color formats (oklch, oklab, etc.) to RGB
      const convertColorsToRgb = (elementToConvert) => {
        const allElements = elementToConvert.querySelectorAll('*');
        const originalElements = Array.from(document.querySelectorAll('*'));
        
        allElements.forEach((el, index) => {
          try {
            // Try to find matching original element by index or class
            let originalEl = el;
            if (index < originalElements.length) {
              // Try to match by similar structure
              const elClasses = Array.from(el.classList || []);
              if (elClasses.length > 0) {
                const matched = originalElements.find(orig => {
                  const origClasses = Array.from(orig.classList || []);
                  return elClasses.some(c => origClasses.includes(c));
                });
                if (matched) originalEl = matched;
              }
            }

            const computed = window.getComputedStyle(originalEl);
            
            // Helper to convert any color format to RGB
            const getRgbColor = (colorValue, property = 'color') => {
              if (!colorValue || colorValue === 'transparent' || colorValue === 'rgba(0, 0, 0, 0)') {
                return null;
              }
              
              // If it's already RGB/RGBA/HEX, use it
              if (colorValue.startsWith('rgb') || colorValue.startsWith('#')) {
                return colorValue;
              }
              
              // If it contains oklch, oklab, or other modern color formats, convert it
              if (colorValue.includes('oklch') || colorValue.includes('oklab') || 
                  colorValue.includes('lab') || colorValue.includes('lch') ||
                  colorValue.includes('color(')) {
                // Create a temporary element to force browser color conversion
                const temp = document.createElement('div');
                temp.style[property] = colorValue;
                temp.style.position = 'absolute';
                temp.style.visibility = 'hidden';
                temp.style.top = '-9999px';
                temp.style.left = '-9999px';
                document.body.appendChild(temp);
                
                // Force a reflow to ensure color is computed
                void temp.offsetHeight;
                
                const rgb = window.getComputedStyle(temp)[property];
                document.body.removeChild(temp);
                
                // Return RGB if conversion succeeded
                if (rgb && !rgb.includes('oklch') && !rgb.includes('oklab') && 
                    !rgb.includes('lab') && !rgb.includes('lch') && 
                    rgb !== 'transparent' && rgb !== 'rgba(0, 0, 0, 0)') {
                  return rgb;
                }
              }
              
              return null;
            };

            // Convert color
            const rgbColor = getRgbColor(computed.color, 'color');
            if (rgbColor) {
              el.style.color = rgbColor;
            }

            // Convert backgroundColor
            const rgbBg = getRgbColor(computed.backgroundColor, 'backgroundColor');
            if (rgbBg) {
              el.style.backgroundColor = rgbBg;
            }

            // Convert borderColor
            const rgbBorder = getRgbColor(computed.borderColor, 'borderColor');
            if (rgbBorder && computed.borderWidth !== '0px') {
              el.style.borderColor = rgbBorder;
            }
            
            // Convert borderTopColor, borderRightColor, etc.
            ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].forEach(prop => {
              const borderColor = computed[prop];
              if (borderColor) {
                const rgb = getRgbColor(borderColor, prop);
                if (rgb) {
                  el.style[prop] = rgb;
                }
              }
            });
          } catch (e) {
            // Ignore errors for individual elements
            console.warn('Color conversion error for element:', e);
          }
        });
      };

      // Convert all modern color formats to RGB in the clone
      convertColorsToRgb(clone);

      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      // Wait a bit more for clone to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // Create canvas from the clone - capture full height (header + content, without footer)
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        removeContainer: false, // Keep container for full capture
      });

      // Remove the clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png", 1.0);

      // Capture the footer as a separate image so we can place it at the bottom
      // of every PDF page (or at least the last page).
      let footerImgData = null;
      let footerCanvas = null;

      if (footerElement) {
        const footerClone = footerElement.cloneNode(true);
        footerClone.style.position = 'absolute';
        footerClone.style.left = '-9999px';
        footerClone.style.top = '0';
        footerClone.style.visibility = 'visible';
        footerClone.style.opacity = '1';
        document.body.appendChild(footerClone);

        try {
          // Optional: normalize colors inside footer as well
          convertColorsToRgb(footerClone);
          await new Promise(resolve => setTimeout(resolve, 100));

          footerCanvas = await html2canvas(footerClone, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff',
          });
          footerImgData = footerCanvas.toDataURL("image/png", 1.0);
        } catch (e) {
          // If footer capture fails, we simply skip footer image; PDF will still be generated.
          footerImgData = null;
          footerCanvas = null;
        } finally {
          document.body.removeChild(footerClone);
        }
      }
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit width while maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const imgAspectRatio = imgHeight / imgWidth;

      const marginX = 5; // left/right margin
      const marginTop = 5;
      const marginBottom = 5;

      // Fit to page width, maintain aspect ratio
      const imgWidthInMM = pdfWidth - marginX * 2;
      const scaleFactor = imgWidthInMM / imgWidth;
      let imgHeightInMM = imgWidthInMM * imgAspectRatio;

      // Footer height (in mm) based on captured footer image
      let footerHeightInMM = 0;
      if (footerCanvas && footerImgData) {
        footerHeightInMM = footerCanvas.height * scaleFactor / 1; // height(px) * (mm/px)
      }

      // Available content height per page after reserving space for footer
      const availableContentHeightPerPage = pdfHeight - marginTop - marginBottom - footerHeightInMM;

      const xOffset = marginX;

      // If content fits in one page (with room for footer)
      if (imgHeightInMM <= availableContentHeightPerPage) {
        const yOffset = marginTop;
        pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidthInMM, imgHeightInMM);

        // Draw footer at the bottom of the page
        if (footerImgData && footerHeightInMM > 0) {
          const footerY = pdfHeight - marginBottom - footerHeightInMM;
          pdf.addImage(
            footerImgData,
            "PNG",
            xOffset,
            footerY,
            imgWidthInMM,
            footerHeightInMM
          );
        }
      } else {
        // Split across multiple pages
        let remainingHeightMM = imgHeightInMM;
        let sourceYpx = 0;
        const imgHeightMMTotal = imgHeightInMM; // for ratio

        while (remainingHeightMM > 0) {
          const isFirstPage = sourceYpx === 0;

          if (!isFirstPage) {
            pdf.addPage();
          }

          const heightThisPageMM = Math.min(remainingHeightMM, availableContentHeightPerPage);

          // Calculate corresponding source height in pixels
          const sourceHeightPx = (heightThisPageMM / imgHeightMMTotal) * imgHeight;

          // Create a temporary canvas for this page section
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeightPx;
          const ctx = pageCanvas.getContext('2d');
          ctx.drawImage(
            canvas,
            0,
            sourceYpx,
            imgWidth,
            sourceHeightPx,
            0,
            0,
            imgWidth,
            sourceHeightPx
          );

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const yOffset = marginTop;

          pdf.addImage(pageImgData, "PNG", xOffset, yOffset, imgWidthInMM, heightThisPageMM);

          // Draw footer at the bottom of this page
          if (footerImgData && footerHeightInMM > 0) {
            const footerY = pdfHeight - marginBottom - footerHeightInMM;
            pdf.addImage(
              footerImgData,
              "PNG",
              xOffset,
              footerY,
              imgWidthInMM,
              footerHeightInMM
            );
          }

          sourceYpx += sourceHeightPx;
          remainingHeightMM -= heightThisPageMM;
        }
      }

      const customerName =
        selectedCustomer?.customer_name?.trim() ||
        selectedCustomer?.name?.trim() ||
        "quotation";

      const fileName = `${customerName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      console.log("Saving PDF as:", fileName);
      pdf.save(fileName);
      console.log("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Error generating PDF: ${error.message}. Please check the console for details.`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative group inline-block w-32 h-10">
      <div className="relative w-full h-full rounded-full bg-primary text-white overflow-hidden">
        {/* Sliding Container */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
          {/* Share Button (Top Layer) */}
          <div className="flex items-center justify-center gap-2 w-full h-full">
            <Share2 size={18} />
            <span className="text-sm font-medium">Share</span>
          </div>
        </div>

        {/* Icons Layer (Under Share) */}
        <div className="absolute bg-[#F1F1FA] inset-0 flex items-center justify-center gap-3 translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0">
          <button className="text-primary rounded-full hover:scale-110 transition">
            <FaWhatsapp size={20} />
          </button>

          <button className="text-primary rounded-full hover:scale-110 transition">
            <FaEnvelope size={20} />
          </button>

          <button
            className="text-primary rounded-full hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownloadPdf}
            type="button"
            disabled={isDownloading}
            title={isDownloading ? "Generating PDF..." : "Download PDF"}
          >
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareButton;
