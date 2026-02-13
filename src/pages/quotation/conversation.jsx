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
            className={`flex items-end gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${isOutgoing ? "ml-auto flex-row-reverse" : ""
                }`}
        >
            {/* Avatar */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                {isOutgoing && (
                    <span className="absolute -top-5 sm:-top-6 left-1 sm:left-2 text-primary">
                        <CheckCheck size={16} className="sm:w-5 sm:h-5 drop-shadow-sm" />
                    </span>
                )}

                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md border-2 ${isOutgoing ? 'border-primary/20' : 'border-white'}`}>
                    <img
                        src={isOutgoing ? Images.adminProfile : Images.smLogo}
                        alt="avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Message */}
            <div className={isOutgoing ? "text-right" : ""}>
                <div
                    className={`p-3 sm:p-4 rounded-2xl shadow-md text-sm sm:text-base break-words leading-relaxed ${isOutgoing 
                        ? "bg-gradient-to-br from-primary/10 to-primary/5 text-textPrimary border border-primary/20" 
                        : "bg-white text-textPrimary border border-lineColor/30"
                        }`}
                >
                    {message.content || message.text}
                </div>

                <div className="text-[10px] sm:text-xs text-textSecondary mt-1.5 sm:mt-2 font-medium px-1">
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
        <div className="w-full md:w-2/5 h-screen flex flex-col rounded-lg bg-white overflow-hidden shadow-lg border border-lineColor/30">

            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/90 text-white px-4 sm:px-5 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-md">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Conversation</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white hide-scrollbar">
                {formattedMessages.length === 0 ? (
                    <div className="text-center text-textSecondary mt-12 px-4">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-lineColor/30 inline-block">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-textPrimary mb-1">Start a conversation</p>
                            <p className="text-xs text-textSecondary">Ask AI to create your quotation</p>
                        </div>
                    </div>
                ) : (
                    formattedMessages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-lineColor/30 shadow-lg">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl w-full p-3 sm:p-4 flex flex-col justify-between border border-lineColor/30 shadow-sm">
                    <textarea
                        ref={textareaRef}
                        className="w-full resize-none bg-transparent outline-none text-sm sm:text-base text-textPrimary placeholder:text-textSecondary/60 focus:ring-0"
                        placeholder="Type your message here..."
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                    />

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-lineColor/30">
                        <div className="flex gap-2">
                            <button
                                onClick={onUndo}
                                disabled={!canUndo}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
                                title="Undo"
                            >
                                <Undo size={16} />
                            </button>
                            <button
                                onClick={onRedo}
                                disabled={!canRedo}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
                                title="Redo"
                            >
                                <Redo size={16} />
                            </button>
                        </div>

                        <button 
                            className="p-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white disabled:opacity-50 shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                            onClick={handleSend}
                            disabled={sending || !message.trim()}
                        >
                            <Send size={16} />
                            <span className="text-sm font-medium hidden sm:inline">Send</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ConversationPanel;
