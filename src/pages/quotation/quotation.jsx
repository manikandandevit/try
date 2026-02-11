import ConversationPanel from "./conversation";
import QuotationPanel from "./quotationPanle";


const Quotation = () => {
    return (
        <div className="flex w-full h-screen gap-3">
            <ConversationPanel />
            <QuotationPanel />
        </div>
    )
};

export default Quotation;