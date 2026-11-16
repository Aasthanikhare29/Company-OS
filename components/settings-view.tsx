'use client';

import { useState } from 'react';
import { Bell, Globe, ShieldCheck } from 'lucide-react';
import type { Preferences } from '@/lib/data';
import { PanelHeading } from './ui';
import { AccessManager } from './access-manager';

export function ModuleView({ preferences, onSavePreferences, onNotify }: { preferences: Preferences; onSavePreferences: (preferences: Preferences) => void; onNotify: (message: string) => void }) {
  const [tab, setTab] = useState('General');
  return <div className="settings-layout"><aside className="settings-nav">{['General','Notifications','Access & roles'].map(label => <button key={label} onClick={() => setTab(label)} className={tab === label ? 'active' : ''}>{label === 'General' ? <Globe size={17} /> : label === 'Notifications' ? <Bell size={17} /> : <ShieldCheck size={17} />}{label}</button>)}</aside><section className="panel settings-panel"><PanelHeading title={tab === 'General' ? 'Workspace preferences' : tab} subtitle="Preferences are saved only on this browser." />
    {tab === 'General' ? <form className="settings-form" onSubmit={event => {
      event.preventDefault(); const form=new FormData(event.currentTarget);
      onSavePreferences({...preferences,name:String(form.get('workspaceName')).trim() || 'Company workspace',timezone:String(form.get('timezone')),weekStart:String(form.get('weekStart'))});
      onNotify('Workspace preferences saved on this browser.');
    }}><label>Workspace name<input name="workspaceName" defaultValue={preferences.name} required maxLength={60} /></label><label>Reporting timezone<select name="timezone" defaultValue={preferences.timezone}><option value="Asia/Kolkata">India Standard Time (UTC+05:30)</option><option value="UTC">Coordinated Universal Time (UTC)</option></select></label><label>Week starts on<select name="weekStart" defaultValue={preferences.weekStart}><option>Monday</option><option>Sunday</option></select></label><p className="form-note">These preferences apply to your browser-local demonstration workspace.</p><button className="primary-button" type="submit">Save preferences</button></form>
    : tab === 'Notifications' ? <div className="settings-options">{[{title:'Approval notifications',description:'Preview your preference for approval updates.',checked:preferences.approvalNotifications,toggle:()=>onSavePreferences({...preferences,approvalNotifications:!preferences.approvalNotifications})},{title:'Daily company digest',description:'Preview your preference for a daily summary.',checked:preferences.dailyDigest,toggle:()=>onSavePreferences({...preferences,dailyDigest:!preferences.dailyDigest})}].map(setting=><div className="setting-row" key={setting.title}><div><strong>{setting.title}</strong><p>{setting.description}</p></div><button className={`toggle ${setting.checked?'checked':''}`} role="switch" aria-label={setting.title} aria-checked={setting.checked} onClick={setting.toggle}><span /></button></div>)}<p className="form-note">No emails or messages are sent by this demonstration.</p></div>
    : <AccessManager />}
  </section></div>;
}
