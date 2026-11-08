import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

export const renderWithRouter = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: MemoryRouter, ...options });
