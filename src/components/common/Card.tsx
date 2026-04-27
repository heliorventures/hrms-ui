import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    <div
      className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900/40 md:p-6 ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
