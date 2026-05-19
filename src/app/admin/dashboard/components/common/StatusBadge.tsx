import { STATUS_COLORS, PAYMENT_COLORS } from "../../utils/constants";
import { ApplicationStatus, PaymentStatus } from "../../types";

interface StatusBadgeProps {
  status: ApplicationStatus | PaymentStatus;
  type?: "application" | "payment";
}

export function StatusBadge({ status, type = "application" }: StatusBadgeProps) {
  const isPayment = type === "payment";
  const colors = isPayment 
    ? PAYMENT_COLORS[status as PaymentStatus] 
    : STATUS_COLORS[status as ApplicationStatus];
    
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide border ${
        isPayment 
          ? `bg-transparent border-transparent ${colors}` 
          : colors
      }`}
    >
      {isPayment && (
        <span className={`mr-1.5 flex h-2 w-2 rounded-full ${status === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      )}
      {!isPayment && (
        <span className="mr-1.5 flex h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}
