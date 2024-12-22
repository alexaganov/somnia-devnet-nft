export const getErrorMessage = (error: unknown): string | null => {
  if (typeof error === "string") {
    return error;
  }

  if (
    !!error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return null;
};
export const getErrorShortMessage = (error: unknown): string | null => {
  if (
    !!error &&
    typeof error === "object" &&
    "shortMessage" in error &&
    typeof error.shortMessage === "string"
  ) {
    return error.shortMessage;
  }

  return null;
};
export const getContractErrorMessage = (error: unknown) => {
  return (
    getErrorShortMessage(error) ||
    getErrorMessage(error) ||
    "An unknown error occurred. Please try again later."
  );
};
