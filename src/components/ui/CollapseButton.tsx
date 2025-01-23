import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick?: () => void;
  protocol?: 'rtmp' | 'srt';
}

const CollapseButton = ({ isCollapsed, onClick, protocol }: CollapseButtonProps) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={protocol
        ? `p-1 hover:bg-protocol-${protocol}-background dark:hover:bg-protocol-${protocol}-background-dark rounded-full transition-colors`
        : "p-1 hover:bg-info-background dark:hover:bg-info-background-dark rounded-full transition-colors"}
    >
      {isCollapsed ? (
        <ChevronDownIcon className={protocol 
          ? `h-4 w-4 text-protocol-${protocol}-secondary dark:text-protocol-${protocol}-secondary-dark`
          : "h-4 w-4 text-secondary dark:text-secondary-dark"} />
      ) : (
        <ChevronUpIcon className={protocol 
          ? `h-4 w-4 text-protocol-${protocol}-secondary dark:text-protocol-${protocol}-secondary-dark`
          : "h-4 w-4 text-secondary dark:text-secondary-dark"} />
      )}
    </button>
  );
};

export default CollapseButton; 