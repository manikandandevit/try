/* ---------------- SELECT STYLES ---------------- */
export const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "40px",
    height: "40px",
    borderRadius: "6px",
  }),

  valueContainer: (base) => ({
    ...base,
    height: "40px",
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
  }),

  singleValue: (base) => ({
    ...base,
    lineHeight: "40px",
  }),

  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),

  indicatorsContainer: (base) => ({
    ...base,
    height: "40px",
  }),

  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};