import { CheckCheck, Send } from "lucide-react";
import { Images } from "../../common/assets";

/* ------------------ ChatMessage component ------------------ */
const ChatMessage = ({ message }) => {
    const isOutgoing = message.type === "outgoing";

    return (
        <div
            className={`flex items-end gap-2 max-w-[90%] ${isOutgoing ? "ml-auto flex-row-reverse" : ""
                }`}
        >
            {/* Avatar */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                {isOutgoing && message.status === "read" && (
                    <span className="absolute -top-6 left-2 text-primary">
                        <CheckCheck size={18} />
                    </span>
                )}

                <img
                    src={message.avatar}
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
                    {message.text}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                    {message.time}
                </div>
            </div>
        </div>
    );
};

const ConversationPanel = () => {

    const messages = [
        {
            id: 1,
            type: "incoming",
            avatar: Images.smLogo,
            text: "Ah, error messages! Let’s make this friendlier while keeping it actionable. Key principles for this context: Ah, error messages! Let’s make this friendlier while keeping it actionable.",
            time: "10:30 AM",
        },
        {
            id: 2,
            type: "outgoing",
            avatar: Images.adminProfile,
            text: "How to rewrite this error message for a voice assistant? Original: 'Error. Try again.’",
            time: "10:31 AM",
            status: "read",
        },
        {
            id: 1,
            type: "incoming",
            avatar: Images.smLogo,
            text: "How to rewrite this error message for a voice assistant? Original: 'Error. Try again.’",
            time: "10:31 AM",
            status: "read",
        },
        {
            id: 1,
            type: "incoming",
            avatar: Images.smLogo,
            text: "How to rewrite this error message for a voice assistant? Original: 'Error. Try again.’",
            time: "10:31 AM",
            status: "read",
        },
        {
            id: 2,
            type: "outgoing",
            avatar: Images.adminProfile,
            text: "How to rewrite this error message for a voice assistant? Original: 'Error. Try again.’",
            time: "10:31 AM",
            status: "read",
        },
    ];

    return (
        <div className="w-2/4 h-screen flex flex-col rounded-lg bg-white overflow-hidden">

            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 font-semibold">
                Conversation
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-[#f0f0fa] hide-scrollbar">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#f0f0fa]">
                <div className="bg-white rounded-xl w-full p-4 flex flex-col justify-between">
                    <textarea
                        className="w-full resize-none bg-transparent outline-none text-sm text-textPrimary"
                        placeholder="Type your message here..."
                        rows={3}
                    />

                    <div className="flex justify-between items-center">
                        <button>
                            <img src={Images.star} alt="star" className="w-6 h-6" />
                        </button>

                        <button className="p-2 rounded-full bg-primary text-white">
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ConversationPanel;
