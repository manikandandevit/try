import * as Dialog from "@radix-ui/react-dialog";

const ConfirmDeleteModal = ({
  open,
  onOpenChange,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item?",
  onConfirm,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />

        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50
                     w-full max-w-sm mx-4
                     -translate-x-1/2 -translate-y-1/2
                     bg-white rounded-lg p-4 sm:p-6 shadow-lg"
        >
          <Dialog.Title className="text-base sm:text-lg font-semibold mb-2">
            {title}
          </Dialog.Title>

          <Dialog.Description className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5">
            {description}
          </Dialog.Description>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded border-borderColor text-xs sm:text-sm hover:bg-gray-50 transition"
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-red-600 text-white text-xs sm:text-sm hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDeleteModal;
