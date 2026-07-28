import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, breadcrumbs, actionButton }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex mb-1" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.label} className="inline-flex items-center">
                    {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />}
                    {crumb.path && !isLast ? (
                      <Link to={crumb.path} className="hover:text-gray-900 hover:underline transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? 'text-gray-900 font-medium' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
      </div>

      {/* Action Button */}
      {actionButton && (
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={actionButton.onClick}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            {actionButton.icon && <span className="mr-2 -ml-1">{actionButton.icon}</span>}
            {actionButton.label}
          </button>
        </div>
      )}
    </div>
  );
}
