import { Images } from "../../common/assets";
import QuotationTemplate from "./quotationTemplate";
import TemplateDropdown from "./searchCustomer";
import ShareButton from "./share";


const QuotationPanel = () => {
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

        <div className="flex items-right gap-6">
          {/* <select className="rounded-full px-7 py-1"> */}
            <TemplateDropdown />
         

          <ShareButton/>

          <button className="p-1 bg-primary text-white rounded-full shrink-0">
            <img src={Images.starIcon} alt="star" className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Template Area */}
      <div className="flex-1 mt-2 overflow-y-auto">
        <QuotationTemplate />
      </div>

    </div>
  );
};

export default QuotationPanel;
