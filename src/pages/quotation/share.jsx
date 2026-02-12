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
      console.log("Starting PDF download...");
      const element = document.getElementById("quotation-preview");
      if (!element) {
        alert("Quotation preview not found. Please ensure the quotation is visible.");
        console.error("Quotation preview element not found");
        return;
      }

      console.log("Element found, capturing...");
      
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

      // Get the full height of the quotation (header + content + footer)
      const fullHeight = quotationContent.scrollHeight || quotationContent.offsetHeight;
      const fullWidth = quotationContent.scrollWidth || quotationContent.offsetWidth;

      console.log("Quotation dimensions:", { width: fullWidth, height: fullHeight });

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

      // Create canvas from the clone - capture full height including header and footer
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

      console.log("Canvas created, generating PDF...");
      console.log("Canvas dimensions:", { width: canvas.width, height: canvas.height });
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit width while maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const imgAspectRatio = imgHeight / imgWidth;
      const pdfAspectRatio = pdfHeight / pdfWidth;
      
      let imgWidthInMM, imgHeightInMM;
      
      // Fit to page width, maintain aspect ratio
      imgWidthInMM = pdfWidth - 10; // 5mm margin on each side
      imgHeightInMM = imgWidthInMM * imgAspectRatio;
      
      const xOffset = 5; // 5mm left margin
      let yOffset = 5; // Start with 5mm top margin

      // If content fits in one page
      if (imgHeightInMM <= pdfHeight - 10) {
        pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidthInMM, imgHeightInMM);
      } else {
        // Split across multiple pages
        let sourceY = 0;
        let remainingHeight = imgHeightInMM;
        let pageAdded = false;

        while (remainingHeight > 0) {
          if (pageAdded) {
            pdf.addPage();
            yOffset = 5; // Reset to top for new page
          }

          const availableHeight = pdfHeight - 10; // 5mm margin top and bottom
          const heightToAdd = Math.min(remainingHeight, availableHeight);
          
          // Calculate source crop for this page
          const sourceHeight = (heightToAdd / imgHeightInMM) * imgHeight;
          
          // Create a temporary canvas for this page section
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          
          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          pdf.addImage(pageImgData, "PNG", xOffset, yOffset, imgWidthInMM, heightToAdd);
          
          sourceY += sourceHeight;
          remainingHeight -= heightToAdd;
          pageAdded = true;
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
