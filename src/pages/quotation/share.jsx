import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { Images } from "../../common/assets";
import { sendQuotationEmail, sendQuotationWhatsApp, updateQuotationStatus } from "../../API/quotationApi";
import toast from "../../common/toast";

const ShareButton = ({
  selectedCustomer,
  quotationData,
  companyDetails,
  quotation,
  showFullContent,
  items,
  subtotal,
  charges,
  gstAmount,
  total,
  quotationInfo,
  quotationBy,
  quotationTo,
  footer,
  company,
  setQuotation
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Build PDF content with inline hex colors (avoids oklch which html2canvas doesn't support)
  const buildPdfContentElement = () => {
    const pdfContent = document.createElement('div');
    pdfContent.id = 'pdf-content-export';
    pdfContent.style.width = '210mm';
      pdfContent.style.backgroundColor = '#ffffff';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.padding = '0';
      pdfContent.style.margin = '0';
      pdfContent.style.boxSizing = 'border-box';

      // A4 height in pixels
      const A4_HEIGHT_PX = 297 * 3.78; // approx 1123px
      const FOOTER_HEIGHT_PX = 90;

      // Create header HTML
      const headerHTML = `
        <div style="background-color: #DEDFE6; padding: 24px; width: 100%; box-sizing: border-box;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; align-items: start;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${company?.logo || Images.smLogo}" style="width: 48px; height: 48px; object-fit: contain;" 
                   onerror="this.src='${Images.smLogo}'" />
              <div>
                <h2 style="font-size: 20px; font-weight: bold; margin: 0;">${company?.name || ''}</h2>
                <p style="color: #6B7280; font-size: 14px; margin-top: 4px;">${company?.email || ''}</p>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 14px; margin: 0;">${quotationInfo?.date || ''}</p>
              <p style="font-weight: 600; font-size: 16px; margin-top: 4px;">Quotation No</p>
              <p style="color: #2563EB; font-weight: bold;">${quotationInfo?.quotationNo || ''}</p>
            </div>
          </div>
        </div>
      `;

      // Create billing section HTML
      const billingHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 24px;">
          <div style="text-align: left;">
            <h4 style="font-weight: 600; color: #64748B; font-size: 14px; margin-bottom: 8px;">Quotation By</h4>
            ${quotationBy?.name ? `<p style="font-size: 14px; color: #1E293B; font-weight: 600; margin-bottom: 4px;">${quotationBy.name}</p>` : ''}
            ${quotationBy?.address ? `<p style="font-size: 14px; color: #1E293B; margin-bottom: 4px;">${quotationBy.address}</p>` : ''}
            ${quotationBy?.phone ? `<p style="font-size: 14px; color: #1E293B; margin-bottom: 4px;">${quotationBy.phone}</p>` : ''}
            ${quotationBy?.email ? `<p style="font-size: 14px; color: #1E293B;">${quotationBy.email}</p>` : ''}
          </div>
          <div style="text-align: right;">
            <h4 style="font-weight: 600; color: #64748B; font-size: 14px; margin-bottom: 8px;">Quotation To</h4>
            ${quotationTo?.name ? `<p style="font-size: 14px; color: #1E293B; font-weight: 600; margin-bottom: 4px;">${quotationTo.name}</p>` : ''}
            ${quotationTo?.address ? `<p style="font-size: 14px; color: #1E293B; margin-bottom: 4px;">${quotationTo.address}</p>` : ''}
            ${quotationTo?.phone ? `<p style="font-size: 14px; color: #1E293B; margin-bottom: 4px;">${quotationTo.phone}</p>` : ''}
            ${quotationTo?.email ? `<p style="font-size: 14px; color: #1E293B;">${quotationTo.email}</p>` : ''}
          </div>
        </div>
      `;

      // Create footer HTML
      const footerHTML = `
        <div style="background-color: #DEDFE6; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
          <img src="${footer?.logo || Images.fullLogo}" style="width: 140px; height: 40px; margin: 0 auto 8px; object-fit: contain;" 
               onerror="this.src='${Images.fullLogo}'" />
          <p style="color: #2563EB; font-size: 14px; margin: 0;">${footer?.website || ''}</p>
        </div>
      `;

      // Create total section HTML
      const totalHTML = `
        <div style="display: flex; justify-content: flex-end; margin-top: 24px; padding: 0 24px;">
          <div style="width: 280px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 0 8px;">
              <span style="font-size: 15px;">Subtotal</span>
              <span style="font-size: 15px;">₹${subtotal || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 0 8px;">
              <span style="font-size: 15px;">Shipping</span>
              <span style="font-size: 15px;">₹${charges?.shipping || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 0 8px;">
              <span style="font-size: 15px;">GST (${charges?.gstPercent || 0}%)</span>
              <span style="font-size: 15px;">₹${gstAmount || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #2563EB; padding: 12px 8px 0 8px; margin-top: 4px;">
              <span>Total</span>
              <span>₹${total || 0}</span>
            </div>
          </div>
        </div>
      `;

      // Create key features HTML
      const keyFeaturesHTML = items?.some(item => item.key_features?.some(f => f?.trim())) ? `
        <div style="margin: 32px 24px 24px 24px; border-top: 1px solid #E2E8F0; padding-top: 20px;">
          <h4 style="font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 16px;">Key Features</h4>
          <div style="font-size: 13px; color: #374151;">
            ${items.map(item => {
              const features = (item.key_features || []).filter(f => f?.trim());
              if (features.length === 0) return '';
              return `<p style="margin: 0 0 8px 0; line-height: 1.5;">
                <span style="font-weight: 600; color: #2563EB;">${item.item}:</span> ${features.join(', ')}
              </p>`;
            }).join('')}
          </div>
        </div>
      ` : '';

      if (!showFullContent || !items || items.length === 0) {
        // No items case
        pdfContent.innerHTML = `
          ${headerHTML}
          ${billingHTML}
          <div style="padding: 40px 24px; text-align: center; color: #9CA3AF; min-height: 300px;">
            <p style="font-size: 16px;">No items added yet</p>
          </div>
          ${footerHTML}
        `;
      } else {
        const rows = items;
        
        // Calculate rows per page - maximum 12 rows per page
        const MAX_ROWS_PER_PAGE = 12;
        const totalPages = Math.ceil(rows.length / MAX_ROWS_PER_PAGE);
        
        let pageContent = '';

        // Generate pages
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
          const startIdx = pageNum * MAX_ROWS_PER_PAGE;
          const endIdx = Math.min(startIdx + MAX_ROWS_PER_PAGE, rows.length);
          const pageRows = rows.slice(startIdx, endIdx);
          
          // Check if this is the last page
          const isLastPage = pageNum === totalPages - 1;
          
          // Add page break for all pages except last
          if (pageNum > 0) {
            pageContent += `<div style="page-break-before: always;"></div>`;
          }
          
          // Start page container - relative for footer positioning, min-height A4, padding-bottom for footer space
          const pageBreakAfter = isLastPage ? '' : 'page-break-after: always;';
          pageContent += `<div style="position: relative; min-height: ${A4_HEIGHT_PX}px; padding-bottom: ${FOOTER_HEIGHT_PX}px; box-sizing: border-box; ${pageBreakAfter} page-break-inside: avoid;">`;
          
          // Add header and billing only on first page
          if (pageNum === 0) {
            pageContent += headerHTML;
            pageContent += billingHTML;
          } else {
            // Add simple header for subsequent pages
            pageContent += `
              <div style="background-color: #DEDFE6; padding: 16px 24px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${company?.logo || Images.smLogo}" style="width: 40px; height: 40px; object-fit: contain;" />
                    <div>
                      <h2 style="font-size: 18px; font-weight: bold; margin: 0;">${company?.name || ''}</h2>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <p style="font-size: 13px; color: #2563EB; font-weight: 600;">Quotation #${quotationInfo?.quotationNo || ''}</p>
                    <p style="font-size: 12px; color: #6B7280;">Page ${pageNum + 1} of ${totalPages}</p>
                  </div>
                </div>
              </div>
            `;
          }
          
          // Add table
          pageContent += `
            <div style="padding: 0 24px;">
              <table style="width: 100%; border-collapse: collapse; margin-top: ${pageNum === 0 ? '0' : '8px'};">
                <thead>
                  <tr style="background-color: #2563EB;">
                    <th style="padding: 12px; text-align: left; color: white; font-size: 14px;">Service Name</th>
                    <th style="padding: 12px; text-align: center; color: white; font-size: 14px;">Quantity</th>
                    <th style="padding: 12px; text-align: center; color: white; font-size: 14px;">Price</th>
                    <th style="padding: 12px; text-align: right; color: white; font-size: 14px;">Amount(₹)</th>
                  </tr>
                </thead>
                <tbody>
          `;
          
          // Add rows for this page
          pageRows.forEach(item => {
            pageContent += `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px;">${item.item || ''}</td>
                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #E2E8F0; font-size: 13px;">${item.qty || 0}</td>
                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #E2E8F0; font-size: 13px;">₹${item.rate || 0}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: 500;">₹${(item.qty * item.rate) || 0}</td>
              </tr>
            `;
          });
          
          // Add empty rows to maintain minimum height if needed
          const emptyRowsCount = MAX_ROWS_PER_PAGE - pageRows.length;
          if (emptyRowsCount > 0 && !isLastPage) {
            for (let i = 0; i < emptyRowsCount; i++) {
              pageContent += `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">&nbsp;</td>
                  <td style="padding: 10px; text-align: center; border-bottom: 1px solid #E2E8F0;">&nbsp;</td>
                  <td style="padding: 10px; text-align: center; border-bottom: 1px solid #E2E8F0;">&nbsp;</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #E2E8F0;">&nbsp;</td>
                </tr>
              `;
            }
          }
          
          pageContent += `
                </tbody>
              </table>
          `;
          
          // Add totals and key features only on last page
          if (isLastPage) {
            pageContent += totalHTML;
            pageContent += keyFeaturesHTML;
          }
          
          pageContent += `</div>`; // Close padding div
          
          // Footer fixed at bottom of each page
          pageContent += `<div style="position: absolute; bottom: 0; left: 0; right: 0;">${footerHTML}</div>`;
          pageContent += `</div>`; // Close page container
        }

        pdfContent.innerHTML = pageContent;
      }
    return pdfContent;
  };

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const pdfContent = buildPdfContentElement();
      document.body.appendChild(pdfContent);
      const customerName = selectedCustomer?.customer_name?.trim() || "quotation";
      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${customerName.replace(/[^a-z0-9]/gi, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css"] }
      };
      await html2pdf().set(opt).from(pdfContent).save();
      document.body.removeChild(pdfContent);
      
      // Update quotation status to "submitted" after successful download
      if (quotation?.id) {
        try {
          const statusRes = await updateQuotationStatus(quotation.id, "submitted");
          if (statusRes.success) {
            // Update local state
            if (setQuotation && quotation) {
              setQuotation({ ...quotation, status: "submitted" });
            }
            toast.success("PDF downloaded! Status updated to Submitted.");
          } else {
            // PDF downloaded but status update failed - still show success for download
            console.warn("Status update failed:", statusRes.message);
          }
        } catch (statusError) {
          // PDF downloaded but status update failed - still show success for download
          console.warn("Status update error:", statusError);
        }
      }
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Error generating PDF: " + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const getPdfBase64 = async () => {
    const pdfContent = buildPdfContentElement();
    document.body.appendChild(pdfContent);
    const opt = {
      margin: [0, 0, 0, 0],
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css"] }
    };
    try {
      const dataUri = await html2pdf().set(opt).from(pdfContent).outputPdf("datauristring");
      return dataUri ? dataUri.split(",")[1] : null;
    } finally {
      if (pdfContent.parentNode) pdfContent.parentNode.removeChild(pdfContent);
    }
  };

  const handleSendEmail = async () => {
    const customerEmail = quotationTo?.email || quotation?.quotation_to?.email || selectedCustomer?.email;
    if (isSending || !customerEmail) {
      if (!customerEmail) toast.error("Select a customer with email first");
      return;
    }
    setIsSending(true);
    try {
      const pdfBase64 = await getPdfBase64();
      if (!pdfBase64) {
        toast.error("Could not generate PDF");
        return;
      }
      const res = await sendQuotationEmail({
        quotation_id: quotation?.id,
        recipient_email: customerEmail,
        customer_name: quotationTo?.name || selectedCustomer?.customer_name || "Customer",
        pdf_base64: pdfBase64,
        pdf_filename: `quotation_${quotationInfo?.quotationNo || "quote"}.pdf`
      });
      if (res.success) {
        toast.success("Quotation sent via email! Status set to Submitted.");
        if (setQuotation && quotation) setQuotation({ ...quotation, status: "submitted" });
      } else {
        toast.error(res.message || res.error?.error || "Failed to send");
      }
    } catch (e) {
      const errMsg = e?.response?.data?.error || e?.message || "Failed to send email";
      console.error("Email send error:", e);
      toast.error(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (isSending) return;
    const phone = quotationTo?.phone || quotation?.quotation_to?.phone;
    if (!phone && !quotation?.id) {
      toast.error("Customer phone is required for WhatsApp");
      return;
    }
    setIsSending(true);
    try {
      const res = await sendQuotationWhatsApp({
        quotation_id: quotation?.id,
        recipient_phone: phone || "",
        customer_name: quotationTo?.name || selectedCustomer?.customer_name || "Customer"
      });
      if (res.success) {
        toast.success("Status set to Submitted. Opening WhatsApp...");
        const link = res.data?.wa_link ?? res.wa_link;
        if (link) window.open(link, "_blank");
        if (setQuotation && quotation) setQuotation({ ...quotation, status: "submitted" });
      } else toast.error(res.message || "Failed");
    } catch (e) {
      toast.error("Failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative group inline-block w-32 h-10">
      <div className="relative w-full h-full rounded-full bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
          <div className="flex items-center justify-center gap-2 w-full h-full">
            <Share2 size={18} />
            <span className="text-sm font-medium">Share</span>
          </div>
        </div>

        <div className="absolute bg-[#F1F1FA] inset-0 flex items-center justify-center gap-3 translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0">
          <button
            onClick={handleSendWhatsApp}
            disabled={isSending}
            className="text-primary rounded-full hover:scale-110 transition disabled:opacity-50"
            title="Send via WhatsApp"
          >
            <FaWhatsapp size={20} />
          </button>
          <button
            onClick={handleSendEmail}
            disabled={isSending}
            className="text-primary rounded-full hover:scale-110 transition disabled:opacity-50"
            title="Send via Email (SMTP)"
          >
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