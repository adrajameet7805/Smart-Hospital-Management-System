import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QRCheckin from '../pages/patient/QRCheckin';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'John Doe', role: 'patient' } })
}));

describe('QRCheckin Component', () => {
  it('renders the scanner instruction', () => {
    render(<QRCheckin />);
    expect(screen.getByText('Hospital Check-In')).toBeInTheDocument();
  });
});
