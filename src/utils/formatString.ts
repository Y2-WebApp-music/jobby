export const formatPhoneNumber = (value: string): string => {
  return value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
};
