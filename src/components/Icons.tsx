interface IconProps {
  className?: string;
  size?: number;
}

export function FolderIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      aria-hidden="true" 
      focusable="false" 
      className={`octicon octicon-file-directory-fill ${className}`}
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ verticalAlign: 'text-bottom' }}
    >
      <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"></path>
    </svg>
  );
}

// Placeholder for other icons - we'll add them as you provide them
export function FileIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      aria-hidden="true" 
      focusable="false" 
      className={`octicon octicon-file ${className}`}
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ verticalAlign: 'text-bottom' }}
    >
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path>
    </svg>
  );
}

export function ChevronRightIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      aria-hidden="true" 
      focusable="false" 
      className={`octicon octicon-chevron-right ${className}`}
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ verticalAlign: 'text-bottom' }}
    >
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
  );
}

export function ChevronDownIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      aria-hidden="true" 
      focusable="false" 
      className={`octicon octicon-chevron-down ${className}`}
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ verticalAlign: 'text-bottom' }}
    >
      <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
    </svg>
  );
}