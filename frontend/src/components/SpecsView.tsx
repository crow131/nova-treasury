'use client';

import React from 'react';
import { 
  BookOpen, 
  Terminal, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Flame,
  Activity,
  Workflow
} from 'lucide-react';

export default function SpecsView() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

  const requirements = [
    {
      id: 'Req 1',
      title: 'Create a Card',
      desc: 'Allows cardholders creation with a limit allocation.',
      implementation: 'POST /api/cards creates a card, generates a secure 16-digit card number, sets the status to ACTIVE, and issues a database-primary UUID key.',
      status: 'Implemented'
    },
    {
      id: 'Req 2',
      title: 'Record Transaction',
      desc: 'Stores transaction associated with a specific card.',
      implementation: 'POST /api/transactions processes purchases (negative values) and deposits (positive values). Validates card existence, checks limit headroom, and verifies that the card is not frozen (LOCKED).',
      status: 'Implemented'
    },
    {
      id: 'Req 3',
      title: 'Currency Lookback API',
      desc: 'Converts transaction using rate on or before date within prior 6 months.',
      implementation: 'GET /api/transactions?currency=CODE implements a custom C# memory filter to find the closest historical rate. It throws an RFC 7807 problem details error if no rate is found within 6 months.',
      status: 'Implemented'
    },
    {
      id: 'Req 4',
      title: 'Latest Card Balance API',
      desc: 'Retrieves card\'s available balance in target currency using latest rate.',
      implementation: 'GET /api/cards/{id}/balance?currency=CODE calculates the card\'s current available balance (Limit - Spent) and converts it to the specified currency using the latest published rate.',
      status: 'Implemented'
    }
  ];

  return (
    <div className="space-y-8 font-sans text-on-surface">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Design Document</h2>
          <p className="text-on-surface-variant font-medium text-sm mt-1">
            Technical specifications, project requirements mapping, and engine parameters.
          </p>
        </div>
        <a 
          href={`${apiBaseUrl}/scalar/v1`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white hover:bg-black font-semibold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0 border border-slate-800"
        >
          <BookOpen className="w-4 h-4 text-tertiary-fixed-dim" />
          <span>Launch Scalar Sandbox</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Requirements Mapping (Full Column or Left Column 8) */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Section: Product Brief Requirements Checklist */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Product Brief Requirement Mapping</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-outline-variant font-extrabold text-on-surface-variant uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-3">Requirement</th>
                    <th className="py-3 px-3">Specs Mapping</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono font-bold text-slate-400">{req.id}</td>
                      <td className="py-3.5 px-3">
                        <p className="font-extrabold text-slate-900 text-sm">{req.title}</p>
                        <p className="text-slate-500 font-medium text-[11px] mt-0.5">{req.desc}</p>
                      </td>
                      <td className="py-3.5 px-3 leading-relaxed text-[11px] text-slate-650 max-w-sm">
                        {req.implementation}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Resilience Engine and API calls */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-650 animate-pulse" />
              <span>Polly Resilience & Caching Rules</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/80 border border-outline rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-650" />
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Polly v8 Resilience Pipeline</span>
                </div>
                <ul className="space-y-1.5 font-medium text-slate-600 leading-normal list-disc list-inside pl-1">
                  <li><strong className="text-slate-800">Exponential Backoff:</strong> Retries with 2^attempt (2, 4, 8 seconds) of delay.</li>
                  <li><strong className="text-slate-800">Jitter Offset:</strong> Introduces random variation to block concurrent spikes.</li>
                  <li><strong className="text-slate-800">429 Retry-After:</strong> Parsed dynamically to throttle the next call.</li>
                  <li><strong className="text-slate-800">Circuit Breaker:</strong> Trips for 30s after 5 consecutive faults.</li>
                </ul>
              </div>

              <div className="bg-slate-50/80 border border-outline rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">IMemoryCache Caching Strategy</span>
                </div>
                <ul className="space-y-1.5 font-medium text-slate-600 leading-normal list-disc list-inside pl-1">
                  <li><strong className="text-slate-800">Historical Rates:</strong> Cached for 24 hours per transaction-date key.</li>
                  <li><strong className="text-slate-800">Latest Rates:</strong> Cached for 2 hours (handles quarterly publishes).</li>
                  <li><strong className="text-slate-800">Negative Cache:</strong> Caches missed lookups (no rate) for 1 hour to prevent API hammering.</li>
                  <li><strong className="text-slate-800">Client-Side Sorting:</strong> Eliminates backend timeouts by sorting in-memory.</li>
                </ul>
              </div>
            </div>
          </div>

        </section>

        {/* Right Side: Tooling & Stack Details (4 Columns) */}
        <section className="col-span-12 lg:col-span-4 space-y-6">

          {/* AI Credits */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden space-y-4">
            {/* Background decoration */}
            <div className="absolute right-0 bottom-0 w-36 h-36 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-tertiary-fixed-dim" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">AI Collaboration Specs</h3>
            </div>

            <div className="space-y-3.5 text-xs font-medium text-slate-350 leading-relaxed">
              <p>
                This application was developed in a collaborative pair-programming setting between the developer and <strong className="text-white">Antigravity</strong>, an advanced agentic AI coding assistant designed by the <strong className="text-white">Google DeepMind</strong> team.
              </p>
              <p>
                Visual layouts, harmonious interface colors, and dashboard modularity were designed and generated using <strong className="text-white">Google Stitch</strong>, facilitating a state-of-the-art corporate financial experience.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="inline-block bg-white/10 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
                  Antigravity AI
                </span>
                <span className="inline-block bg-white/10 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
                  Google Stitch
                </span>
                <span className="inline-block bg-white/10 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
                  DeepMind Agentic Dev
                </span>
              </div>
            </div>
          </div>

          {/* Tech Stack Details */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Full System Stack</span>
            </h3>

            <div className="space-y-3 font-medium text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">C# Backend API</span>
                <span className="font-extrabold text-slate-900 font-mono">.NET 10.0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Next.js Frontend</span>
                <span className="font-extrabold text-slate-900 font-mono">React 19 / v16.2</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Relational Database</span>
                <span className="font-extrabold text-slate-900 font-mono">PostgreSQL 17</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Database Mapper</span>
                <span className="font-extrabold text-slate-900 font-mono">EF Core 10</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Test Framework</span>
                <span className="font-extrabold text-slate-900 font-mono">xUnit 2.9</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Resilience Engine</span>
                <span className="font-extrabold text-slate-900 font-mono">Polly v8.5</span>
              </div>
            </div>
          </div>

          {/* Compliance Specs */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>API Error Compliance</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Every failed validation (overdrafts, locked cards, invalid dates, and unsupported currencies) responds with an <strong className="text-slate-800">RFC 7807 Problem Details</strong> format, assuring standardized client error parsing across both native web apps and automated corporate script clients.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
}
