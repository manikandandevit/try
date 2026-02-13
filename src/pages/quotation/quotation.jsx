import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ConversationPanel from "./conversation";
import QuotationPanel from "./quotationPanle";
import { getQuotation, getQuotationById, getConversationHistory, syncQuotation, getLastQuotationId } from "../../API/quotationApi";

const Quotation = () => {
    const { id: quotationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [quotation, setQuotationState] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // When quotation loaded by ID has quotation_number, it is PERMANENT - chat/sync must never change it
    const setQuotation = useCallback((newQuotationOrUpdater) => {
        setQuotationState((prev) => {
            const newQuotation = typeof newQuotationOrUpdater === "function"
                ? newQuotationOrUpdater(prev)
                : newQuotationOrUpdater;
            if (!newQuotation) return prev;
            // DB-loaded quotation (from customer view): preserve id, quotation_number, quotation_to
            if (prev?.id && prev?.quotation_number) {
                return {
                    ...newQuotation,
                    id: prev.id,
                    quotation_number: prev.quotation_number,
                    quotation_to: newQuotation.quotation_to || prev.quotation_to,
                };
            }
            return newQuotation;
        });
    }, []);

    // Fetch initial data: by id if in URL, else check last quotation and redirect or show empty
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // When no quotationId: new user -> empty; existing user -> redirect to last quotation
                if (!quotationId) {
                    const lastRes = await getLastQuotationId();
                    const lastId = lastRes?.success && lastRes?.data?.last_quotation_id;
                    if (lastId) {
                        navigate(`/quotation/${lastId}`, { replace: true });
                        return;
                    }
                    // New user: show empty - use session quotation (will be empty)
                }

                const quotationPromise = quotationId
                    ? getQuotationById(quotationId)
                    : getQuotation();
                const [quotationRes, historyRes] = await Promise.all([
                    quotationPromise,
                    getConversationHistory(quotationId || undefined)
                ]);

                if (quotationRes.success) {
                    const q = quotationRes.data?.quotation || quotationRes.data;
                    setQuotationState(q);
                    if (quotationId && q) {
                        try {
                            await syncQuotation(q);
                        } catch (e) {
                            console.warn("Sync quotation on load failed:", e);
                        }
                    }
                }

                if (historyRes.success) {
                    const msgs = historyRes.data?.messages ?? historyRes.data ?? [];
                    setConversationHistory(Array.isArray(msgs) ? msgs : []);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [quotationId, navigate]);

    // Auto-save quotation to DB when it changes (debounced)
    const saveTimeoutRef = useRef(null);
    const quotationRef = useRef(quotation);
    quotationRef.current = quotation;
    useEffect(() => {
        if (!quotation?.id) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            syncQuotation(quotationRef.current).catch((e) => console.warn("Auto-save quotation failed:", e));
        }, 1500);
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [quotation]);

    // Save on tab close / switch (beforeunload, visibilitychange)
    useEffect(() => {
        const flushSave = () => {
            const q = quotationRef.current;
            if (q?.id) syncQuotation(q).catch(() => {});
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") flushSave();
        };
        const handleBeforeUnload = () => {
            flushSave();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    return (
        <div className="flex w-full h-auto gap-3">
            <ConversationPanel 
                conversationHistory={conversationHistory}
                setConversationHistory={setConversationHistory}
                setQuotation={setQuotation}
                quotationId={quotationId || null}
            />
            <QuotationPanel 
                quotation={quotation}
                loading={loading}
                setQuotation={setQuotation}
                initialCustomer={location.state?.customer}
                fromCustomerView={location.state?.fromCustomerView}
            />
        </div>
    )
};

export default Quotation;