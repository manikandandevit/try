import { Sparkles } from "lucide-react";

// Linear progress bar for long operations
export const LinearProgress = ({ progress = 0, label = "Processing..." }) => {
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-textPrimary">{label}</span>
                <span className="text-sm text-textSecondary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-primary to-primary/90 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
            </div>
        </div>
    );
};

// Circular progress indicator
export const CircularProgress = ({ size = 40, strokeWidth = 4, progress = 0 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                className="transform -rotate-90"
                width={size}
                height={size}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-300"
                />
            </svg>
            <span className="absolute text-xs font-medium text-primary">
                {Math.round(progress)}%
            </span>
        </div>
    );
};

// Enhanced operation progress (for AI operations)
export const OperationProgress = ({ 
    isActive = false, 
    message = "Processing...", 
    showProgress = false,
    progress = 0 
}) => {
    if (!isActive) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
                <div className="flex flex-col items-center space-y-4">
                    {/* Animated Icon */}
                    <div className="relative">
                        <Sparkles 
                            size={48} 
                            className="text-primary animate-pulse" 
                        />
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    </div>

                    {/* Message */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-textPrimary mb-2">
                            {message}
                        </h3>
                        {showProgress && (
                            <div className="mt-4">
                                <LinearProgress progress={progress} label="" />
                            </div>
                        )}
                    </div>

                    {/* Loading Animation */}
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Inline progress indicator (for buttons/actions)
export const InlineProgress = ({ isActive = false, size = 16 }) => {
    if (!isActive) return null;

    return (
        <div className="inline-flex items-center gap-2">
            <div className="relative">
                <div className={`w-${size} h-${size} border-2 border-primary border-t-transparent rounded-full animate-spin`}></div>
            </div>
            <span className="text-sm text-primary font-medium">Processing...</span>
        </div>
    );
};

export default OperationProgress;

