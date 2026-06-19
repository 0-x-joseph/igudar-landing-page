import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

const GradientText = ({ children, className = '' }: GradientTextProps) => {
  return (
    <span className={`gradient-text ${className}`}>
      {children}
    </span>
  );
};

export default GradientText;
