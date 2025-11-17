
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';
import { describe, it, expect, vi } from 'vitest';

// Mock the WorkdayClientPage component because it has dependencies (firebase, dashboard data, etc)
// that would complicate a simple unit test.
vi.mock('./workday/client-page', () => {
    return {
        WorkdayClientPage: () => {
            return <div>Mocked Workday Client Page</div>;
        }
    };
});

describe('HomePage', () => {
    it('should render the workday client page', () => {
        render(<DashboardPage />);
        expect(screen.getByText('Mocked Workday Client Page')).toBeInTheDocument();
    });
});
