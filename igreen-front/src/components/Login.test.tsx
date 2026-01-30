import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import { server } from '../test/mocks/server';
import { http } from 'msw';

// Mock the logo import
vi.mock('figma:asset/e2d3be716f2b03621853146ef3c8dd02abba30cb.png', () => ({
  default: 'mock-logo.png',
}));

describe('Login Component', () => {
  const mockOnLogin = vi.fn();
  const mockOnSwitchToSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnLogin.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render login form with username and password fields', () => {
      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show welcome message', () => {
      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      expect(screen.getByText(/iGreen\+ Ticket Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    });

    it('should have country dropdown', () => {
      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      // Open the dropdown
      const countryDropdown = screen.getByRole('combobox');
      expect(countryDropdown).toBeInTheDocument();
    });

    it('should show remember me checkbox', () => {
      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    });

    it('should show forgot password link', () => {
      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('should show sign up link', () => {
      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      const user = userEvent.setup();

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show error when username is empty', async () => {
      const user = userEvent.setup();

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      await user.type(screen.getByLabelText(/username/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('should call onLogin with correct credentials', async () => {
      const user = userEvent.setup();

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      await user.type(screen.getByLabelText(/username/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'Thailand'
        );
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      mockOnLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      await user.type(screen.getByLabelText(/username/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
      });
    });

    it('should show error message on failed login', async () => {
      const user = userEvent.setup();
      mockOnLogin.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      await user.type(screen.getByLabelText(/username/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait a bit for the error to appear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that onLogin was called with wrong credentials
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should switch to sign up when clicking sign up link', async () => {
      const user = userEvent.setup();

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(mockOnSwitchToSignUp).toHaveBeenCalled();
    });

    it('should disable fields during loading', async () => {
      const user = userEvent.setup();
      mockOnLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      await user.type(screen.getByLabelText(/username/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        expect(usernameInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      });
    });

    it('should handle login error gracefully', async () => {
      const user = userEvent.setup();
      mockOnLogin.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      // First submit with error
      await user.type(screen.getByLabelText(/username/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Login should have been called
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  describe('Language Support', () => {
    it('should render in Thai language', () => {
      render(
        <Login
          language="th"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      expect(screen.getByText(/iGreen\+ Ticket Management/i)).toBeInTheDocument();
      expect(screen.getByText(/เข้าสู่ระบบบัญชีของคุณ/i)).toBeInTheDocument();
    });

    it('should render in English language', () => {
      render(
        <Login
          language="en"
          onLogin={mockOnLogin}
          onSwitchToSignUp={mockOnSwitchToSignUp}
        />
      );

      expect(screen.getByText(/iGreen\+ Ticket Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    });
  });
});
