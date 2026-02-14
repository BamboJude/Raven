interface RavenIconProps {
  className?: string;
  size?: number;
}

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
      {/* Chat bubble background */}
      <path
        d="M20 15C20 10.0294 24.0294 6 29 6H71C75.9706 6 80 10.0294 80 15V55C80 59.9706 75.9706 64 71 64H45L30 75V64H29C24.0294 64 20 59.9706 20 55V15Z"
        className="fill-current"
      />

      {/* Raven bird silhouette */}
      <g transform="translate(35, 22)">
        {/* Body */}
        <ellipse cx="15" cy="20" rx="10" ry="12" className="fill-white opacity-95" />

        {/* Head */}
        <circle cx="15" cy="10" r="7" className="fill-white opacity-95" />

        {/* Beak */}
        <path
          d="M22 10 L28 10 L25 12 Z"
          className="fill-white opacity-95"
        />

        {/* Eye */}
        <circle cx="18" cy="9" r="1.5" className="fill-current opacity-80" />

        {/* Wing */}
        <path
          d="M10 18 Q5 20 8 26 L12 24 Z"
          className="fill-white opacity-90"
        />

        {/* Tail feathers */}
        <path
          d="M15 30 L12 38 L15 36 L18 38 L15 30 Z"
          className="fill-white opacity-90"
        />
      </g>
    </svg>
  );
}

// Simplified version for small sizes
export function RavenIconSimple({ className = "", size = 32 }: RavenIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Chat bubble */}
      <path
        d="M20 15C20 10.0294 24.0294 6 29 6H71C75.9706 6 80 10.0294 80 15V55C80 59.9706 75.9706 64 71 64H45L30 75V64H29C24.0294 64 20 59.9706 20 55V15Z"
        className="fill-current"
      />

      {/* Stylized "R" with bird accent */}
      <text
        x="50"
        y="50"
        fontSize="36"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-white font-sans"
      >
        R
      </text>

      {/* Small bird accent on top of R */}
      <path
        d="M58 28 L60 26 L62 28 L60 30 Z"
        className="fill-white opacity-90"
      />
    </svg>
  );
}

// Logo variant with text
export function RavenLogo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RavenIconSimple size={40} className="text-current" />
      {showText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
          Raven
        </span>
      )}
    </div>
  );
}
