import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProjectCard } from '../ProjectCard';
import type { Project } from '@/lib/types/project-types';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ProjectCard', () => {
  const mockProject: Project = {
    proyect_id: 1,
    name_proyect: 'Test Project',
    description: 'This is a test project description',
    state: 'In Progress',
    type: 'Web Development',
    start_date: '2025-01-01T00:00:00.000Z',
    end_date: '2025-12-31T00:00:00.000Z',
    created_by: 1,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-15T00:00:00.000Z'
  };

  it('should render project card with all information', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
  });

  it('should render correct link href', () => {
    render(<ProjectCard project={mockProject} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard/projects/1');
  });

  it('should display formatted dates correctly', () => {
    render(<ProjectCard project={mockProject} />);

    // Check for start date
    expect(screen.getByText(/start: 1\/1\/2025/i)).toBeInTheDocument();
    // Check for end date
    expect(screen.getByText(/end: 12\/31\/2025/i)).toBeInTheDocument();
    // Check for updated date
    expect(screen.getByText(/updated 1\/15\/2025/i)).toBeInTheDocument();
  });

  it('should apply correct status color for In Progress', () => {
    render(<ProjectCard project={mockProject} />);

    const statusBadge = screen.getByText('In Progress');
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should apply correct status color for Planning', () => {
    const planningProject = { ...mockProject, state: 'Planning' };
    render(<ProjectCard project={planningProject} />);

    const statusBadge = screen.getByText('Planning');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should apply correct status color for Completed', () => {
    const completedProject = { ...mockProject, state: 'Completed' };
    render(<ProjectCard project={completedProject} />);

    const statusBadge = screen.getByText('Completed');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should apply correct status color for On Hold', () => {
    const onHoldProject = { ...mockProject, state: 'On Hold' };
    render(<ProjectCard project={onHoldProject} />);

    const statusBadge = screen.getByText('On Hold');
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should apply correct status color for Cancelled', () => {
    const cancelledProject = { ...mockProject, state: 'Cancelled' };
    render(<ProjectCard project={cancelledProject} />);

    const statusBadge = screen.getByText('Cancelled');
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should handle project without description', () => {
    const projectWithoutDescription = { ...mockProject, description: undefined };
    render(<ProjectCard project={projectWithoutDescription} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('This is a test project description')).not.toBeInTheDocument();
  });

  it('should handle project without type', () => {
    const projectWithoutType = { ...mockProject, type: undefined };
    render(<ProjectCard project={projectWithoutType} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
  });

  it('should handle project without start date', () => {
    const projectWithoutStartDate = { ...mockProject, start_date: undefined };
    render(<ProjectCard project={projectWithoutStartDate} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText(/start:/i)).not.toBeInTheDocument();
  });

  it('should handle project without end date', () => {
    const projectWithoutEndDate = { ...mockProject, end_date: undefined };
    render(<ProjectCard project={projectWithoutEndDate} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText(/end:/i)).not.toBeInTheDocument();
  });

  it('should handle unknown status with default styling', () => {
    const projectWithUnknownStatus = { ...mockProject, state: 'Unknown Status' };
    render(<ProjectCard project={projectWithUnknownStatus} />);

    const statusBadge = screen.getByText('Unknown Status');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should have proper accessibility attributes', () => {
    render(<ProjectCard project={mockProject} />);

    const card = screen.getByRole('link');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('href', '/dashboard/projects/1');
  });

  it('should display type badge correctly', () => {
    render(<ProjectCard project={mockProject} />);

    const typeBadge = screen.getByText('Web Development');
    expect(typeBadge).toHaveClass('bg-blue-50', 'text-blue-600');
  });

  it('should handle long project names', () => {
    const longNameProject = {
      ...mockProject,
      name_proyect: 'This is a very long project name that should be truncated properly'
    };
    render(<ProjectCard project={longNameProject} />);

    expect(screen.getByText(longNameProject.name_proyect)).toBeInTheDocument();
  });

  it('should handle long descriptions', () => {
    const longDescriptionProject = {
      ...mockProject,
      description: 'This is a very long description that should be truncated with line-clamp-2 class'
    };
    render(<ProjectCard project={longDescriptionProject} />);

    expect(screen.getByText(longDescriptionProject.description)).toBeInTheDocument();
  });

  it('should have hover effects', () => {
    render(<ProjectCard project={mockProject} />);

    const card = screen.getByRole('link');
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow', 'cursor-pointer');
  });

  it('should render with minimal required data', () => {
    const minimalProject: Project = {
      proyect_id: 2,
      name_proyect: 'Minimal Project',
      state: 'Planning',
      created_by: 1,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    };

    render(<ProjectCard project={minimalProject} />);

    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
    expect(screen.getByText('Planning')).toBeInTheDocument();
    expect(screen.getByText(/updated 1\/1\/2025/i)).toBeInTheDocument();
  });
});
