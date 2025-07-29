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

export function PlayIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      aria-hidden="true" 
      focusable="false" 
      className={`octicon octicon-play ${className}`}
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ verticalAlign: 'text-bottom' }}
    >
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z"></path>
    </svg>
  );
}

export function TerminalIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      aria-hidden="true" 
      focusable="false" 
      className={`octicon octicon-terminal ${className}`}
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ verticalAlign: 'text-bottom' }}
    >
      <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25ZM7.25 8a.75.75 0 0 1-.22.53l-2.25 2.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L5.44 8 3.72 6.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.25 2.25c.141.14.22.331.22.53Zm1.5 1.5h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5Z"></path>
    </svg>
  );
}

export function StopIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      aria-hidden="true" 
      focusable="false" 
      className={`octicon octicon-square-fill ${className}`}
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      fill="currentColor" 
      style={{ verticalAlign: 'text-bottom' }}
    >
      <path d="M2.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25H2.75ZM13.25 1A1.75 1.75 0 0 1 15 2.75v10.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25V2.75A1.75 1.75 0 0 1 2.75 1h10.5Z"></path>
    </svg>
  );
}