
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';
import { describe, it, expect, vi } from 'vitest';

// Mock the DashboardClientPage component because it likely has its own dependencies (firebase, etc)
// that would complicate a simple unit test.
vi.mock('./client-page', () => {
    return {
        DashboardClientPage: () => {
            return <div>Mocked Dashboard Client Page</div>;
        }
    };
});

describe('DashboardPage', () => {
    it('should render the client page', () => {
        render(<DashboardPage />);
        expect(screen.getByText('Mocked Dashboard Client Page')).toBeInTheDocument();
    });
});
