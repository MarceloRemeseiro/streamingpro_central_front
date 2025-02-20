import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  protocol?: 'rtmp' | 'srt';
}

export default function Textarea({ label, ...props }: TextareaProps) {
    const baseTextareaClasses = "w-full px-3 py-2 border border-border dark:border-border-dark rounded-md bg-info-background dark:bg-info-background-dark text-text-dark";
    
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className={`${baseTextareaClasses}`}
      />
    </div>
  );
} 