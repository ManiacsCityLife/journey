// Shared back button. The padding gives a ~48px touch target on mobile,
// which the older single-character buttons (← / ‹) did not.

interface Props {
  onClick: () => void;
  /** Override text colour (e.g. on dark headers) */
  className?: string;
  label?: string;
}

export default function BackButton({ onClick, className = 'text-slate-500', label = 'Back' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`p-3 -ml-3 active:opacity-60 transition-opacity ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
