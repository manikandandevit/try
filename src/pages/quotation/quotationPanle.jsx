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

          <ShareButton selectedCustomer={selectedCustomer} />

           <button className="p-1 bg-[#F7BA1E] text-primary rounded-full">
            <FileText size={14} className="w-5 h-5"/>
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
        <QuotationTemplate 
          quotation={quotation} 
          companyDetails={companyDetails}
          loading={loading}
          selectedCustomer={selectedCustomer}
        />
      </div>

    </div>
  );
};

export default QuotationPanel;
