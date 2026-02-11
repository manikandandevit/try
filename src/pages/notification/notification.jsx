import { Bell, BellDot, X } from "lucide-react";

const Notification = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white z-50 flex flex-col animate-slideIn">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-lineColor">
          <h2 className="text-lg font-semibold text-gray-800">
            Notifications
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Notification Card */}
          <div className="border border-lineColor rounded-lg p-4 flex gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100">
              <Bell className="w-5 h-5 text-green-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                Action Required:
              </p>
              <p className="text-sm font-medium text-gray-700">
                Service / Warranty Expiring Soon
              </p>
              <p className="text-xs text-gray-500 mt-1">
                The service or warranty period for this asset ends in 90 days.
              </p>
            </div>

            <span className="text-xs text-gray-400 whitespace-nowrap">
              9 min ago
            </span>
          </div>

          {/* Duplicate card for demo */}
          <div className="border border-lineColor rounded-lg p-4 flex gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100">
              <Bell className="w-5 h-5 text-green-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                Action Required:
              </p>
              <p className="text-sm font-medium text-gray-700">
                Service / Warranty Expiring Soon
              </p>
              <p className="text-xs text-gray-500 mt-1">
                The service or warranty period for this asset ends in 90 days.
              </p>
            </div>

            <span className="text-xs text-gray-400 whitespace-nowrap">
              1 week ago
            </span>
          </div>

        </div>
      </div>
    </>
  );
};

export default Notification;
