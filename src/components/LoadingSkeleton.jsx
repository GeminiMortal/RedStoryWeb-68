// @ts-ignore;
import React from 'react';

export function LoadingSkeleton({
  type = 'card',
  count = 3
}) {
  if (type === 'card') {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({
        length: count
      }).map((_, i) => <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="aspect-video bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-700 rounded w-16"></div>
              <div className="h-8 bg-gray-700 rounded w-16"></div>
            </div>
          </div>)}
      </div>;
  }
  if (type === 'detail') {
    return <div className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-700"></div>
        <div className="p-6">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="flex gap-4 mb-4">
            <div className="h-4 bg-gray-700 rounded w-24"></div>
            <div className="h-4 bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-700 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>;
  }
  return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
}