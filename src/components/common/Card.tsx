import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
  id?: string;
}

const Card = ({ children, title, className = '', id }: CardProps) => {
  return (
    <div
      id={id}
      className={`rounded-xl border border-line bg-surface p-5 text-content-primary shadow-card md:p-6 ${className}`}
    >
      {title !== null && title !== undefined && title !== '' && (
        <h3 className="mb-4 text-base font-semibold tracking-tight text-content-primary">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
