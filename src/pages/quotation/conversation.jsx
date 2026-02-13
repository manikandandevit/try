import { useState, useRef, useEffect } from "react";
import { CheckCheck, Send, Undo, Redo } from "lucide-react";
import { Images } from "../../common/assets";
import { sendChatMessage, syncConversationHistory } from "../../API/quotationApi";

/* ------------------ ChatMessage component ------------------ */
const ChatMessage = ({ message }) => {
    const isOutgoing = message.role === "user";

    // Format time from timestamp or use provided time
    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timestamp;
        }
    };

    return (
        <div
            className={`flex items-end gap-2 max-w-[90%] ${isOutgoing ? "ml-auto flex-row-reverse" : ""
                }`}
        >
            {/* Avatar */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                {isOutgoing && (
                    <span className="absolute -top-6 left-2 text-primary">
                        <CheckCheck size={18} />
                    </span>
                )}

                <img
                    src={isOutgoing ? Images.adminProfile : Images.smLogo}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                />
            </div>

            {/* Message */}
            <div className={isOutgoing ? "text-right" : ""}>
                <div
                    className={`p-3 rounded-lg shadow text-[#636576] ${isOutgoing ? "bg-[#e3efff]" : "bg-white"
                        }`}
                >
                    {message.content || message.text}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                    {formatTime(message.timestamp) || message.time || ""}
                </div>
            </div>
        </div>
    );
};

const ConversationPanel = ({ conversationHistory, setConversationHistory, setQuotation, quotationId, onUndo, onRedo, canUndo, canRedo }) => {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationHistory]);

    // Convert backend format to frontend format for display
    const formatMessages = (history) => {
        if (!history || !Array.isArray(history)) return [];
        return history.map((msg, index) => ({
            id: index,
            role: msg.role || (msg.type === "outgoing" ? "user" : "assistant"),
            content: msg.content || msg.text || "",
            timestamp: msg.timestamp || new Date().toISOString(),
            time: msg.time || ""
        }));
    };

    const handleSend = async () => {
        if (!message.trim() || sending) return;

        const userMessage = message.trim();
        setMessage("");
        setSending(true);

        // Add user message to conversation immediately
        const userMsg = {
            role: "user",
            content: userMessage,
            timestamp: new Date().toISOString()
        };
        const updatedHistory = [...conversationHistory, userMsg];
        setConversationHistory(updatedHistory);

        try {
            const response = await sendChatMessage(userMessage, quotationId || undefined);

            if (response.success) {
                const assistantMsg = {
                    role: "assistant",
                    content: response.data?.response || response.data?.message || "Response received",
                    timestamp: new Date().toISOString()
                };
                const finalHistory = [...updatedHistory, assistantMsg];
                setConversationHistory(finalHistory);

                if (response.data?.quotation) {
                    setQuotation(response.data.quotation);
                }

                await syncConversationHistory(
                    finalHistory.map(msg => ({ role: msg.role, content: msg.content })),
                    quotationId || undefined
                );
            } else {
                // Show error message
                const errorMsg = {
                    role: "assistant",
                    content: `Error: ${response.message || "Failed to send message"}`,
                    timestamp: new Date().toISOString()
                };
                setConversationHistory([...updatedHistory, errorMsg]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg = {
                role: "assistant",
                content: "Error: Failed to send message. Please try again.",
                timestamp: new Date().toISOString()
            };
            setConversationHistory([...updatedHistory, errorMsg]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formattedMessages = formatMessages(conversationHistory);

    return (
        <div className="w-2/4 h-screen flex flex-col rounded-lg bg-white overflow-hidden">

            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 font-semibold">
                Conversation
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-[#f0f0fa] hide-scrollbar">
                {formattedMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        Start a conversation to create a quotation
                    </div>
                ) : (
                    formattedMessages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#f0f0fa]">
                <div className="bg-white rounded-xl w-full p-4 flex flex-col justify-between">
                    <textarea
                        ref={textareaRef}
                        className="w-full resize-none bg-transparent outline-none text-sm text-textPrimary"
                        placeholder="Type your message here..."
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                    />

                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={onUndo}
                                disabled={!canUndo}
                                className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Undo"
                            >
                                <Undo size={16} />
                            </button>
                            <button
                                onClick={onRedo}
                                disabled={!canRedo}
                                className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Redo"
                            >
                                <Redo size={16} />
                            </button>
                        </div>

                        <button 
                            className="p-2 rounded-full bg-primary text-white disabled:opacity-50"
                            onClick={handleSend}
                            disabled={sending || !message.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ConversationPanel;
