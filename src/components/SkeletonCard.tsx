import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse h-full flex flex-col">
      <div className="h-64 bg-slate-200" />
      <div className="p-4 flex flex-col flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-1/2">
             <div className="h-3 bg-slate-200 rounded w-16" />
             <div className="h-6 bg-slate-300 rounded w-full" />
          </div>
          <div className="space-y-2 w-1/3 flex flex-col items-end">
             <div className="h-3 bg-slate-200 rounded w-16" />
             <div className="h-5 bg-slate-200 rounded w-12 text-right" />
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-slate-100 rounded-md w-20" />
          <div className="h-6 bg-slate-100 rounded-md w-24" />
        </div>
        
        <div className="mt-auto h-12 bg-slate-50 rounded-lg border border-slate-100" />
      </div>
    </div>
  );
};
