
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectClientPage } from './client-page';
import { describe, it, expect, vi } from 'vitest';
import { useUser, useFirestore } from '@/firebase';
import { getProjects, getTasks } from '@/lib/data-firestore';
import { createProjectAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/firebase', () => ({
  useUser: vi.fn(),
  useFirestore: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/lib/data-firestore', () => ({
  getProjects: vi.fn(),
  getTasks: vi.fn(),
}));

vi.mock('@/app/actions', () => ({
  createProjectAction: vi.fn(),
  deleteProjectAction: vi.fn(),
  updateProjectAction: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

describe('ProjectClientPage', () => {
  it('should allow a user to add a new project', async () => {
    // Arrange
    const mockUser = { uid: '123' };
    const mockFirestore = {};
    const mockProjects = [
      { id: '1', name: 'Existing Project', userId: '123', createdAt: new Date() },
    ];
    const newProject = { id: '2', name: 'New Project', userId: '123', createdAt: new Date() };

    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(useFirestore).mockReturnValue(mockFirestore);
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getTasks).mockResolvedValue([]);
    vi.mocked(createProjectAction).mockResolvedValue(newProject);

    render(<ProjectClientPage />);

    // Act
    const input = await screen.findByPlaceholderText('e.g., Q3 Marketing Campaign');
    fireEvent.change(input, { target: { value: 'New Project' } });

    const addButton = screen.getByRole('button', { name: /Add Project/i });
    fireEvent.click(addButton);

    // Assert
    await waitFor(() => {
      expect(createProjectAction).toHaveBeenCalledWith(mockUser.uid, 'New Project');
    });
    
    await waitFor(() => {
        expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });
});
