export type Permission = { view: boolean; edit: boolean };
export function togglePermission(current: Permission, permission: keyof Permission): Permission {
  const next = { ...current, [permission]: !current[permission] };
  if (permission === 'edit' && next.edit) next.view = true;
  if (!next.view) next.edit = false;
  return next;
}
