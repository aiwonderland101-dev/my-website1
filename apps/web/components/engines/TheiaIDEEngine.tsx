'use client';

import { useEffect, useState } from 'react';

interface TheiaIDEEngineProps {
  script?: string;
  onScriptSave?: (script: string) => void;
}

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  icon: string;
  children?: FileNode[];
  language?: string;
  content?: string;
}

const PROJECT_STRUCTURE: FileNode = {
  name: 'AI-WONDERLAND',
  type: 'folder',
  icon: '📦',
  children: [
    {
      name: 'src',
      type: 'folder',
      icon: '📁',
      children: [
        { name: 'App.tsx', type: 'file', icon: '⚛️', language: 'typescript', content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}' },
        { name: 'index.ts', type: 'file', icon: '📝', language: 'typescript' },
        { name: 'styles.css', type: 'file', icon: '🎨', language: 'css' },
      ]
    },
    {
      name: 'components',
      type: 'folder',
      icon: '📁',
      children: [
        { name: 'Header.tsx', type: 'file', icon: '⚛️', language: 'typescript' },
        { name: 'Footer.tsx', type: 'file', icon: '⚛️', language: 'typescript' },
        { name: 'Sidebar.tsx', type: 'file', icon: '⚛️', language: 'typescript' },
      ]
    },
    { name: 'package.json', type: 'file', icon: '📋', language: 'json' },
    { name: 'tsconfig.json', type: 'file', icon: '⚙️', language: 'json' },
    { name: 'README.md', type: 'file', icon: '📖', language: 'markdown' },
  ]
};

const DEFAULT_CODE = `import React, { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`;

const EXTENSIONS = [
  { name: 'TypeScript', id: 'typescript', icon: '🔵' },
  { name: 'ESLint', id: 'eslint', icon: '⚠️' },
  { name: 'Prettier', id: 'prettier', icon: '✨' },
  { name: 'Git Graph', id: 'git-graph', icon: '🌳' },
  { name: 'REST Client', id: 'rest-client', icon: '🌐' },
  { name: 'Live Server', id: 'live-server', icon: '🔴' },
  { name: 'Debugger', id: 'debugger', icon: '🐛' },
  { name: 'Docker', id: 'docker', icon: '🐳' },
];

const THEMES = [
  { name: 'Dark (Default)', id: 'dark-default' },
  { name: 'Dracula', id: 'dracula' },
  { name: 'One Dark Pro', id: 'one-dark-pro' },
  { name: 'Nord', id: 'nord' },
  { name: 'Cyberpunk', id: 'cyberpunk' },
];

const BUILD_TOOLS = [
  { name: 'npm run build', command: 'npm run build', description: 'Production build' },
  { name: 'npm run dev', command: 'npm run dev', description: 'Development server' },
  { name: 'npm test', command: 'npm test', description: 'Run tests' },
  { name: 'npm run lint', command: 'npm run lint', description: 'Run linter' },
  { name: 'npm run format', command: 'npm run format', description: 'Format code' },
];

