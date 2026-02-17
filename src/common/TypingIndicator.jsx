import { Images } from "./assets";

const TypingIndicator = () => {
    return (
        <div className="flex items-end gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
            {/* Avatar */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md border-2 border-white">
                    <img
                        src={Images.smLogo}
                        alt="AI avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Typing Animation */}
            <div className="bg-white text-textPrimary border border-lineColor/30 rounded-2xl shadow-md p-3 sm:p-4">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base text-textSecondary font-medium">AI is typing</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;

