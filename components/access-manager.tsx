'use client';

import { useState, type FormEvent } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { useBrowserState } from '@/lib/use-browser-state';
import { Avatar } from './ui';
import { togglePermission } from '@/lib/permissions';

const modules = ['Sales & CRM','Finance','People','Projects','Support','Inventory','Reports'];
const roles = ['Administrator','Department lead','Viewer'];
type Member = { name: string; email: string; role: string };
type Access = { permissions: Record<string, Record<string, { view: boolean; edit: boolean }>>; members: Member[] };
function seedAccess(): Access { return { permissions: Object.fromEntries(roles.map(role => [role,Object.fromEntries(modules.map(module => [module,{ view: true, edit: role !== 'Viewer' }]))])), members: [{ name:'Alex Morgan',email:'alex.morgan@example.com',role:'Administrator' },{name:'Maya Patel',email:'maya.patel@example.com',role:'Department lead'}] }; }
function validAccess(value: unknown) {
  const access = value as Access;
  return !!access && typeof access === 'object' && Array.isArray(access.members) && access.members.every(member => member && typeof member.name === 'string' && typeof member.email === 'string' && roles.includes(member.role)) && roles.every(role => modules.every(module => typeof access.permissions?.[role]?.[module]?.view === 'boolean' && typeof access.permissions?.[role]?.[module]?.edit === 'boolean'));
}

export function AccessManager() {
  const [access,setAccess,warning] = useBrowserState<Access>('company-os-access-v1',seedAccess,validAccess);
  const [role,setRole] = useState('Administrator');
  const [showForm,setShowForm] = useState(false);
  const [error,setError] = useState('');
  function toggle(module: string, permission: 'view' | 'edit') {
    setAccess(previous => {
      const current = previous.permissions[role][module];
      const next = togglePermission(current, permission);
      return { ...previous,permissions:{...previous.permissions,[role]:{...previous.permissions[role],[module]:next}} };
    });
  }
  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const name=String(form.get('name')).trim(),email=String(form.get('email')).trim(),memberRole=String(form.get('role'));
    if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Enter a name and valid email address.');return;}
    if(access.members.some(member => member.email.toLowerCase()===email.toLowerCase())){setError('This email is already in the demo member list.');return;}
    setAccess(previous=>({...previous,members:[...previous.members,{name,email,role:memberRole}]}));setShowForm(false);setError('');
  }
  return <div className="access-manager"><div className="access-boundary"><ShieldCheck size={20} /><p><strong>Plan your team’s access.</strong>This is a permission design preview. These switches do not enforce real access or send invitations.</p></div>{warning && <p className="field-error">{warning}</p>}<label className="role-picker">Preview role<select value={role} onChange={event=>setRole(event.target.value)}>{roles.map(value=><option key={value}>{value}</option>)}</select></label><div className="table-scroll"><table className="permission-table"><thead><tr><th>Workspace module</th><th>View</th><th>Edit</th></tr></thead><tbody>{modules.map(module=><tr key={module}><td>{module}</td>{(['view','edit'] as const).map(permission=><td key={permission}><input type="checkbox" aria-label={`${role}: ${permission} ${module}`} checked={access.permissions[role][module][permission]} onChange={()=>toggle(module,permission)} /></td>)}</tr>)}</tbody></table></div><div className="member-heading"><h3>Demo members <span>{access.members.length}</span></h3><button className="secondary-button" onClick={()=>setShowForm(!showForm)}><Plus size={14} />Add demo member</button></div>{showForm && <form className="member-form" onSubmit={addMember} noValidate><label>Full name<input name="name" maxLength={100} /></label><label>Email<input name="email" type="email" maxLength={160} /></label><label>Role<select name="role">{roles.map(value=><option key={value}>{value}</option>)}</select></label>{error&&<p className="field-error" role="alert">{error}</p>}<div><button className="secondary-button" type="button" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary-button">Add to demo</button></div></form>}<div className="member-list">{access.members.map(member=><div key={member.email}><Avatar initials={member.name.split(' ').map(word=>word[0]).slice(0,2).join('')} color="blue" small /><span><strong>{member.name}</strong><small>{member.email}</small></span><select aria-label={`Role for ${member.name}`} value={member.role} onChange={event=>setAccess(previous=>({...previous,members:previous.members.map(item=>item.email===member.email?{...item,role:event.target.value}:item)}))}>{roles.map(value=><option key={value}>{value}</option>)}</select></div>)}</div></div>;
}
