'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  type: 'playcanvas' | 'webgl' | 'puck' | 'theia';
  created_at: string;
  updated_at: string;
  storage_used: number;
}

interface UserSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  storage_limit: number;
  projects_limit: number;
  created_at: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [storageMode, setStorageMode] = useState<'supabase' | 'byoc'>('supabase');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'subscription' | 'settings'>('projects');

  useEffect(() => {
    // Mock data - replace with actual Supabase calls
    const mockProjects: Project[] = [
      {
        id: '1',
        name: '3D Game Scene',
        type: 'playcanvas',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        storage_used: 245,
      },
      {
        id: '2',
        name: 'Shader Effects',
        type: 'webgl',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        storage_used: 128,
      },
      {
        id: '3',
        name: 'Landing Page',
        type: 'puck',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        storage_used: 45,
      },
    ];

    const mockSubscription: UserSubscription = {
      plan: 'pro',
      storage_limit: 1000,
      projects_limit: 50,
      created_at: new Date().toISOString(),
    };

    setProjects(mockProjects);
    setSubscription(mockSubscription);
    setLoading(false);
  }, []);

  const totalStorage = projects.reduce((sum, p) => sum + p.storage_used, 0);
  const storagePercentage = subscription ? (totalStorage / subscription.storage_limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black text-white">
      {/* Header */}
      <header className="border-b-4 border-cyan-500/50 bg-black/90 backdrop-blur p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-blue-500 to-green-500">
              🚀 AI-WONDERLAND Dashboard
            </h1>
            <p className="text-sm text-white/60 mt-1">Manage projects, subscriptions & storage</p>
          </div>
          <Link href="/builder-ai" className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold">
            ➕ Create Project
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-cyan-500/30">
          {(['projects', 'subscription', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab === 'projects' && '📁 Projects'}
              {tab === 'subscription' && '💳 Subscription'}
              {tab === 'settings' && '⚙️ Settings'}
            </button>
          ))}
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-400">Your Projects</h2>
            
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="border border-cyan-500/30 rounded-lg p-12 text-center bg-black/50">
                <p className="text-white/60 mb-4">No projects yet</p>
                <Link href="/builder-ai" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition">
                  Create Your First Project
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-cyan-500/30 rounded-lg p-4 bg-black/50 hover:border-cyan-400 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-cyan-300">{project.name}</h3>
                        <p className="text-xs text-white/40 mt-1">
                          {project.type === 'playcanvas' && '🎮 PlayCanvas 3D'}
                          {project.type === 'webgl' && '✨ WebGL Studio'}
                          {project.type === 'puck' && '📐 Puck UI'}
                          {project.type === 'theia' && '💻 Theia IDE'}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                        {(project.storage_used / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    
                    <div className="text-xs text-white/50 mb-4">
                      Updated: {new Date(project.updated_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/builder-ai?project=${project.id}`}
                        className="flex-1 px-3 py-2 rounded text-sm bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition text-center"
                      >
                        Edit
                      </Link>
                      <button className="flex-1 px-3 py-2 rounded text-sm bg-green-500/20 text-green-300 hover:bg-green-500/40 transition">
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && subscription && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-400">Subscription Management</h2>

            {/* Current Plan */}
            <div className="border border-purple-500/30 rounded-lg p-6 bg-black/50">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">Current Plan</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-white/60 text-sm mb-1">Plan</p>
                  <p className="text-2xl font-bold text-purple-400 capitalize">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Projects</p>
                  <p className="text-2xl font-bold text-cyan-400">{projects.length}/{subscription.projects_limit}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Storage</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(totalStorage / 1024).toFixed(1)}/{subscription.storage_limit} MB
                  </p>
                </div>
              </div>

              {/* Storage Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Storage Usage</span>
                  <span className="text-white/60">{storagePercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all rounded-full"
                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 transition font-semibold">
                  Upgrade Plan
                </button>
                <button className="flex-1 px-4 py-2 rounded border border-purple-500/30 hover:border-purple-400 transition font-semibold">
                  View Billing
                </button>
              </div>
            </div>

            {/* Plans Comparison */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Free', storage: 100, projects: 5, price: '$0' },
                { name: 'Pro', storage: 1000, projects: 50, price: '$29' },
                { name: 'Enterprise', storage: 10000, projects: 'Unlimited', price: 'Custom' },
              ].map((plan) => (
                <div key={plan.name} className={`border rounded-lg p-4 ${
                  subscription.plan === plan.name.toLowerCase()
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/20 bg-black/30'
                }`}>
                  <h4 className="font-semibold text-lg mb-3">{plan.name}</h4>
                  <p className="text-2xl font-bold text-cyan-400 mb-4">{plan.price}</p>
                  <ul className="space-y-2 text-sm text-white/70 mb-4">
                    <li>💾 {plan.storage} MB Storage</li>
                    <li>📁 {plan.projects} Projects</li>
                    <li>🤖 AI Runners</li>
                  </ul>
                  <button className={`w-full py-2 rounded transition ${
                    subscription.plan === plan.name.toLowerCase()
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                    {subscription.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Choose'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-400">Storage Settings</h2>

            {/* Storage Mode Toggle */}
            <div className="border border-yellow-500/30 rounded-lg p-6 bg-black/50">
              <h3 className="text-lg font-semibold text-yellow-300 mb-4">Storage Provider</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    id: 'supabase',
                    label: 'Supabase Cloud',
                    icon: '☁️',
                    description: 'Managed cloud storage',
                    features: ['Auto-scaling', 'Backup included', 'Global CDN'],
                  },
                  {
                    id: 'byoc',
                    label: 'BYOC (Your Cloud)',
                    icon: '🔐',
                    description: 'Bring Your Own Cloud',
                    features: ['Full control', 'Private data', 'Any provider'],
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setStorageMode(mode.id as 'supabase' | 'byoc')}
                    className={`text-left border rounded-lg p-4 transition ${
                      storageMode === mode.id
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/20 bg-black/30 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-2xl">{mode.icon}</div>
                      <input
                        type="radio"
                        checked={storageMode === mode.id}
                        onChange={() => setStorageMode(mode.id as 'supabase' | 'byoc')}
                        className="mt-1"
                      />
                    </div>
                    <h4 className="font-semibold text-white mb-1">{mode.label}</h4>
                    <p className="text-sm text-white/60 mb-3">{mode.description}</p>
                    <ul className="text-xs text-white/50 space-y-1">
                      {mode.features.map((feature) => (
                        <li key={feature}>✓ {feature}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {storageMode === 'byoc' && (
                <div className="border border-cyan-500/30 rounded p-4 bg-black/50">
                  <h4 className="font-semibold text-cyan-300 mb-3">Configure BYOC</h4>
                  <Link href="/connect-storage" className="text-center block w-full px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 transition">
                    Setup Cloud Storage →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border border-yellow-500/30 rounded-lg p-6 bg-black/50">
              <h3 className="text-lg font-semibold text-yellow-300 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded border border-white/20 hover:border-yellow-400 transition">
                  📥 Export Projects
                </button>
                <button className="w-full text-left px-4 py-2 rounded border border-white/20 hover:border-yellow-400 transition">
                  🔄 Sync Projects
                </button>
                <button className="w-full text-left px-4 py-2 rounded border border-white/20 hover:border-yellow-400 transition">
                  🗑️ Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
