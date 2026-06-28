import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AITriage from '../pages/shared/AITriage';

describe('AITriage Component', () => {
  it('renders the triage heading', () => {
    render(<AITriage />);
    expect(screen.getByText('AI Symptom Triage')).toBeInTheDocument();
    expect(screen.getByText('Select your symptoms for an AI-powered assessment. This is for informational purposes only.')).toBeInTheDocument();
  });
});
