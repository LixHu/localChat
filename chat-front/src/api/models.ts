import request from './request';

export interface Model {
  name: string;
  model: string;
  description?: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export const getModels = () => {
  return request.get<{ models: Model[] }>('/models');
};