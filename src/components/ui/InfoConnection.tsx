import CopyButton from "./CopyButton";

interface Field {
  label: string;
  value: string;
  grid?: boolean;
}

interface InfoConnectionProps {
  fields: Field[];
  className?: string;
}

const InfoConnection = ({ fields, className = "" }: InfoConnectionProps) => {
  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {fields.map(({ label, value, grid }, index) => (
        grid ? (
          <div
            key={`${label}-${index}`}
            className="grid grid-cols-2 gap-2 p-1 bg-info-background dark:bg-info-background-dark rounded"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-medium text-text dark:text-text-dark">
                  {label}
                </span>
                <p className="text-text-muted dark:text-text-muted-dark mt-0.5">
                  {value}
                </p>
              </div>
              <CopyButton text={value} />
            </div>
            {fields[index + 1] && (
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium text-text dark:text-text-dark">
                    {fields[index + 1].label}
                  </span>
                  <p className="text-text-muted dark:text-text-muted-dark mt-0.5">
                    {fields[index + 1].value}
                  </p>
                </div>
                <CopyButton text={fields[index + 1].value} />
              </div>
            )}
          </div>
        ) : !fields[index - 1]?.grid && (
          <div
            key={`${label}-${index}`}
            className="flex items-start justify-between p-1 bg-info-background dark:bg-info-background-dark rounded"
          >
            <div>
              <span className="font-medium text-text dark:text-text-dark">
                {label}
              </span>
              <p className="text-text-muted dark:text-text-muted-dark mt-0.5">
                {value}
              </p>
            </div>
            <CopyButton text={value} />
          </div>
        )
      ))}
    </div>
  );
};

export default InfoConnection; 