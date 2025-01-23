import { TrashIcon } from '@heroicons/react/24/outline';

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const DeleteButton = ({ onClick, disabled = false }: DeleteButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1 text-error dark:text-error-dark hover:text-error-hover dark:hover:text-error-hover-dark disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
};

export default DeleteButton; 