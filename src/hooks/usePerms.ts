import { usePermission } from '../context/AuthContext';

/**
 * 一次性获取某个模块的所有权限，替代多个 usePermission 调用
 *
 * 之前:
 *   const canRead   = usePermission('users.read');
 *   const canWrite  = usePermission('users.write');
 *   const canDelete = usePermission('users.delete');
 *
 * 之后:
 *   const perm = usePerms('users');
 *   perm.canRead / perm.canWrite / perm.canDelete
 */

export function usePerms(module: 'users' | 'products' | 'orders' | 'audit' | 'dict' | 'dashboard') {
  const checks: Record<string, boolean> = {};
  checks.canView   = usePermission(`${module}.view`);
  checks.canRead   = usePermission(`${module}.read`);
  checks.canWrite  = usePermission(`${module}.write`);
  checks.canManage = usePermission(`${module}.manage`);
  checks.canDelete = usePermission(`${module}.delete`);

  // 聚合判断：管理 = 写 + 删
  checks.canEdit = checks.canWrite || checks.canManage;

  return checks;
}
