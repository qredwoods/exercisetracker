import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import ExerciseTable from './ExerciseTable';

function makeExercise(index) {
  return {
    _id: `ex-${index}`,
    name: index % 2 === 0 ? 'Bench Press' : 'Squat',
    reps: 5 + (index % 5),
    weight: 135 + index * 5,
    unit: 'lbs',
    date: `2026-04-${String((index % 28) + 1).padStart(2, '0')}`,
  };
}

function renderTable(exercises) {
  return render(
    <ExerciseTable
      user={{ firstName: 'Demo' }}
      exercises={exercises}
      onDelete={vi.fn()}
      onEdit={vi.fn()}
      onDuplicate={vi.fn()}
      onView={vi.fn()}
      onCreate={vi.fn()}
      isFirstVisit={false}
      fadeIn={false}
      onFadeComplete={vi.fn()}
      highlightId={null}
      onHighlightEnd={vi.fn()}
      deletingId={null}
    />,
  );
}

describe('ExerciseTable', () => {
  beforeEach(() => {
    window.scrollBy = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  function getOverlayControls(container) {
    return within(container.querySelector('.table-overlay-stack'));
  }

  it('shows the default visible count in the summary and overlay', () => {
    const exercises = Array.from({ length: 20 }, (_, index) => makeExercise(index));
    const { container } = renderTable(exercises);
    const overlay = getOverlayControls(container);

    expect(screen.getByText('20 entries')).toBeInTheDocument();
    expect(screen.getByText('Showing 12 of 20')).toBeInTheDocument();
    expect(overlay.getByRole('button', { name: 'More' })).toBeInTheDocument();
    expect(overlay.getByRole('button', { name: 'All' })).toBeInTheDocument();
  });

  it('reveals less in-place after more is clicked and updates the count', () => {
    const exercises = Array.from({ length: 30 }, (_, index) => makeExercise(index));
    const { container } = renderTable(exercises);
    const overlay = getOverlayControls(container);

    fireEvent.click(overlay.getByRole('button', { name: 'More' }));

    expect(overlay.getByRole('button', { name: 'Less' })).toBeInTheDocument();
    expect(screen.getByText('Showing 24 of 30')).toBeInTheDocument();
  });

  it('moves less below the table when all entries are shown', () => {
    const exercises = Array.from({ length: 20 }, (_, index) => makeExercise(index));
    const { container } = renderTable(exercises);
    const overlay = getOverlayControls(container);

    fireEvent.click(overlay.getByRole('button', { name: 'All' }));

    expect(screen.queryByText('Showing 12 of 20')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Less' })).toBeInTheDocument();
    expect(screen.getByText('Showing 20 of 20')).toBeInTheDocument();
  });
});
