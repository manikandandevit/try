import { useState, useEffect } from "react";
import ConversationPanel from "./conversation";
import QuotationPanel from "./quotationPanle";
import { getQuotation, getConversationHistory } from "../../API/quotationApi";

const Quotation = () => {
    const [quotation, setQuotation] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [quotationRes, historyRes] = await Promise.all([
                    getQuotation(),
                    getConversationHistory()
                ]);

                if (quotationRes.success) {
                    setQuotation(quotationRes.data?.quotation || quotationRes.data);
                }

                if (historyRes.success) {
                    setConversationHistory(historyRes.data?.messages || historyRes.data || []);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    return (
        <div className="flex w-full h-screen gap-3">
            <ConversationPanel 
                conversationHistory={conversationHistory}
                setConversationHistory={setConversationHistory}
                setQuotation={setQuotation}
            />
            <QuotationPanel 
                quotation={quotation}
                loading={loading}
                setQuotation={setQuotation}
            />
        </div>
    )
};

export default Quotation;