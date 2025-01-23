import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick?: () => void;
}

const CollapseButton = ({ isCollapsed }: CollapseButtonProps) => {
  return (
    <div
      className="p-1 hover:bg-info-background dark:hover:bg-info-background-dark rounded-full transition-colors"
    >
      {isCollapsed ? (
        <ChevronDownIcon className="h-4 w-4 text-text dark:text-text-dark" />
      ) : (
        <ChevronUpIcon className="h-4 w-4 text-text dark:text-text-dark" />
      )}
    </div>
  );
};

export default CollapseButton; 