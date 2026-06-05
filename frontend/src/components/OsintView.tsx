'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  Activity, 
  Globe, 
  Eye, 
  Skull,
  Lock,
  Phone,
  Trash2,
  RefreshCw,
  FolderOpen,
  User,
  HardDrive
} from 'lucide-react';

interface IpData {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
  postal?: string;
}

interface CsharpOsintDetails {
  username: string;
  machineName: string;
  osDescription: string;
  osArchitecture: string;
  processArchitecture: string;
  frameworkDescription: string;
  workingDirectory: string;
  processId: number;
  processName: string;
  processUptime: string;
  localIps: string[];
}

export default function OsintView() {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [csharpDetails, setCsharpDetails] = useState<CsharpOsintDetails | null>(null);
  const [systemTime, setSystemTime] = useState<string>('');
  const [webglInfo, setWebglInfo] = useState<{ vendor: string; renderer: string }>({ vendor: 'Unknown', renderer: 'Unknown' });
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<number>(0);

  useEffect(() => {
    // Dynamic system time updates
    setSystemTime(new Date().toLocaleString());
    const interval = setInterval(() => {
      setSystemTime(new Date().toLocaleString());
    }, 1000);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

    // Fetch IP and Geo Data
    fetch('https://ipapi.co/json/')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch IP details');
        return res.json();
      })
      .then((data) => setIpData(data))
      .catch((err) => {
        console.log('IP lookup failed (normal if adblocker is active):', err);
        setIpData({
          ip: '127.0.0.1',
          city: 'Local Host',
          region: 'Loopback',
          country_name: 'Loopback Federation',
          org: 'Dev Machine Sandbox',
          postal: '00000'
        });
      });

    // Fetch C# Backend System Details
    fetch(`${apiBaseUrl}/api/osint`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch backend OSINT details');
        return res.json();
      })
      .then((data) => setCsharpDetails(data))
      .catch((err) => {
        console.error('Failed to connect to C# backend OSINT endpoint:', err);
      });

    // Extract WebGL Renderer details (GPU Fingerprint)
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          setWebglInfo({
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown',
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown'
          });
        }
      }
    } catch (e) {
      console.warn('WebGL detection blocked:', e);
    }

    // Mock scanner progress
    const scanTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(scanTimer);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => {
      clearInterval(interval);
      clearInterval(scanTimer);
    };
  }, []);

  const handleAskMom = () => {
    alert("📞 Calling Mom...\n\n\"Mom, can I run this C# and Next.js repository I found on the internet?\"\n\nMom says: \"Christopher Kraft and Gene Kranz are NASA flight directors, they know what they are doing, but you? Go clean your room first!\"");
  };

  const handleDeleteRepo = () => {
    alert(" Nice try, but the code is already running on port 3000! 💀");
  };

  // Safe checks for browser values
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'Server-side';
  const language = typeof window !== 'undefined' ? navigator.language : 'Unknown';
  const resolution = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown';
  const colorDepth = typeof window !== 'undefined' ? `${window.screen.colorDepth} bit` : 'Unknown';
  const cpuCores = typeof window !== 'undefined' ? navigator.hardwareConcurrency || 'Unknown' : 'Unknown';
  
  // Connection details
  const getNetworkType = () => {
    if (typeof window !== 'undefined') {
      const conn = (navigator as any).connection;
      return conn ? `${conn.effectiveType || 'Unknown'} (${conn.downlink ? conn.downlink + ' Mbps' : 'N/A'})` : 'Online (LAN/Wi-Fi)';
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-6 text-on-surface">
      {/* Title section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold font-sans tracking-tight text-on-surface flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-red-650 animate-pulse" />
            <span>Chimichanga Sentinel Scanner</span>
          </h2>
          <p className="text-on-surface-variant font-medium text-sm mt-1">
            Analyzing security exposure vectors and local system footprinting.
          </p>
        </div>
        
        {isScanning ? (
          <div className="flex items-center gap-2 bg-amber-555/10 border border-amber-500/20 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Fingerprinting Host ({scanProgress}%)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-650/10 border border-red-600/30 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold">
            <Skull className="w-3.5 h-3.5" />
            <span>System Vulnerable</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Side: Deadpool Warning (5 Columns) */}
        <section className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-red-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[460px] text-white">
            
            {/* Background glowing warning light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between border-b border-red-955 pb-3">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-red-500">
                  Critical Warning Message
                </span>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
              </div>

              {/* Deadpool Picture frame */}
              <div className="relative border-4 border-slate-950 rounded-xl overflow-hidden shadow-inner group aspect-square max-w-[280px] mx-auto">
                <img 
                  src="/deadpool.png" 
                  alt="Deadpool warning you" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-red-400 bg-black/60 px-2 py-0.5 rounded">
                  OSINT TARGET IDENTIFIED
                </div>
              </div>

              {/* Deadpool comic speech bubble */}
              <div className="relative bg-white text-slate-900 p-4 rounded-xl border-2 border-slate-950 shadow-md font-bold text-sm tracking-tight text-center leading-relaxed">
                {/* Speech bubble tail */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-slate-950 rotate-45"></div>
                
                <p className="mt-1">
                  &ldquo;Whoa, superstar! Didn't your mom ever teach you not to run arbitrary code on your PC when you have absolutely no clue what it actually does? (Spoiler alert: this is how supervillains are made).&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-3 z-10">
              <button 
                onClick={handleAskMom}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Mom</span>
              </button>
              <button 
                onClick={handleDeleteRepo}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-lg text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Nuke Repo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Active Host OSINT Fingerprint & C# Telemetry (7 Columns) */}
        <section className="col-span-12 lg:col-span-7 space-y-6">
          
          {/* C# Server Side System Leak Card */}
          {csharpDetails && (
            <div className="bg-slate-950 border border-red-900/50 rounded-2xl p-6 shadow-xl space-y-4 text-slate-200">
              <h3 className="font-extrabold text-lg text-red-500 tracking-tight flex items-center gap-2 border-b border-red-950/60 pb-3">
                <Cpu className="w-5 h-5 text-red-500 animate-pulse" />
                <span>Backend C# API Process OSINT (Host Leak)</span>
              </h3>
              
              <p className="text-[11px] text-slate-400 leading-normal">
                Because the <code className="text-red-400 bg-red-950/40 px-1 py-0.5 rounded font-mono">dotnet run</code> backend process runs with the current OS account privileges, it has queried and returned the following system configurations:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                
                <div className="space-y-1 p-3 bg-slate-900/60 border border-red-950/30 rounded-lg">
                  <span className="text-[9px] font-bold text-red-400 uppercase block">Host Machine User</span>
                  <span className="font-semibold text-slate-100 break-all flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-red-500 opacity-80" />
                    <span>{csharpDetails.username}</span>
                  </span>
                </div>

                <div className="space-y-1 p-3 bg-slate-900/60 border border-red-950/30 rounded-lg">
                  <span className="text-[9px] font-bold text-red-400 uppercase block">Host Node Name</span>
                  <span className="font-semibold text-slate-100 break-all">{csharpDetails.machineName}</span>
                </div>

                <div className="space-y-1 p-3 bg-slate-900/60 border border-red-950/30 rounded-lg col-span-1 md:col-span-2">
                  <span className="text-[9px] font-bold text-red-400 uppercase block">Host Operating System Description</span>
                  <span className="font-semibold text-slate-100 break-all flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-red-500 opacity-80" />
                    <span>{csharpDetails.osDescription} ({csharpDetails.osArchitecture})</span>
                  </span>
                </div>

                <div className="space-y-1 p-3 bg-slate-900/60 border border-red-950/30 rounded-lg">
                  <span className="text-[9px] font-bold text-red-400 uppercase block">Process Host / Runtime</span>
                  <span className="font-semibold text-slate-100 break-all">
                    {csharpDetails.processName} ({csharpDetails.processId}) / .NET 10
                  </span>
                </div>

                <div className="space-y-1 p-3 bg-slate-900/60 border border-red-950/30 rounded-lg">
                  <span className="text-[9px] font-bold text-red-400 uppercase block">C# Process Uptime</span>
                  <span className="font-semibold text-slate-100 break-all">{csharpDetails.processUptime}</span>
                </div>

                <div className="space-y-1 p-3 bg-slate-900/60 border border-red-950/30 rounded-lg col-span-1 md:col-span-2">
                  <span className="text-[9px] font-bold text-red-400 uppercase block">Project Working Directory (Host Filepath)</span>
                  <span className="font-semibold text-slate-100 break-all flex items-center gap-1 text-[11px] leading-relaxed">
                    <FolderOpen className="w-4 h-4 text-red-500 opacity-80 shrink-0" />
                    <span>{csharpDetails.workingDirectory}</span>
                  </span>
                </div>

                <div className="space-y-1 p-3 bg-slate-900/60 border border-red-950/30 rounded-lg col-span-1 md:col-span-2">
                  <span className="text-[9px] font-bold text-red-400 uppercase block">Host Network Interface Addresses</span>
                  <span className="font-semibold text-slate-100 break-all text-[11px]">
                    {csharpDetails.localIps.join(', ')}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* OSINT details card (Client Details) */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <Terminal className="w-5 h-5 text-secondary" />
              <span>Browser Sandbox OSINT Fingerprint</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Local Server Time</span>
                <span className="font-mono font-semibold text-slate-800 break-all">{systemTime}</span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Timezone Scope</span>
                <span className="font-mono font-semibold text-slate-800 break-all">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Localhost Domain</span>
                <span className="font-mono font-semibold text-slate-800 break-all">
                  localhost (127.0.0.1)
                </span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Network Protocol</span>
                <span className="font-mono font-semibold text-slate-800 break-all">{getNetworkType()}</span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">User-Agent Identifier</span>
                <span className="font-mono font-semibold text-slate-800 line-clamp-2 leading-relaxed" title={userAgent}>
                  {userAgent}
                </span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Language Code</span>
                <span className="font-mono font-semibold text-slate-800 break-all">{language}</span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Screen & Colors</span>
                <span className="font-mono font-semibold text-slate-800 break-all">
                  {resolution} @ {colorDepth}
                </span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Physical CPU Cores</span>
                <span className="font-mono font-semibold text-slate-800 break-all">{cpuCores} Threads</span>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">WebGL GPU Renderer Fingerprint</span>
                <span className="font-mono font-semibold text-slate-850 break-all leading-normal">
                  {webglInfo.renderer} ({webglInfo.vendor})
                </span>
              </div>

              {ipData && (
                <>
                  <div className="space-y-1.5 p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-secondary animate-pulse" />
                        <span>Public GeoIP Leak Detection</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">
                        Verified External
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                      <div><span className="text-slate-400">Public IP:</span> {ipData.ip}</div>
                      <div><span className="text-slate-400">ISP/Org:</span> {ipData.org}</div>
                      <div><span className="text-slate-400">Location:</span> {ipData.city}, {ipData.region}</div>
                      <div><span className="text-slate-400">Country:</span> {ipData.country_name}</div>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Social Engineering Vulnerability Assessment */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Developer Vulnerability Assessment</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200/50 rounded-lg flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded text-red-700 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-red-950">CRITICAL: Arbitrary Repo Execution (CVE-MOM-01)</h4>
                  <p className="text-[10px] text-red-900 leading-normal mt-0.5">
                    User ran a clone from an unverified GitHub repository with active server ports and local access capabilities. Execution contains complete file-system manipulation permission vectors.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-lg flex items-start gap-3">
                <div className="p-1 bg-amber-100 rounded text-amber-700 shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-950">WARNING: High Influence Factor (UI/UX)</h4>
                  <p className="text-[10px] text-amber-900 leading-normal mt-0.5">
                    Subject displays extreme compliance when presented with aesthetic dark-mode dashboards, interactive wallets, and space travel themes.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-lg flex items-start gap-3">
                <div className="p-1 bg-emerald-100 rounded text-emerald-700 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">INFO: Local System Intact</h4>
                  <p className="text-[10px] text-emerald-900 leading-normal mt-0.5">
                    No actual payload was delivered. This audit page was generated harmlessly by Antigravity AI to remind developers to practice safe cloning.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
