const LogoutPopup = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl p-4 sm:p-6 w-full max-w-sm text-center rounded-lg">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
          Are you sure want to logout?
        </h3>

        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 border border-borderColor text-primary rounded hover:bg-gray-50 transition text-sm sm:text-base"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 transition text-sm sm:text-base"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;
