import { Model } from '../api/models';

interface ModelSelectProps {
  selectedModel: Model | null;
  onModelSelect: (model: Model) => void;
  models: Model[];
  disabled?: boolean;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  selectedModel,
  onModelSelect,
  models,
  disabled = false
}) => {
  return (
    <div className="w-full">
      <select
        value={selectedModel?.model || ''}
        onChange={(e) => {
          const model = models.find(m => m.model === e.target.value);
          if (model) onModelSelect(model);
        }}
        disabled={disabled}
        className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
      >
        <option value="" disabled>
          选择模型
        </option>
        {models.map(model => (
          <option key={model.name} value={model.model}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelect;