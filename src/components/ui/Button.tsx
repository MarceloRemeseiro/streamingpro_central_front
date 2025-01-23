import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'danger' | 'protocol';
  protocol?: 'rtmp' | 'srt';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const Button = ({ 
  variant = 'primary', 
  protocol = 'rtmp',
  isLoading = false, 
  loadingText,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props 
}: ButtonProps) => {
  const baseClasses = "inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary dark:bg-primary-dark text-text-light hover:bg-primary-hover dark:hover:bg-primary-hover-dark focus-visible:ring-primary dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "border border-border dark:border-border-dark bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark hover:bg-info-background dark:hover:bg-info-background-dark focus-visible:ring-primary dark:focus-visible:ring-primary-dark",
    danger: "bg-error dark:bg-error-dark text-text-light hover:bg-error-hover dark:hover:bg-error-hover-dark focus-visible:ring-error dark:focus-visible:ring-error-dark",
    protocol: protocol === 'rtmp' 
      ? "text-text-light bg-protocol-rtmp-background dark:bg-protocol-rtmp-background-dark hover:bg-protocol-rtmp dark:hover:bg-protocol-rtmp-dark disabled:opacity-50"
      : "text-text-light bg-protocol-srt-background dark:bg-protocol-srt-background-dark hover:bg-protocol-srt dark:hover:bg-protocol-srt-dark disabled:opacity-50"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (loadingText || 'Cargando...') : children}
    </button>
  );
};

export default Button; 