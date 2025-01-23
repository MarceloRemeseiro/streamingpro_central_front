import { FC, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateOutputModal from "@/components/modals/CreateOutputModal";

interface CustomOutputsProps {
  streamId: string;
  onOutputCreated?: () => void;
}

const CustomOutputs: FC<CustomOutputsProps> = ({ streamId, onOutputCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-text-light bg-primary hover:bg-primary-hover rounded-md transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Output
        </button>
      </div>

      <CreateOutputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        streamId={streamId}
        onOutputCreated={onOutputCreated}
      />
    </div>
  );
};

export default CustomOutputs;
