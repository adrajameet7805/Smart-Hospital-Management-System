import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QRCheckin from '../pages/patient/QRCheckin';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ profile: null })
}));

describe('QRCheckin Component', () => {
  it('renders the scanner instruction', () => {
    render(<QRCheckin />);
    expect(screen.getByText('QR Patient Check-In')).toBeInTheDocument();
  });
});
