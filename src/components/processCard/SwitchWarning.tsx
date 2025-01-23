import { FC } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SwitchWarningProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SwitchWarning: FC<SwitchWarningProps> = ({ isVisible, onConfirm, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute right-0 top-full mt-1 z-10">
      <div className="bg-warning-light dark:bg-warning-dark border border-warning dark:border-warning-dark rounded-md p-2 shadow-sm w-48">
        <div className="flex items-start gap-1.5 text-[10px] text-warning-dark dark:text-warning-light mb-2">
          <ExclamationTriangleIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <p>Are you sure you want to stop this Output?</p>
        </div>
        <div className="flex justify-end gap-1">
          <button
            onClick={onCancel}
            className="px-2 py-0.5 text-[10px] text-text dark:text-text-dark hover:bg-card dark:hover:bg-card-dark rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-2 py-0.5 text-[10px] bg-warning text-warning-light hover:bg-warning-hover dark:bg-warning-light dark:text-warning-dark dark:hover:bg-warning rounded transition-colors"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchWarning; 