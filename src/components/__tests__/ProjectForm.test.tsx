import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { ProjectForm } from '../ProjectForm';
import * as AuthStore from '@/lib/auth-store';
import * as ProjectsHooks from '@/lib/hooks/use-projects';

// Mock the auth store
const mockAuthState = {
  user: { id: '1', email: 'test@example.com' },
  tokens: { access_token: 'token123' },
  isAuthenticated: true,
  isLoading: false,
  error: null
};

vi.mock('@/lib/auth-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth-store')>();
  return {
    ...actual,
    useAuth: () => ({
      state: mockAuthState,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    }),
  };
});

// Mock the projects hooks
const mockCreateProject = vi.fn();
const mockUpdateProject = vi.fn();

vi.mock('@/lib/hooks/use-projects', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/hooks/use-projects')>();
  return {
    ...actual,
    useCreateProject: () => ({
      createProject: mockCreateProject,
      loading: false,
      error: null,
    }),
    useUpdateProject: () => ({
      updateProject: mockUpdateProject,
      loading: false,
      error: null,
    }),
  };
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('ProjectForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(<ProjectForm />);

      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();

      // Check submit button text
      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    });

    it('should show validation for required fields', async () => {
      render(<ProjectForm />);

      const submitButton = screen.getByRole('button', { name: /create project/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/project name/i);
        const stateSelect = screen.getByLabelText(/status/i);
        expect(nameInput).toBeRequired();
        expect(stateSelect).toBeRequired();
      });
    });

    it('should submit form with valid data for creation', async () => {
      mockCreateProject.mockResolvedValue({ proyect_id: 1 });

      render(<ProjectForm />);

      const nameInput = screen.getByLabelText(/project name/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const stateSelect = screen.getByLabelText(/status/i);
      const typeInput = screen.getByLabelText(/project type/i);
      const submitButton = screen.getByRole('button', { name: /create project/i });

      fireEvent.change(nameInput, { target: { value: 'Test Project' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      fireEvent.change(stateSelect, { target: { value: 'In Progress' } });
      fireEvent.change(typeInput, { target: { value: 'Web Development' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          name_proyect: 'Test Project',
          description: 'Test Description',
          state: 'In Progress',
          type: 'Web Development',
          start_date: '',
          end_date: '',
          created_by: 1
        });
      });
    });

    it('should handle date inputs correctly', async () => {
      render(<ProjectForm />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2025-12-31' } });

      expect(startDateInput).toHaveValue('2025-01-01');
      expect(endDateInput).toHaveValue('2025-12-31');
    });
  });

  describe('Edit Mode', () => {
    const mockProject = {
      proyect_id: 1,
      name_proyect: 'Existing Project',
      description: 'Existing Description',
      state: 'Completed',
      type: 'Mobile App',
      start_date: '2025-01-01T00:00:00.000Z',
      end_date: '2025-12-31T00:00:00.000Z',
      created_by: 1,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    };

    it('should render edit form with existing data', () => {
      render(<ProjectForm project={mockProject} isEdit={true} />);

      expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Completed')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mobile App')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /update project/i })).toBeInTheDocument();
    });

    it('should submit form with updated data', async () => {
      mockUpdateProject.mockResolvedValue({ proyect_id: 1 });

      render(<ProjectForm project={mockProject} isEdit={true} />);

      const nameInput = screen.getByDisplayValue('Existing Project');
      const submitButton = screen.getByRole('button', { name: /update project/i });

      fireEvent.change(nameInput, { target: { value: 'Updated Project' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith(1, {
          name_proyect: 'Updated Project',
          description: 'Existing Description',
          state: 'Completed',
          type: 'Mobile App',
          start_date: '2025-01-01',
          end_date: '2025-12-31'
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during creation', async () => {
      vi.spyOn(ProjectsHooks, 'useCreateProject').mockReturnValue({
        createProject: mockCreateProject,
        loading: true,
        error: null,
      });

      render(<ProjectForm />);

      expect(screen.getByText(/creating/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    it('should show loading state during update', async () => {
      const mockProject = {
        proyect_id: 1,
        name_proyect: 'Test Project',
        state: 'Planning',
        created_by: 1,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      };

      vi.spyOn(ProjectsHooks, 'useUpdateProject').mockReturnValue({
        updateProject: mockUpdateProject,
        loading: true,
        error: null,
      });

      render(<ProjectForm project={mockProject} isEdit={true} />);

      expect(screen.getByText(/updating/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display creation error', () => {
      vi.spyOn(ProjectsHooks, 'useCreateProject').mockReturnValue({
        createProject: mockCreateProject,
        loading: false,
        error: 'Failed to create project',
      });

      render(<ProjectForm />);

      expect(screen.getByText(/failed to create project/i)).toBeInTheDocument();
    });

    it('should display update error', () => {
      const mockProject = {
        proyect_id: 1,
        name_proyect: 'Test Project',
        state: 'Planning',
        created_by: 1,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      };

      vi.spyOn(ProjectsHooks, 'useUpdateProject').mockReturnValue({
        updateProject: mockUpdateProject,
        loading: false,
        error: 'Failed to update project',
      });

      render(<ProjectForm project={mockProject} isEdit={true} />);

      expect(screen.getByText(/failed to update project/i)).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback when provided', async () => {
      const mockOnSuccess = vi.fn();
      mockCreateProject.mockResolvedValue({ proyect_id: 1 });

      render(<ProjectForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/project name/i);
      const submitButton = screen.getByRole('button', { name: /create project/i });

      fireEvent.change(nameInput, { target: { value: 'Test Project' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should call onCancel callback when cancel is clicked', () => {
      const mockOnCancel = vi.fn();

      render(<ProjectForm onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should handle empty optional fields correctly', async () => {
      mockCreateProject.mockResolvedValue({ proyect_id: 1 });

      render(<ProjectForm />);

      const nameInput = screen.getByLabelText(/project name/i);
      const submitButton = screen.getByRole('button', { name: /create project/i });

      fireEvent.change(nameInput, { target: { value: 'Test Project' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          name_proyect: 'Test Project',
          description: undefined,
          state: 'Planning',
          type: undefined,
          start_date: undefined,
          end_date: undefined,
          created_by: 1
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels and form structure', () => {
      render(<ProjectForm />);

      // Check required fields have proper labels
      expect(screen.getByLabelText(/project name/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/status/i)).toHaveAttribute('required');

      // Check form structure
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper button states', () => {
      render(<ProjectForm />);

      const submitButton = screen.getByRole('button', { name: /create project/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(submitButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });
});
