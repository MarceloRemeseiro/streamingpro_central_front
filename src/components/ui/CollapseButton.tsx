import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick?: () => void;
  isStandalone?: boolean;
}

const CollapseButton = ({ isCollapsed, onClick, isStandalone = false }: CollapseButtonProps) => {
  const Component = isStandalone ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className="p-1 hover:bg-info-background dark:hover:bg-info-background-dark rounded-full transition-colors cursor-pointer"
    >
      <svg
        className={`h-4 w-4 text-text dark:text-text-dark transform transition-transform ${
          isCollapsed ? '-rotate-90' : 'rotate-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </Component>
  );
};

export default CollapseButton; 