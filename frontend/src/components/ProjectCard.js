import React from 'react';
import { Link } from 'react-router-dom';

const DEPT_COLORS = {
  'Computer Science': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'Electronics': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Mechanical': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Civil': 'bg-green-500/15 text-green-300 border-green-500/30',
  'Biotechnology': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'Chemical': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  'default': 'bg-ink-700 text-ink-300 border-ink-600',
};

export default function ProjectCard({ project }) {
  const deptColor = DEPT_COLORS[project.department] || DEPT_COLORS['default'];

  return (
    <div className="card hover:border-ink-500 transition-all duration-300 group flex flex-col h-full">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`badge border ${deptColor} shrink-0`}>
          {project.department}
        </span>
        <span className={`badge ${project.status === 'published' ? 'badge-published' : 'badge-ongoing'}`}>
          {project.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug mb-2 line-clamp-2">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-ink-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
        {project.description}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-ink-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-amber-400 font-semibold text-xs">
              {project.ownerId?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs font-medium text-ink-300">{project.ownerId?.name || 'Unknown'}</p>
              <p className="text-xs text-ink-500">{project.year}</p>
            </div>
          </div>
          <Link
            to={`/projects/${project._id}`}
            className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Contributors count */}
        {project.contributors?.length > 1 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {project.contributors.length} contributors
          </div>
        )}
      </div>
    </div>
  );
}
