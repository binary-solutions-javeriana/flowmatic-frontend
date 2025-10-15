import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject, useRecentProjects } from '../use-projects';
import { authApi } from '../../authenticated-api';

// Mock the authenticated API
vi.mock('../../authenticated-api', () => ({
  authApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch projects successfully', async () => {
    const mockProjectsResponse = {
      data: [
        {
          proyect_id: 1,
          name_proyect: 'Test Project',
          state: 'Planning',
          created_by: 1,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z'
        }
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };

    vi.mocked(authApi.get).mockResolvedValue(mockProjectsResponse);

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjectsResponse.data);
    expect(result.current.pagination).toEqual(mockProjectsResponse.meta);
    expect(result.current.error).toBeNull();
    expect(authApi.get).toHaveBeenCalledWith('/projects?page=1&limit=10');
  });

  it('should handle fetch projects with filters', async () => {
    const mockProjectsResponse = {
      data: [],
      meta: {
        page: 2,
        limit: 5,
        total: 0,
        totalPages: 0
      }
    };

    vi.mocked(authApi.get).mockResolvedValue(mockProjectsResponse);

    const filters = {
      page: 2,
      limit: 5,
      search: 'test',
      status: 'In Progress',
      type: 'Web Development',
      orderBy: 'name_proyect',
      order: 'asc' as const
    };

    const { result } = renderHook(() => useProjects(filters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.get).toHaveBeenCalledWith(
      '/projects?page=2&limit=5&search=test&status=In+Progress&type=Web+Development&orderBy=name_proyect&order=asc'
    );
  });

  it('should handle fetch projects error', async () => {
    const errorMessage = 'Network error';
    vi.mocked(authApi.get).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.pagination).toBeNull();
  });

  it('should refetch projects when refetch is called', async () => {
    const mockProjectsResponse = {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };

    vi.mocked(authApi.get).mockResolvedValue(mockProjectsResponse);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Call refetch
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.get).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid response format', async () => {
    vi.mocked(authApi.get).mockResolvedValue(null);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Invalid response format: response is not an object');
  });

  it('should handle response without data array', async () => {
    vi.mocked(authApi.get).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Invalid response format: data is missing');
  });
});

describe('useProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single project successfully', async () => {
    const mockProject = {
      proyect_id: 1,
      name_proyect: 'Test Project',
      state: 'Planning',
      created_by: 1,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    };

    vi.mocked(authApi.get).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useProject(1));

    expect(result.current.loading).toBe(true);
    expect(result.current.project).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.project).toEqual(mockProject);
    expect(result.current.error).toBeNull();
    expect(authApi.get).toHaveBeenCalledWith('/projects/1');
  });

  it('should handle fetch project error', async () => {
    const errorMessage = 'Project not found';
    vi.mocked(authApi.get).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProject(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.project).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('should not fetch when projectId is falsy', () => {
    renderHook(() => useProject(0));

    expect(authApi.get).not.toHaveBeenCalled();
  });

  it('should refetch project when refetch is called', async () => {
    const mockProject = {
      proyect_id: 1,
      name_proyect: 'Test Project',
      state: 'Planning',
      created_by: 1,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    };

    vi.mocked(authApi.get).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useProject(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.clearAllMocks();

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.get).toHaveBeenCalledWith('/projects/1');
  });
});

