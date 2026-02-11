import { SnackbarProvider, closeSnackbar } from "notistack";
import { IoClose } from "react-icons/io5";

const SnackbarProviderWrapper = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={2000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      action={(snackbarId) => (
        <button
          onClick={() => closeSnackbar(snackbarId)}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <IoClose size={18} />
        </button>
      )}
    >
      {children}
    </SnackbarProvider>
  );
};

export default SnackbarProviderWrapper;
