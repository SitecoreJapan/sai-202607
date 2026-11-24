import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TestComponent from '../../../components/test-component/TestComponent';
import { mockPage } from '../../mocks/mockPage';

describe('TestComponent should', () => {
  it('render its datasource text and image', () => {
    render(
      <TestComponent
        rendering={{
          componentName: 'TestComponent',
          dataSource: '',
          uid: 'test-component-uid',
        }}
        params={{}}
        page={mockPage}
        fields={{
          TestText: { value: 'Sample text' },
          ImageText: {
            value: {
              src: '/sample-image.jpg',
              alt: 'Sample plant',
              width: 600,
              height: 600,
            },
          },
        }}
      />
    );

    expect(screen.getByText('Sample text')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Sample plant' })).toHaveAttribute(
      'src',
      '/sample-image.jpg'
    );
    expect(document.querySelector('.test-component')).toBeInTheDocument();
  });

  it('show an empty hint when the datasource is missing', () => {
    render(
      <TestComponent
        rendering={{
          componentName: 'TestComponent',
          dataSource: '',
          uid: 'test-component-empty-uid',
        }}
        params={{}}
        page={mockPage}
      />
    );

    expect(screen.getByText('TestComponent')).toHaveClass('is-empty-hint');
  });
});