describe('useCreateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create project successfully', async () => {
    const mockProject = {
      proyect_id: 1,
      name_proyect: 'New Project',
      state: 'Planning',
      created_by: 1,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    };

    const createData = {
      name_proyect: 'New Project',
      state: 'Planning',
      created_by: 1
    };

    vi.mocked(authApi.post).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useCreateProject());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    let createdProject: any;
    await act(async () => {
      createdProject = await result.current.createProject(createData);
    });

    expect(createdProject).toEqual(mockProject);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(authApi.post).toHaveBeenCalledWith('/projects', createData);
  });

  it('should handle create project error', async () => {
    const errorMessage = 'Failed to create project';
    vi.mocked(authApi.post).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCreateProject());

    const createData = {
      name_proyect: 'New Project',
      state: 'Planning',
      created_by: 1
    };

    let createdProject: any;
    await act(async () => {
      createdProject = await result.current.createProject(createData);
    });

    expect(createdProject).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('should clear error when clearError is called', async () => {
    const errorMessage = 'Failed to create project';
    vi.mocked(authApi.post).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCreateProject());

    const createData = {
      name_proyect: 'New Project',
      state: 'Planning',
      created_by: 1
    };

    await act(async () => {
      await result.current.createProject(createData);
    });

    expect(result.current.error).toBe(errorMessage);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

describe('useUpdateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update project successfully', async () => {
    const mockProject = {
      proyect_id: 1,
      name_proyect: 'Updated Project',
      state: 'In Progress',
      created_by: 1,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    };

    const updateData = {
      name_proyect: 'Updated Project',
      state: 'In Progress'
    };

    vi.mocked(authApi.patch).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useUpdateProject());

    let updatedProject: any;
    await act(async () => {
      updatedProject = await result.current.updateProject(1, updateData);
    });

    expect(updatedProject).toEqual(mockProject);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(authApi.patch).toHaveBeenCalledWith('/projects/1', updateData);
  });

  it('should handle update project error', async () => {
    const errorMessage = 'Failed to update project';
    vi.mocked(authApi.patch).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUpdateProject());

    const updateData = { name_proyect: 'Updated Project' };

    let updatedProject: any;
    await act(async () => {
      updatedProject = await result.current.updateProject(1, updateData);
    });

    expect(updatedProject).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });
});

describe('useDeleteProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete project successfully', async () => {
    vi.mocked(authApi.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteProject());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteProject(1);
    });

    expect(deleteResult!).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(authApi.delete).toHaveBeenCalledWith('/projects/1');
  });

  it('should handle delete project error', async () => {
    const errorMessage = 'Failed to delete project';
    vi.mocked(authApi.delete).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDeleteProject());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteProject(1);
    });

    expect(deleteResult!).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });
});

describe('useRecentProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch recent projects successfully', async () => {
    const mockProjectsResponse = {
      data: [
        {
          proyect_id: 1,
          name_proyect: 'Recent Project 1',
          state: 'In Progress',
          created_by: 1,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-15T00:00:00.000Z'
        },
        {
          proyect_id: 2,
          name_proyect: 'Recent Project 2',
          state: 'Planning',
          created_by: 1,
          created_at: '2025-01-02T00:00:00.000Z',
          updated_at: '2025-01-14T00:00:00.000Z'
        }
      ]
    };

    vi.mocked(authApi.get).mockResolvedValue(mockProjectsResponse);

    const { result } = renderHook(() => useRecentProjects(5));

    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjectsResponse.data);
    expect(result.current.error).toBeNull();
    expect(authApi.get).toHaveBeenCalledWith('/projects?limit=5&orderBy=updated_at&order=desc');
  });

  it('should use default limit when not provided', async () => {
    const mockProjectsResponse = { data: [] };
    vi.mocked(authApi.get).mockResolvedValue(mockProjectsResponse);

    const { result } = renderHook(() => useRecentProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.get).toHaveBeenCalledWith('/projects?limit=5&orderBy=updated_at&order=desc');
  });

  it('should handle fetch recent projects error', async () => {
    const errorMessage = 'Failed to fetch recent projects';
    vi.mocked(authApi.get).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRecentProjects(3));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should refetch recent projects when refetch is called', async () => {
    const mockProjectsResponse = { data: [] };
    vi.mocked(authApi.get).mockResolvedValue(mockProjectsResponse);

    const { result } = renderHook(() => useRecentProjects(3));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.clearAllMocks();

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.get).toHaveBeenCalledWith('/projects?limit=3&orderBy=updated_at&order=desc');
  });
});
