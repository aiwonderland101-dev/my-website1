'use client'

import React, { useCallback, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  Loader2,
} from 'lucide-react'

interface UploadFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
  uploadedAt?: number
}

interface FileUploadProgressProps {
  onFileSelect?: (files: File[]) => void
}

export function FileUploadProgress({
  onFileSelect,
}: FileUploadProgressProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    },
    []
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files))
      }
    },
    []
  )

  const addFiles = (newFiles: File[]) => {
    const newUploadFiles = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'idle' as const,
    }))

    setFiles((prev) => [...prev, ...newUploadFiles])
    onFileSelect?.(newFiles)

    // Auto-upload files
    newUploadFiles.forEach((uploadFile, idx) => {
      uploadFile_(uploadFile.id, newFiles[idx])
    })
  }

  const uploadFile_ = async (fileId: string, file: File) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: 'uploading', progress: 0 } : f
      )
    )

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: Math.round(progress) } : f
            )
          )
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: 'success', progress: 100, uploadedAt: Date.now() }
                : f
            )
          )
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: 'error',
                    error: `Upload failed (${xhr.status})`,
                  }
                : f
            )
          )
        }
      })

      xhr.addEventListener('error', () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'error', error: 'Network error' }
              : f
          )
        )
      })

      xhr.open('POST', '/api/assets/upload')
      xhr.send(formData)
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      )
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const retryFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (file) {
      // For now, just reset progress - in production, you'd re-upload
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'idle', progress: 0, error: undefined }
            : f
        )
      )
    }
  }

  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount = files.filter((f) => f.status === 'error').length
  const uploadingCount = files.filter((f) => f.status === 'uploading').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Asset Upload Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="flex flex-col items-center cursor-pointer"
          >
            <Cloud className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-900">
              Drag files here or click to upload
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Supports images, models, textures (WebP, PNG, GLB, GLTF, etc.)
            </span>
          </label>
        </div>

        {/* Stats Summary */}
        {files.length > 0 && (
          <div className="flex gap-4">
            {uploadingCount > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border-0">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {uploadingCount} uploading
              </Badge>
            )}
            {successCount > 0 && (
              <Badge className="bg-green-100 text-green-800 border-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {successCount} uploaded
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge className="bg-red-100 text-red-800 border-0">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errorCount} failed
              </Badge>
            )}
          </div>
        )}

        {/* File List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {file.status === 'uploading' && (
                <div className="space-y-1">
                  <Progress value={file.progress} className="h-2" />
                  <p className="text-xs text-gray-500 text-right">
                    {file.progress}%
                  </p>
                </div>
              )}

              {file.status === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Uploaded & ready to use</span>
                </div>
              )}

              {file.status === 'error' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{file.error || 'Upload failed'}</span>
                  </div>
                  <button
                    onClick={() => retryFile(file.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No files uploaded yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
