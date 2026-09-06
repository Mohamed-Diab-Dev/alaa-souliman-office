export function Emblem({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="#0d3b2e" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#c9a227" strokeWidth="2" />
      <path
        d="M32 14l3.2 9.6H45l-7.6 5.6 2.9 9.4L32 33.8l-8.3 4.8 2.9-9.4L19 23.6h9.8z"
        fill="#e8d48b"
      />
    </svg>
  );
}
