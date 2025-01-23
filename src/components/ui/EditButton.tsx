import { PencilIcon } from '@heroicons/react/24/outline';

interface EditButtonProps {
  onClick: (e: React.MouseEvent) => void;
  protocol: 'rtmp' | 'srt';
}

const EditButton = ({ onClick, protocol }: EditButtonProps) => {
  return (
    <span
      role="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`p-0.5 text-protocol-${protocol}-output-secondary dark:text-protocol-${protocol}-output-secondary-dark hover:text-protocol-${protocol}-output-hover dark:hover:text-protocol-${protocol}-output-hover-dark cursor-pointer`}
    >
      <PencilIcon className="h-3 w-3" />
    </span>
  );
};

export default EditButton; 