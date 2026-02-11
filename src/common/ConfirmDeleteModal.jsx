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
                     w-full max-w-sm
                     -translate-x-1/2 -translate-y-1/2
                     bg-white rounded-lg p-6 shadow-lg"
        >
          <Dialog.Title className="text-lg font-semibold mb-2">
            {title}
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 mb-5">
            {description}
          </Dialog.Description>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border rounded border-borderColor"
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded bg-red-600 text-white"
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
