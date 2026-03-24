"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Cloud3DViewer from '@/components/Cloud3DViewer';

interface LibraryProduct {
  id: string;
  product_name: string;
  logic_code: string;
  asset_url: string;
  thumbnail_url: string;
  created_at: string;
  glb_file_name?: string;
  thumbnail_file_name?: string;
}

export default function LibraryGrid() {
  const [products, setProducts] = useState<LibraryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLibrary() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('community_library')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch library:', err);
        setError(err instanceof Error ? err.message : 'Failed to load library');
      } finally {
        setLoading(false);
      }
    }

    fetchLibrary();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-black">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-gray-800 rounded-xl overflow-hidden animate-pulse">
            <div className="w-full h-64 bg-gray-800"></div>
            <div className="p-4 bg-gray-900">
              <div className="h-4 bg-gray-800 rounded mb-3"></div>
              <div className="h-8 bg-gray-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-black text-white">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load library</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-black text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-2">No products in the library yet</p>
          <p className="text-gray-500 text-sm">Be the first to publish a PlayCanvas creation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-black">
      {products.map((product) => {
        const isExpanded = expandedProductId === product.id;
        // Extract file names from URLs if not stored separately
        const glbFileName =
          product.glb_file_name ||
          product.asset_url?.split('/').pop() ||
          `product_${product.id}.glb`;
        const thumbnailFileName =
          product.thumbnail_file_name ||
          product.thumbnail_url?.split('/').pop() ||
          `product_${product.id}.png`;

        return (
          <div
            key={product.id}
            className={`group relative border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-300 ${
              isExpanded ? 'md:col-span-2 lg:col-span-2' : ''
            }`}
          >
            {/* 3D Viewer */}
            <div className="relative w-full bg-gray-900">
              {isExpanded ? (
                <div className="h-96">
                  <Cloud3DViewer
                    glbFileName={glbFileName}
                    thumbnailFileName={thumbnailFileName}
                    thumbnailUrl={product.thumbnail_url}
                    logicCode={product.logic_code}
                    productName={product.product_name}
                    height="100%"
                    width="100%"
                    onLoadStart={() => console.log('Loading 3D model...')}
                    onLoadComplete={() => console.log('3D model loaded')}
                    onLoadError={(error) => console.error('3D load error:', error)}
                  />
                </div>
              ) : (
                <img
                  src={product.thumbnail_url}
                  alt={product.product_name}
                  className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={() => setExpandedProductId(product.id)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjMTExIi8+Cjx0ZXh0IHg9IjEyOCIgeT0iMTI4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4=';
                  }}
                />
              )}
            </div>

            {/* Product Info */}
            <div className={`p-4 bg-gray-900 ${isExpanded ? 'h-auto' : ''}`}>
              <h3
                className="text-white font-bold text-lg mb-3 truncate cursor-pointer hover:text-blue-400 transition-colors"
                title={product.product_name}
                onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
              >
                {product.product_name}
              </h3>

              {isExpanded && (
                <div className="mb-3 text-sm text-gray-400 max-h-32 overflow-y-auto">
                  <p className="mb-2">
                    <strong>Created:</strong> {new Date(product.created_at).toLocaleDateString()}
                  </p>
                  <p className="mb-3">
                    <strong>Logic Code:</strong>
                  </p>
                  <pre className="bg-black p-2 rounded text-xs overflow-x-auto max-h-24">
                    {product.logic_code.substring(0, 200)}
                    {product.logic_code.length > 200 ? '...' : ''}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                    isExpanded
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                >
                  {isExpanded ? '✕ Close' : '🎮 Preview 3D'}
                </button>

                <button
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-200"
                  onClick={() => {
                    navigator.clipboard.writeText(product.logic_code);
                    // Optional: Show toast notification
                  }}
                  title="Copy logic code to clipboard"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Badge */}
            <div className="absolute top-2 right-2 bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-300 pointer-events-none flex items-center gap-1">
              <span>✓</span>
              <span>In Library</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}