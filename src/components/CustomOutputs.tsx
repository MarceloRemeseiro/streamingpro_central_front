import { FC, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateOutputModal from "./CreateOutputModal";

interface CustomOutputsProps {
  streamId: string;
  onOutputCreated?: () => void;
}

const CustomOutputs: FC<CustomOutputsProps> = ({ streamId, onOutputCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-base font-bold text-gray-700 dark:text-gray-300">
          Custom Outputs
        </h4>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <PlusIcon className="h-5 w-5" />
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