export default function TheiaIDEEngine({ script, onScriptSave }: TheiaIDEEngineProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'explorer' | 'extensions' | 'settings' | 'terminal'>('editor');
  const [selectedFile, setSelectedFile] = useState<string>('App.tsx');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components']));
  const [editorContent, setEditorContent] = useState<string>(script ?? DEFAULT_CODE);

  useEffect(() => {
    setEditorContent(script ?? DEFAULT_CODE);
  }, [script]);

  const saveScript = () => {
    onScriptSave?.(editorContent);
  };

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-black via-black to-black text-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-red-500/30 p-3 bg-black/50 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-red-400">💻 Theia Eclipse IDE</h1>
          <span className="text-xs text-white/40">• Full-Featured Code Editor</span>
        </div>
        <div className="flex gap-1 text-xs">
          <button className="px-2 py-1 rounded hover:bg-red-500/20 transition">File</button>
          <button className="px-2 py-1 rounded hover:bg-red-500/20 transition">Edit</button>
          <button className="px-2 py-1 rounded hover:bg-red-500/20 transition">View</button>
          <button className="px-2 py-1 rounded hover:bg-red-500/20 transition">Run</button>
          <button className="px-2 py-1 rounded hover:bg-red-500/20 transition">Help</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-60 border-r border-red-500/30 bg-black/30 flex flex-col overflow-hidden">
          {/* Activity Bar */}
          <div className="flex gap-1 p-2 border-b border-red-500/30 bg-black/50">
            {(['explorer', 'extensions', 'settings'] as const).map((icon) => (
              <button
                key={icon}
                className={`p-2 rounded transition ${
                  activeTab === icon ? 'bg-red-500/30' : 'hover:bg-white/5'
                }`}
                title={icon}
              >
                {icon === 'explorer' && '📁'}
                {icon === 'extensions' && '🧩'}
                {icon === 'settings' && '⚙️'}
              </button>
            ))}
          </div>

          {/* Explorer Panel */}
          {activeTab === 'explorer' && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="text-xs font-semibold text-white/60 mb-2">EXPLORER</div>
              <div className="space-y-1 text-sm">
                <button
                  onClick={() => toggleFolder('root')}
                  className="w-full text-left px-2 py-1 rounded hover:bg-red-500/20 transition flex items-center gap-2"
                >
                  <span>{expandedFolders.has('root') ? '📂' : '📁'}</span>
                  <span className="font-semibold">{PROJECT_STRUCTURE.name}</span>
                </button>

                {expandedFolders.has('root') && PROJECT_STRUCTURE.children?.map((item) => (
                  <div key={item.name} className="ml-4">
                    {item.type === 'folder' ? (
                      <>
                        <button
                          onClick={() => toggleFolder(item.name)}
                          className="w-full text-left px-2 py-1 rounded hover:bg-red-500/20 transition flex items-center gap-2 text-white/70"
                        >
                          <span>{expandedFolders.has(item.name) ? '📂' : '📁'}</span>
                          <span>{item.name}</span>
                        </button>
                        {expandedFolders.has(item.name) && item.children?.map((file) => (
                          <button
                            key={file.name}
                            onClick={() => setSelectedFile(file.name)}
                            className={`w-full text-left px-2 py-1 ml-4 rounded transition flex items-center gap-2 text-xs ${
                              selectedFile === file.name
                                ? 'bg-red-500/30 text-red-300'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>{file.icon}</span>
                            <span>{file.name}</span>
                          </button>
                        ))}
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedFile(item.name)}
                        className={`w-full text-left px-2 py-1 ml-4 rounded transition flex items-center gap-2 text-xs ${
                          selectedFile === item.name
                            ? 'bg-red-500/30 text-red-300'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extensions Panel */}
          {activeTab === 'extensions' && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="text-xs font-semibold text-white/60 mb-3">EXTENSIONS</div>
              <div className="space-y-2">
                {EXTENSIONS.map((ext) => (
                  <div key={ext.id} className="border border-red-500/30 rounded p-2 bg-black/50 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{ext.icon}</span>
                      <span className="font-semibold text-red-300">{ext.name}</span>
                    </div>
                    <button className="w-full py-1 px-2 rounded bg-red-500/20 text-red-300 text-xs hover:bg-red-500/40 transition">
                      Install
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div>
                <div className="text-xs font-semibold text-white/60 mb-2">THEME</div>
                <div className="space-y-1">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      className="w-full text-left px-2 py-1 rounded hover:bg-red-500/20 transition text-xs"
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-white/60 mb-2">EDITOR</div>
                <label className="flex items-center gap-2 text-xs mb-1">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Word Wrap</span>
                </label>
                <label className="flex items-center gap-2 text-xs mb-1">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Auto Save</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Minimap</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tabs */}
          <div className="border-b border-red-500/30 bg-black/50 flex items-center overflow-x-auto">
            {[selectedFile, 'Terminal'].map((tab) => (
              <button
                key={tab}
                onClick={() => tab === 'Terminal' ? setActiveTab('terminal') : null}
                className={`px-4 py-2 border-b-2 transition text-sm whitespace-nowrap ${
                  (activeTab === 'terminal' && tab === 'Terminal') || (activeTab !== 'terminal' && tab === selectedFile)
                    ? 'border-red-400 text-red-300 bg-red-500/10'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {tab === 'Terminal' ? '⌨️ Terminal' : `📝 ${tab}`}
              </button>
            ))}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab !== 'terminal' ? (
              <>
                {/* Code Editor */}
                <div className="flex-1 overflow-hidden flex flex-col p-4 bg-black/20">
                  <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                  <span>Line 1, Column 1</span>
                  <button
                    onClick={saveScript}
                    className="rounded border border-green-400/50 px-2 py-1 text-green-200 text-xs hover:bg-green-500/10"
                  >
                    Save Script
                  </button>
                </div>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="flex-1 bg-transparent border border-red-500/20 rounded p-3 text-xs font-mono text-white resize-none focus:outline-none focus:border-red-400 overflow-auto"
                />
                </div>

                {/* Status Bar */}
                <div className="border-t border-red-500/30 bg-black/50 p-2 text-xs text-white/60 flex justify-between">
                  <div>UTF-8 • TypeScript • LF</div>
                  <div>Ln 1, Col 1</div>
                </div>
              </>
            ) : (
              <>
                {/* Terminal */}
                <div className="flex-1 overflow-y-auto p-3 border border-red-500/20 m-4 rounded bg-black/50 font-mono text-xs">
                  <div className="text-green-400">$ npm run dev</div>
                  <div className="text-white/60">dev server running at http://localhost:3000</div>
                  <div className="text-white/40 mt-2">&gt; Ready for development</div>
                </div>

                {/* Build Tools */}
                <div className="p-4 border-t border-red-500/30">
                  <div className="text-xs font-semibold text-white/60 mb-2">Quick Commands</div>
                  <div className="grid grid-cols-5 gap-2">
                    {BUILD_TOOLS.map((tool) => (
                      <button
                        key={tool.command}
                        className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs hover:bg-red-500/40 transition"
                        title={tool.description}
                      >
                        {tool.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}