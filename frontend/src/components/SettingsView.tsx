'use client';

import React, { useState } from 'react';
import { 
  Settings2, 
  Key, 
  Globe, 
  HelpCircle, 
  Save, 
  Eye, 
  EyeOff, 
  Play, 
  RotateCcw,
  CheckCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface SettingsViewProps {
  lookbackDays: number;
  onUpdateLookbackDays: (days: number) => void;
}

export default function SettingsView({ lookbackDays, onUpdateLookbackDays }: SettingsViewProps) {
  const [profileName, setProfileName] = useState('Christopher Kraft');
  const [profileMail, setProfileMail] = useState('christopher.kraft@novatreasury.com');
  const [profileDept, setProfileDept] = useState('Sovereign Enterprise Treasury');
  
  const [webhookUrl, setWebhookUrl] = useState('https://github.com/crow131/nova-treasury/webhooks');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Auto reconciliation state
  const [autoReconcile, setAutoReconcile] = useState(true);
  const [strictAudit, setStrictAudit] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Success: System Profile saved for ${profileName}.`);
  };

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setTimeout(() => {
      setIsTestingWebhook(false);
      alert('Webhook dispatched successfully! Response code: 200 OK.\nPayload contains full 6 JSON mock transactions ledger records.');
    }, 900);
  };

  return (
    <div className="space-y-6">
      
      {/* Title section */}
      <div>
        <h2 className="text-3xl font-bold font-sans tracking-tight text-on-surface">System configuration</h2>
        <p className="text-on-surface-variant font-medium text-sm mt-1">Verify compliance metrics, credentials, lookbacks, and webhook endpoints.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Side: General Profile & Lookbacks (8 Columns) */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Section: Profile Administration */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-secondary" />
              <span>Sovereign administrator identity</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Executive Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full border border-outline bg-white px-3 py-2 rounded focus:ring-1 focus:ring-secondary text-sm outline-none font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Contact Mail</label>
                  <input 
                    type="email" 
                    value={profileMail}
                    onChange={(e) => setProfileMail(e.target.value)}
                    className="w-full border border-outline bg-white px-3 py-2 rounded focus:ring-1 focus:ring-secondary text-sm outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">System Division / Division Code</label>
                <input 
                  type="text" 
                  value={profileDept}
                  onChange={(e) => setProfileDept(e.target.value)}
                  className="w-full border border-outline bg-white px-3 py-2 rounded focus:ring-1 focus:ring-secondary text-sm outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded hover:bg-black active:scale-95 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save system specifications</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section: Lookbacks Dynamic slider */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Compliance audit scope lookback</span>
            </h3>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Dynamically constrain total aggregates and calculations based on the last selected days of ledger updates. Reducing the limit accelerates page lookup loops for sub-systems.
            </p>

            <div className="space-y-3 bg-slate-50/70 border border-outline p-5 rounded-lg">
              <div className="flex justify-between items-baseline font-semibold text-sm">
                <span className="text-on-surface-variant">Calculation look-back window</span>
                <span className="font-mono text-secondary font-bold text-lg bg-white px-2 py-0.5 rounded border border-slate-200">
                  {lookbackDays} Days Selected
                </span>
              </div>

              {/* Range Slider tool */}
              <input 
                type="range" 
                min="1" 
                max="90" 
                value={lookbackDays}
                onChange={(e) => onUpdateLookbackDays(parseInt(e.target.value))}
                className="w-fullaccent-secondary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase">
                <span>1 Day (Instant)</span>
                <span>30 Days (Standard)</span>
                <span>90 Days (Enterprise Qrt)</span>
              </div>
            </div>
          </div>

        </section>

        {/* Right Side: Credentials & Webhooks (4 Columns) */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* API Credentials */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-550" />
              <span>Secrets Keyring</span>
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              API sandbox credentials are automatically injected server-side to guarantee secure access to GenAI features.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-outline rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-800 uppercase">GEMINI_API_KEY</span>
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-on-surface-variant hover:text-slate-900 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="font-mono text-xs select-none truncate text-slate-900 font-bold">
                  {showApiKey ? 'AIzaSyChE9210-Nova-Treasury-38B12' : '••••••••••••••••••••••••••••'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-outline rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-800 uppercase">GOLDMAN_REST_CLIENT_ID</span>
                </div>
                <p className="font-mono text-xs text-on-surface-variant select-all">
                  gov_nova_sec_4412_prod
                </p>
              </div>
            </div>
          </div>

          {/* Webhooks Setup */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Institutional Webhooks</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-on-surface-variant tracking-wider uppercase">Payload Endpoint</label>
              <input 
                type="text" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full border border-outline bg-white px-2.5 py-1.5 rounded text-xs outline-none font-semibold text-slate-800"
              />
            </div>

            <button 
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-outline text-slate-950 font-bold text-xs rounded active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-pulse text-secondary' : ''}`} />
              <span>{isTestingWebhook ? 'Dispatched' : 'Validate Event Ping'}</span>
            </button>
          </div>

          {/* Compliance Audit Rule Switches */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>System Rule Engine</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-900">Auto-Reconcile Invoices</p>
                  <p className="text-[10px] text-on-surface-variant">Sync matches instantly via API</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoReconcile}
                  onChange={(e) => setAutoReconcile(e.target.checked)}
                  className="w-4 h-4 border-outline text-secondary rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-900">Strict Audit Enforcements</p>
                  <p className="text-[10px] text-on-surface-variant">Block single cards reaching 90%</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={strictAudit}
                  onChange={(e) => setStrictAudit(e.target.checked)}
                  className="w-4 h-4 border-outline text-secondary rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
