/**
 * Avatar component
 * Displays either an image or initials-based avatar
 */

interface AvatarProps {
  src?: string | null;
  name: string; // Email or name to generate initials from
  size?: number; // Size in pixels
  className?: string;
}

export function Avatar({ src, name, size = 40, className = "" }: AvatarProps) {
  // Get initials from email (first letter before @)
  const getInitials = (text: string): string => {
    if (!text) return "?";

    // If it's an email, use the part before @
    const emailMatch = text.match(/^([^@]+)/);
    const displayName = emailMatch ? emailMatch[1] : text;

    // Get first letter, uppercase
    return displayName.charAt(0).toUpperCase();
  };

  // Generate a consistent color based on the name
  const getColorFromName = (text: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    // Simple hash function to get consistent color for same name
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback to initials
  return (
    <div
      className={`${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
