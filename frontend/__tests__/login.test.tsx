import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/axios');
jest.mock('next/navigation');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock the I18n hook
jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        loginTitle: 'Sign in to your account',
        loginSubtitle: 'Enter your Login ID (Email/Username/Student ID) and password.',
        loginIdLabel: 'Login ID',
        loginPasswordLabel: 'Password',
        loginRememberMe: 'Remember me',
        loginForgotPassword: 'Forgot password?',
        loginBackToHome: 'Back to Home',
        loginButton: 'Sign In',
        loginLoading: 'Signing in...',
        loginIdPlaceholder: 'e.g., AHC-1001 or your email',
        loginPasswordPlaceholder: 'Enter your password',
        loginErrorInvalid: 'Invalid login ID or password.',
        loginErrorNetwork: 'Network error. Please check your connection.',
        collegeName: 'Aharam High Standard College',
      };
      return translations[key] || key;
    },
    lang: 'en',
  }),
}));

describe('LoginPage', () => {
  const mockRouter = { push: jest.fn() };
  const mockApiPost = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.post as jest.Mock) = mockApiPost;
    localStorage.clear();
    window.location.href = '/'; // Reset location
  });

  test('should render login form with Login ID field', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('Login ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('should accept Student ID as Login ID', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        id: 1,
        username: 'AHC-1001',
        displayName: 'John Doe',
        role: 'STUDENT',
        requirePasswordChange: false,
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'AHC-1001');
    await userEvent.type(passwordInput, 'TestPassword123!');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        loginId: 'AHC-1001',
        password: 'TestPassword123!',
      });
    });
  });

  test('should accept email as Login ID', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        id: 2,
        username: 'staff@example.com',
        displayName: 'Jane Smith',
        role: 'STAFF',
        requirePasswordChange: false,
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'staff@example.com');
    await userEvent.type(passwordInput, 'TestPassword123!');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        loginId: 'staff@example.com',
        password: 'TestPassword123!',
      });
    });
  });

  test('should store username in localStorage on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'test-token-123',
        id: 1,
        username: 'AHC-1001',
        displayName: 'John Doe',
        role: 'STUDENT',
        requirePasswordChange: false,
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'AHC-1001');
    await userEvent.type(passwordInput, 'TestPassword123!');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('username')).toBe('AHC-1001');
      expect(localStorage.getItem('token')).toBe('test-token-123');
      expect(localStorage.getItem('userRole')).toBe('STUDENT');
      expect(localStorage.getItem('name')).toBe('John Doe');
      expect(localStorage.getItem('userId')).toBe('1');
    });
  });

  test('should redirect to student dashboard for student role', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        id: 1,
        username: 'AHC-1001',
        displayName: 'John Doe',
        role: 'STUDENT',
        requirePasswordChange: false,
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'AHC-1001');
    await userEvent.type(passwordInput, 'TestPassword123!');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.href).toBe('/student-dashboard');
    });
  });

  test('should redirect to admin dashboard for staff role', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        id: 2,
        username: 'admin@example.com',
        displayName: 'Admin User',
        role: 'STAFF',
        requirePasswordChange: false,
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'admin@example.com');
    await userEvent.type(passwordInput, 'TestPassword123!');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });

  test('should require password change if flag is set', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        id: 1,
        username: 'AHC-1001',
        displayName: 'John Doe',
        role: 'STUDENT',
        requirePasswordChange: true,
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'AHC-1001');
    await userEvent.type(passwordInput, 'TestPassword123!');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('requirePasswordChange')).toBe('true');
      expect(window.location.href).toBe('/change-password');
    });
  });

  test('should display error for invalid credentials', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Invalid login ID or password.' } },
    });

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'AHC-1001');
    await userEvent.type(passwordInput, 'WrongPassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid login ID or password/i)).toBeInTheDocument();
    });
  });

  test('should disable submit button when fields are empty', () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when both fields are filled', async () => {
    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, 'AHC-1001');
    await userEvent.type(passwordInput, 'TestPassword123!');

    expect(submitButton).not.toBeDisabled();
  });

  test('should trim whitespace from login ID', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        id: 1,
        username: 'AHC-1001',
        displayName: 'John Doe',
        role: 'STUDENT',
        requirePasswordChange: false,
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const loginIdInput = screen.getByPlaceholderText('e.g., AHC-1001 or your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(loginIdInput, '  AHC-1001  ');
    await userEvent.type(passwordInput, 'TestPassword123!');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        loginId: 'AHC-1001',
        password: 'TestPassword123!',
      });
    });
  });
});
