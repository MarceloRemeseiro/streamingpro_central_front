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
      <div className="bg-warning-light border border-warning rounded-md p-2 shadow-sm w-48">
        <div className="flex items-start gap-1.5 text-[10px] text-warning-dark mb-2">
          <ExclamationTriangleIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <p>¿Estás seguro de que quieres detener este Output?</p>
        </div>
        <div className="flex justify-end gap-1">
          <button
            onClick={onCancel}
            className="px-2 py-0.5 text-[10px] text-text-primary hover:bg-card-background rounded"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-2 py-0.5 text-[10px] bg-warning text-white hover:bg-warning-dark rounded"
          >
            Detener
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchWarning; 