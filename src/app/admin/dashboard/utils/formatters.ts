export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const generateAppId = (serviceType: string, index: number) => {
  const prefix = serviceType === "dsc" ? "DSC" : serviceType === "token" ? "TKN" : "AST";
  return `${prefix}${String(index).padStart(3, "0")}`;
};
