import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import Header from '../Header';
import * as AuthStore from '@/lib/auth-store';

// Mock the auth store
const mockAuthState = {
  user: { 
    id: '1', 
    email: 'test@example.com',
    user_metadata: { name: 'Test User' }
  },
  tokens: { access_token: 'token123' },
  isAuthenticated: true,
  isLoading: false,
  error: null
};

const mockLogout = vi.fn();

vi.mock('@/lib/auth-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth-store')>();
  return {
    ...actual,
    useAuthState: () => mockAuthState,
    useAuth: () => ({
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      clearError: vi.fn(),
    }),
  };
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header with title', () => {
    render(<Header title="Test Dashboard" />);

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(<Header title="Test Dashboard" />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should fallback to email when no name is available', () => {
    const authStateWithoutName = {
      ...mockAuthState,
      user: { 
        id: '1', 
        email: 'test@example.com',
        user_metadata: {}
      }
    };

    vi.spyOn(AuthStore, 'useAuthState').mockReturnValue(authStateWithoutName);

    render(<Header title="Test Dashboard" />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should fallback to "User" when no user data', () => {
    const authStateWithoutUser = {
      ...mockAuthState,
      user: null
    };

    vi.spyOn(AuthStore, 'useAuthState').mockReturnValue(authStateWithoutUser);

    render(<Header title="Test Dashboard" />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should show search icon', () => {
    render(<Header title="Test Dashboard" />);

    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should show notifications icon', () => {
    render(<Header title="Test Dashboard" />);

    const bellIcon = screen.getByTestId('bell-icon');
    expect(bellIcon).toBeInTheDocument();
  });

  it('should show user avatar', () => {
    render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    expect(userAvatar).toBeInTheDocument();
  });

  it('should open dropdown when user avatar is clicked', () => {
    render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    fireEvent.click(userAvatar);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    fireEvent.click(userAvatar);

    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Click outside the dropdown
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('should handle logout when logout is clicked', async () => {
    const mockPush = vi.fn();
    vi.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush
    });

    mockLogout.mockResolvedValue(undefined);

    render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    fireEvent.click(userAvatar);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle logout error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockLogout.mockRejectedValue(new Error('Logout failed'));

    render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    fireEvent.click(userAvatar);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should call onNavigate when profile is clicked', () => {
    const mockOnNavigate = vi.fn();
    render(<Header title="Test Dashboard" onNavigate={mockOnNavigate} />);

    const userAvatar = screen.getByTestId('user-avatar');
    fireEvent.click(userAvatar);

    const profileButton = screen.getByText('Profile');
    fireEvent.click(profileButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('profile');
  });

  it('should call onNavigate when settings is clicked', () => {
    const mockOnNavigate = vi.fn();
    render(<Header title="Test Dashboard" onNavigate={mockOnNavigate} />);

    const userAvatar = screen.getByTestId('user-avatar');
    fireEvent.click(userAvatar);

    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('settings');
  });

  it('should have proper accessibility attributes', () => {
    render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    expect(userAvatar).toHaveAttribute('aria-label', 'User menu');

    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toHaveAttribute('aria-label', 'Search');

    const bellIcon = screen.getByTestId('bell-icon');
    expect(bellIcon).toHaveAttribute('aria-label', 'Notifications');
  });

  it('should display correct title prop', () => {
    const customTitle = 'Custom Dashboard Title';
    render(<Header title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('should have proper CSS classes for styling', () => {
    render(<Header title="Test Dashboard" />);

    const header = screen.getByText('Test Dashboard').closest('header');
    expect(header).toHaveClass('bg-white', 'border-b', 'border-gray-200');
  });

  it('should handle keyboard navigation', () => {
    render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    
    // Test Enter key
    fireEvent.keyDown(userAvatar, { key: 'Enter', code: 'Enter' });
    
    // Test Space key
    fireEvent.keyDown(userAvatar, { key: ' ', code: 'Space' });
    
    // Should not open dropdown with other keys
    fireEvent.keyDown(userAvatar, { key: 'Tab', code: 'Tab' });
    
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(<Header title="Test Dashboard" />);

    const userAvatar = screen.getByTestId('user-avatar');
    fireEvent.click(userAvatar);

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });
});
