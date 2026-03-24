import { beforeEach, describe, expect, it, vi } from 'vitest'
import { promoteTempScene } from '../promoteTempScene'

const download = vi.fn()
const upload = vi.fn()
const list = vi.fn()

const client = {
  storage: {
    from: () => ({ download, upload, list }),
  },
}

describe('promoteTempScene', () => {
  beforeEach(() => {
    download.mockReset()
    upload.mockReset()
    list.mockReset()
  })

  it('throws if no files in temp', async () => {
    download.mockResolvedValueOnce({ data: new Blob(['{}']), error: null })
    upload.mockResolvedValueOnce({ error: null })
    list.mockResolvedValueOnce({ data: [], error: null })

    await expect(
      promoteTempScene({
        jobId: 'job1',
        projectId: 'proj1',
        sceneId: 'scene1',
        client,
        publicBaseUrl: 'https://example.supabase.co',
      }),
    ).rejects.toThrow('No files in temp')
  })

  it('promotes scene.json and assets to final bucket', async () => {
    download
      .mockResolvedValueOnce({ data: new Blob(['{}']), error: null })
      .mockResolvedValueOnce({ data: new Blob(['asset']), error: null })
    upload.mockResolvedValue({ error: null })
    list.mockResolvedValueOnce({ data: [{ name: 'assets/tree.glb' }], error: null })

    const result = await promoteTempScene({
      jobId: 'job1',
      projectId: 'proj1',
      sceneId: 'scene1',
      client,
      publicBaseUrl: 'https://example.supabase.co',
    })

    expect(upload).toHaveBeenCalledTimes(2)
    expect(result.sceneUrl).toContain('/projects/projects/proj1/scenes/scene1/scene.json')
  })
})
