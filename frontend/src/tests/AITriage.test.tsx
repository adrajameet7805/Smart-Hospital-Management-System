import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AITriage from '../pages/shared/AITriage';

// Mock context and router
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'patient' } })
}));

describe('AITriage Component', () => {
  it('renders the triage heading', () => {
    render(<AITriage />);
    expect(screen.getByText('AI Symptom Triage')).toBeInTheDocument();
    expect(screen.getByText('Get an instant preliminary assessment based on your symptoms.')).toBeInTheDocument();
  });
});
