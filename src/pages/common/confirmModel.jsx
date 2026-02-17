const ConfirmPopup = ({ show, title, onConfirm, onCancel, loading = false }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm text-center">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
          {title}
        </h3>

        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md border border-borderColor text-primary text-sm sm:text-base hover:bg-gray-50 transition
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white flex items-center justify-center gap-2 text-sm sm:text-base transition
              ${loading ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90"}
            `}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span className="hidden sm:inline">Processing...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
