/**
 * Integration tests for authentication flow
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Mock axios
jest.mock('axios');
import axios from 'axios';

const MockedLogin = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

const MockedRegister = () => (
  <BrowserRouter>
    <Register />
  </BrowserRouter>
);

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Page', () => {
    test('renders login form', () => {
      render(<MockedLogin />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login|sign in/i })).toBeInTheDocument();
    });

    test('validates required fields', async () => {
      render(<MockedLogin />);
      
      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      render(<MockedLogin />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText(/valid.*email/i)).toBeInTheDocument();
      });
    });

    test('submits login form with valid data', async () => {
      axios.post.mockResolvedValue({
        data: {
          access_token: 'mock-token',
          user: { email: 'test@example.com' }
        }
      });

      render(<MockedLogin />);
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /login|sign in/i }));
      
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.objectContaining({
            email: 'test@example.com',
            password: 'Password123!'
          })
        );
      });
    });
  });

  describe('Register Page', () => {
    test('renders registration form', () => {
      render(<MockedRegister />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register|sign up/i })).toBeInTheDocument();
    });

    test('validates password strength', async () => {
      render(<MockedRegister />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.blur(passwordInput);
      
      await waitFor(() => {
        expect(screen.getByText(/password.*strong|at least/i)).toBeInTheDocument();
      });
    });

    test('submits registration form', async () => {
      axios.post.mockResolvedValue({
        data: {
          message: 'Registration successful',
          user: { email: 'newuser@example.com' }
        }
      });

      render(<MockedRegister />);
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'StrongPassword123!' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /register|sign up/i }));
      
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/register'),
          expect.objectContaining({
            email: 'newuser@example.com',
            password: 'StrongPassword123!'
          })
        );
      });
    });
  });
});
