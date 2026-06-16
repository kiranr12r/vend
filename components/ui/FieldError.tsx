interface Props {
  message?: string;
}

export default function FieldError({ message }: Props) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      {message}
    </p>
  );
}