// @ts-ignore;
import React from 'react';

export const ReadingProgress = ({
  progress
}) => {
  return <div className="fixed top-0 left-0 w-full h-1 bg-slate-800 z-50">
      <div className="h-full bg-red-500 transition-all duration-300" style={{
      width: `${progress}%`
    }} />
    </div>;
};