const LogoutPopup = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white shadow-xl p-6 w-80 text-center">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Are you sure want to logout?
        </h3>

        <div className="flex justify-between gap-4">
          <button
            onClick={onCancel}
            className="w-full py-2 border border-borderColor text-primary"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2 bg-primary text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;
