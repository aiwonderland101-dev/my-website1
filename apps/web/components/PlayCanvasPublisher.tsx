"use client";

import { useState } from 'react';
import { publishProduct, usePublishingService } from '@/lib/services/publishingService';
import { ToastContainer, useToast } from '@/components/Toast';

interface PlayCanvasPublisherProps {
  onProductPublished?: () => void;
  className?: string;
}

export default function PlayCanvasPublisher({ onProductPublished, className = "" }: PlayCanvasPublisherProps) {
  const [productName, setProductName] = useState('');
  const [logicCode, setLogicCode] = useState('');
  const [glbBlob, setGlbBlob] = useState<Blob | null>(null);
  const { publish, isPublishing, error } = usePublishingService();
  const { toasts, addToast, removeToast, success, error: showError } = useToast();

  const handlePublish = async () => {
    if (!productName.trim()) {
      showError('Please enter a product name');
      return;
    }

    if (!logicCode.trim()) {
      showError('Please enter the logic code (Gemini 2.5 generated script)');
      return;
    }

    if (!glbBlob) {
      showError('Please provide a GLB file');
      return;
    }

    try {
      const success = await publish({
        productName: productName.trim(),
        logicCode: logicCode.trim(),
        glbBlob,
      });

      if (success) {
        success('Product successfully planted in the community library! 🌱');
        setProductName('');
        setLogicCode('');
        setGlbBlob(null);
        onProductPublished?.();
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to publish product');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'model/gltf-binary' && !file.name.endsWith('.glb')) {
        showError('Please select a valid GLB file');
        return;
      }
      setGlbBlob(file);
    }
  };

  const handleCaptureThumbnail = async () => {
    try {
      // This will be called from the PlayCanvas editor context
      // The captureThumbnail function will find the canvas automatically
      const thumbnailBlob = await import('@/lib/services/publishingService').then(m => m.captureThumbnail());

      // For now, just show success - in a real implementation,
      // this would be triggered from the PlayCanvas editor
      success('Thumbnail captured successfully! 📸');

    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to capture thumbnail');
    }
  };

  return (
    <>
      <div className={`bg-gray-900 border border-gray-700 rounded-lg p-6 ${className}`}>
        <h3 className="text-white text-xl font-bold mb-4">🌱 Plant in Community Library</h3>

        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-2">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter your product name..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPublishing}
            />
          </div>

          {/* Logic Code */}
          <div>
            <label htmlFor="logicCode" className="block text-sm font-medium text-gray-300 mb-2">
              Logic Code (Gemini 2.5 Script)
            </label>
            <textarea
              id="logicCode"
              value={logicCode}
              onChange={(e) => setLogicCode(e.target.value)}
              placeholder="Paste your Gemini 2.5 generated script here..."
              rows={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              disabled={isPublishing}
            />
          </div>

          {/* GLB File Upload */}
          <div>
            <label htmlFor="glbFile" className="block text-sm font-medium text-gray-300 mb-2">
              GLB Asset File
            </label>
            <input
              id="glbFile"
              type="file"
              accept=".glb"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              disabled={isPublishing}
            />
            {glbBlob && (
              <p className="mt-2 text-sm text-green-400">
                ✓ {glbBlob.name} ({(glbBlob.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Thumbnail Capture */}
          <div>
            <button
              onClick={handleCaptureThumbnail}
              disabled={isPublishing}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors duration-200"
            >
              📸 Capture Thumbnail from PlayCanvas
            </button>
            <p className="mt-2 text-xs text-gray-400">
              Make sure your PlayCanvas scene is loaded and visible
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded-md">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={isPublishing || !productName.trim() || !logicCode.trim() || !glbBlob}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-bold text-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isPublishing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Planting... 🌱
              </>
            ) : (
              '🌱 Plant in Library'
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-800 rounded-md">
          <h4 className="text-white font-semibold mb-2">How to Publish:</h4>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. Create your PlayCanvas scene and export as GLB</li>
            <li>2. Generate logic code using Gemini 2.5</li>
            <li>3. Enter product name and paste the logic code</li>
            <li>4. Upload your GLB file</li>
            <li>5. Capture thumbnail from your PlayCanvas scene</li>
            <li>6. Click "Plant in Library" to publish!</li>
          </ol>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}