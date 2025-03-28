import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });

  test('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary Button</Button>);
    
    let button = screen.getByText('Primary Button');
    expect(button).toHaveClass('bg-blue-500');
    
    rerender(<Button variant="secondary">Secondary Button</Button>);
    
    button = screen.getByText('Secondary Button');
    expect(button).toHaveClass('bg-gray-500');
  });
}); 