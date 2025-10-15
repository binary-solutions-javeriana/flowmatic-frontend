import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import ProjectsGrid from '../ProjectsGrid';
import type { Project as BackendProject } from '@/lib/projects/types';

// Mock the ProjectModal component
vi.mock('../ProjectModal', () => ({
  default: ({ isOpen, onClose, onSubmit, mode }: any) => (
    isOpen ? (
      <div data-testid="project-modal">
        <div>Modal is open in {mode} mode</div>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSubmit}>Submit Modal</button>
      </div>
    ) : null
  )
}));

describe('ProjectsGrid', () => {
  const mockBackendProjects: BackendProject[] = [
    {
      proyect_id: 1,
      name_proyect: 'Test Project 1',
      description: 'Description 1',
      state: 'In Progress',
      type: 'Web Development',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      created_by: 1,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    },
    {
      proyect_id: 2,
      name_proyect: 'Test Project 2',
      description: 'Description 2',
      state: 'Planning',
      type: 'Mobile App',
      start_date: '2025-02-01',
      end_date: '2025-11-30',
      created_by: 1,
      created_at: '2025-01-02T00:00:00.000Z',
      updated_at: '2025-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render grid with projects', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    expect(screen.getByText('All Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('should render "New Project" button', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
  });

  it('should open modal when "New Project" button is clicked', async () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    const newProjectButton = screen.getByRole('button', { name: /new project/i });
    fireEvent.click(newProjectButton);

    await waitFor(() => {
      expect(screen.getByTestId('project-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal is open in create mode')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    const newProjectButton = screen.getByRole('button', { name: /new project/i });
    fireEvent.click(newProjectButton);

    await waitFor(() => {
      expect(screen.getByTestId('project-modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('project-modal')).not.toBeInTheDocument();
    });
  });

  it('should handle project creation submission', async () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    const newProjectButton = screen.getByRole('button', { name: /new project/i });
    fireEvent.click(newProjectButton);

    await waitFor(() => {
      expect(screen.getByTestId('project-modal')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit modal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByTestId('project-modal')).not.toBeInTheDocument();
    });
  });

  it('should render empty state when no projects', () => {
    render(<ProjectsGrid projects={[]} />);

    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first project/i })).toBeInTheDocument();
  });

  it('should open modal from empty state', async () => {
    render(<ProjectsGrid projects={[]} />);

    const createFirstButton = screen.getByRole('button', { name: /create your first project/i });
    fireEvent.click(createFirstButton);

    await waitFor(() => {
      expect(screen.getByTestId('project-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal is open in create mode')).toBeInTheDocument();
    });
  });

  it('should display project information correctly', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    // Check project names
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  it('should display progress information', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    // Check for progress labels (these would be calculated by the utils)
    expect(screen.getAllByText(/progress/i)).toHaveLength(mockBackendProjects.length);
  });

  it('should display team and due date information', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    // Check for team and calendar icons (these would be rendered by the component)
    const teamElements = screen.getAllByText(/members/i);
    const calendarElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/i);

    expect(teamElements.length).toBeGreaterThan(0);
    expect(calendarElements.length).toBeGreaterThan(0);
  });

  it('should have proper CSS classes for styling', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    const container = screen.getByText('All Projects').closest('div');
    expect(container).toHaveClass('space-y-6');

    const grid = screen.getByText('Test Project 1').closest('.grid');
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  });

  it('should handle hover effects on project cards', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    const projectCard = screen.getByText('Test Project 1').closest('div');
    expect(projectCard).toHaveClass('hover:shadow-xl', 'transition-all', 'duration-300', 'cursor-pointer');
  });

  it('should render with proper accessibility attributes', () => {
    render(<ProjectsGrid projects={mockBackendProjects} />);

    const newProjectButton = screen.getByRole('button', { name: /new project/i });
    expect(newProjectButton).toBeInTheDocument();
    expect(newProjectButton).not.toBeDisabled();
  });

  it('should update projects when backend projects change', () => {
    const { rerender } = render(<ProjectsGrid projects={mockBackendProjects} />);

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();

    const updatedProjects = [
      ...mockBackendProjects,
      {
        proyect_id: 3,
        name_proyect: 'New Project',
        state: 'Planning',
        created_by: 1,
        created_at: '2025-01-03T00:00:00.000Z',
        updated_at: '2025-01-03T00:00:00.000Z'
      }
    ];

    rerender(<ProjectsGrid projects={updatedProjects} />);

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('should handle projects with missing optional fields', () => {
    const projectsWithMissingFields: BackendProject[] = [
      {
        proyect_id: 1,
        name_proyect: 'Minimal Project',
        state: 'Planning',
        created_by: 1,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      }
    ];

    render(<ProjectsGrid projects={projectsWithMissingFields} />);

    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });
});
