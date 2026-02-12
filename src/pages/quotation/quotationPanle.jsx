import { useState, useEffect } from "react";
import { Images } from "../../common/assets";
import QuotationTemplate from "./quotationTemplate";
import TemplateDropdown from "./searchCustomer";
import ShareButton from "./share";
import { getCompanyDetails } from "../../API/companyApi";
import { FileText } from "lucide-react";

const QuotationPanel = ({ quotation, loading, setQuotation }) => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transformedData, setTransformedData] = useState(null);

  // Load persisted customer on mount
  useEffect(() => {
    const savedCustomer = localStorage.getItem("selectedQuotationCustomer");
    if (savedCustomer) {
      try {
        const customer = JSON.parse(savedCustomer);
        setSelectedCustomer(customer);
      } catch (error) {
        console.error("Error loading saved customer:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await getCompanyDetails();
        if (response.success) {
          setCompanyDetails(response.data?.company || response.data);
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };

    fetchCompanyDetails();
  }, []);

  // Transform quotation data when it changes
  useEffect(() => {
    if (quotation && companyDetails) {
      const data = transformQuotationData(quotation, companyDetails, selectedCustomer);
      setTransformedData(data);
    }
  }, [quotation, companyDetails, selectedCustomer]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    // Persist customer selection to localStorage
    localStorage.setItem("selectedQuotationCustomer", JSON.stringify(customer));
    // Update quotation with customer details if quotation exists
    if (quotation && setQuotation) {
      const updatedQuotation = {
        ...quotation,
        quotation_to: {
          name: customer.customer_name || "",
          address: customer.address || "",
          phone: customer.phone_number || "",
          email: customer.email || "",
        },
      };
      setQuotation(updatedQuotation);
    }
  };

  // Helper function to transform quotation data (copied from QuotationTemplate)
  const transformQuotationData = (quotation, companyDetails, selectedCustomer) => {
    // Get company info
    const logoUrl = companyDetails?.quotation_logo_url;
    const loginLogoUrl = companyDetails?.login_logo_url;

    const company = companyDetails ? {
      name: companyDetails.company_name || "",
      address: companyDetails.address || "",
      phone: companyDetails.phone_number || "",
      email: companyDetails.email || "",
      logo: logoUrl || Images.smLogo,
    } : {
      name: "",
      address: "",
      phone: "",
      email: "",
      logo: Images.smLogo,
    };

    // Transform services to items
    const services = quotation?.services || [];
    const items = services.map(service => ({
      item: service.service_name || "Service",
      qty: service.quantity || 0,
      rate: service.unit_price || service.price || service.unit_rate || 0,
      key_features: service.key_features || [],
    }));

    // Get charges from quotation
    const charges = {
      shipping: quotation?.shipping || 0,
      gstPercent: quotation?.gst_percentage || 0,
    };

    // Calculate totals
    const subtotal = quotation?.subtotal || items.reduce(
      (acc, item) => acc + item.qty * item.rate,
      0
    );
    const gstAmount = quotation?.gst_amount || (subtotal * charges.gstPercent) / 100;
    const total = quotation?.grand_total || subtotal + charges.shipping + gstAmount;

    // Generate quotation number and date
    const quotationNo = quotation?.quotation_number || `QUO${Date.now().toString().slice(-6)}`;
    const date = quotation?.date || new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return {
      company,
      quotationInfo: {
        date,
        quotationNo,
      },
      quotationBy: companyDetails ? {
        name: companyDetails.company_name || "",
        address: companyDetails.address || "",
        phone: companyDetails.phone_number || "",
        email: companyDetails.email || "",
      } : (quotation?.quotation_by || {
        name: "",
        address: "",
        phone: "",
        email: "",
      }),
      quotationTo: selectedCustomer ? {
        name: selectedCustomer.customer_name || "",
        address: selectedCustomer.address || "",
        phone: selectedCustomer.phone_number || "",
        email: selectedCustomer.email || "",
      } : (quotation?.quotation_to || {
        name: "",
        address: "",
        phone: "",
        email: "",
      }),
      items: items,
      charges,
      footer: {
        logo: loginLogoUrl || Images.fullLogo,
        website: companyDetails?.website || "",
      },
      subtotal,
      gstAmount,
      total,
    };
  };

  // Get the transformed data for the current quotation
  const data = quotation && companyDetails ? 
    transformQuotationData(quotation, companyDetails, selectedCustomer) : null;
  
  // Check if services exist
  const hasServices = data?.items && data.items.length > 0 && 
    data.items.some(item => item.item && item.qty > 0);
  const showFullContent = hasServices && selectedCustomer !== null;

  return (
    <div className="w-3/5 h-screen flex flex-col bg-gray-100">

      {/* Top Bar */}
      <div className="bg-[#F1F1FA] rounded-xl px-4 py-2 flex justify-between items-center">
        <div>
          <h2 className="text-lg text-textPrimary font-bold">Preview</h2>
          <p className="text-base font-normal text-textSecondary">
            Quotation Preview
          </p>
        </div>

        <div className="flex items-right gap-4">
          <TemplateDropdown
            onCustomerSelect={handleCustomerSelect}
            selectedCustomer={selectedCustomer}
          />

          {/* Pass all required props to ShareButton */}
          {data && (
            <ShareButton 
              selectedCustomer={selectedCustomer}
              company={data.company}
              quotationInfo={data.quotationInfo}
              quotationBy={data.quotationBy}
              quotationTo={data.quotationTo}
              items={data.items}
              charges={data.charges}
              footer={data.footer}
              subtotal={data.subtotal}
              gstAmount={data.gstAmount}
              total={data.total}
              showFullContent={showFullContent}
              quotationData={quotation}
              companyDetails={companyDetails}
              quotation={quotation}
            />
          )}

          <button className="p-1 bg-[#F7BA1E] text-primary rounded-full shrink-0">
            <FileText size={14} className="w-5 h-5" />
          </button>

          <button className="p-1 bg-primary text-white rounded-full shrink-0">
            <img src={Images.starIcon} alt="star" className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Template Area */}
      <div
        id="quotation-preview"
        className="flex-1 mt-2 overflow-y-auto hide-scrollbar bg-white rounded-xl"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : quotation ? (
          <QuotationTemplate
            quotation={quotation}
            companyDetails={companyDetails}
            loading={loading}
            selectedCustomer={selectedCustomer}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FileText size={50} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">No Quotation Generated</p>
            <p className="text-sm mt-1">
              Ask AI to generate a quotation to preview it here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default QuotationPanel;