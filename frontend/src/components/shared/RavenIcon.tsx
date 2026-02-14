interface RavenIconProps {
  className?: string;
  size?: number;
}

// Main Raven logo icon - chat bubble with three dots
export function RavenIcon({ className = "", size = 40 }: RavenIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Chat bubble outline */}
      <path
        d="M20 20C20 14.4772 24.4772 10 30 10H70C75.5228 10 80 14.4772 80 20V55C80 60.5228 75.5228 65 70 65H45L30 80V65H30C24.4772 65 20 60.5228 20 55V20Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Three dots */}
      <circle cx="35" cy="37.5" r="5" fill="currentColor" />
      <circle cx="50" cy="37.5" r="5" fill="currentColor" />
      <circle cx="65" cy="37.5" r="5" fill="currentColor" />
    </svg>
  );
}

// Simplified version (same design, just cleaner for small sizes)
export function RavenIconSimple({ className = "", size = 32 }: RavenIconProps) {
  return <RavenIcon className={className} size={size} />;
}

// Logo with text
export function RavenLogo({
  className = "",
  showText = true,
  iconClassName = "text-primary-500"
}: {
  className?: string;
  showText?: boolean;
  iconClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <RavenIcon size={48} className={iconClassName} />
      {showText && (
        <span className="text-2xl font-bold text-gray-900">
          Raven
        </span>
      )}
    </div>
  );
}
