import { describe, expect, test, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getCollaboration } from '../apps/web/app/api/collaboration/route'

const { createSupabaseServerClientMock } = vi.hoisted(() => ({
  createSupabaseServerClientMock: vi.fn(),
}))

const selectMock = vi.fn()
const eqProjectMock = vi.fn()
const eqActiveMock = vi.fn()
const fromMock = vi.fn()

vi.mock('@/app/utils/supabase/server', () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}))

describe('collaboration GET route', () => {
  test('returns 400 when projectId is missing', async () => {
    const request = new NextRequest('http://localhost/api/collaboration')

    const response = await getCollaboration(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'projectId is required' })
  })

  test('returns 500 when Supabase query fails', async () => {
    eqActiveMock.mockResolvedValueOnce({ data: null, error: { message: 'db unavailable' } })
    eqProjectMock.mockReturnValueOnce({ eq: eqActiveMock })
    selectMock.mockReturnValueOnce({ eq: eqProjectMock })
    fromMock.mockReturnValueOnce({ select: selectMock })
    createSupabaseServerClientMock.mockResolvedValueOnce({ from: fromMock })

    const request = new NextRequest('http://localhost/api/collaboration?projectId=project-1')
    const response = await getCollaboration(request)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to load collaboration sessions' })
  })
})
