import request from './request';

export interface Role {
  id: string;
  name: string;
  description: string;
}

// 获取角色列表
export const getRoles = () => {
  return request.get<Role[]>('/roles');
};

// 创建角色
export const createRole = (data: { name: string; description: string }) => {
  return request.post<Role>('/roles', data);
};