// Skeleton loader for quotation preview
export const QuotationSkeleton = () => {
    return (
        <div className="animate-pulse space-y-6 p-4">
            {/* Header Skeleton */}
            <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Company Info Skeleton */}
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>

            {/* Customer Info Skeleton */}
            <div className="space-y-2 border-t pt-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Table Skeleton */}
            <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded"></div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                        <div className="h-16 bg-gray-200 rounded flex-1"></div>
                        <div className="h-16 bg-gray-200 rounded w-24"></div>
                        <div className="h-16 bg-gray-200 rounded w-24"></div>
                        <div className="h-16 bg-gray-200 rounded w-24"></div>
                    </div>
                ))}
            </div>

            {/* Totals Skeleton */}
            <div className="space-y-2 border-t pt-4">
                <div className="flex justify-end">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex justify-end">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex justify-end">
                    <div className="h-6 bg-gray-300 rounded w-40"></div>
                </div>
            </div>
        </div>
    );
};

// Generic skeleton loader
export const SkeletonLoader = ({ className = "", count = 1, height = "h-4" }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-gray-200 rounded ${height} ${className}`}
                    style={{ animationDelay: `${i * 100}ms` }}
                ></div>
            ))}
        </>
    );
};

// Card skeleton loader
export const CardSkeleton = () => {
    return (
        <div className="animate-pulse bg-white rounded-lg border border-lineColor/30 p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
    );
};

export default SkeletonLoader;

