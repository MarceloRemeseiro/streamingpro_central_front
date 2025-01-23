import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder: string;
  protocol?: 'rtmp' | 'srt';
}

const Input = ({ label, placeholder, value, onChange, type = 'text', protocol = 'rtmp', ...props }: InputProps) => {
  const baseInputClasses = "w-full px-3 py-2 border border-border dark:border-border-dark rounded-md bg-info-background dark:bg-info-background-dark text-text-dark";
  const focusClasses = protocol === 'rtmp' 
    ? "focus:ring-2 focus:ring-protocol-rtmp-border dark:focus:ring-protocol-rtmp-border-dark"
    : "focus:ring-2 focus:ring-protocol-srt-border dark:focus:ring-protocol-srt-border-dark";

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
        {label}
      </label>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className={`${baseInputClasses} ${focusClasses}`}
        {...props} 
      />
    </div>
  );
};

export default Input;