import React from 'react';
import { Package, Smartphone } from 'lucide-react';

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
);

export const PageSkeleton = () => (
  <div className="min-h-screen bg-stone-50 pt-24 px-6 relative overflow-hidden">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="h-10 w-1/3 bg-stone-200 rounded-lg relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="h-4 w-1/4 bg-stone-200 rounded relative overflow-hidden">
        <Shimmer />
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/5] bg-stone-200 rounded-lg relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-4 w-3/4 bg-stone-200 rounded relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-4 w-1/2 bg-stone-200 rounded relative overflow-hidden">
              <Shimmer />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="min-h-screen bg-white pt-24 px-6 relative overflow-hidden">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image Gallery Skeleton */}
      <div className="space-y-4">
        <div className="aspect-square bg-stone-100 rounded-2xl relative overflow-hidden flex items-center justify-center">
             <Package className="w-16 h-16 text-stone-200 animate-pulse" />
             <Shimmer />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-stone-100 rounded-lg relative overflow-hidden">
                <Shimmer />
            </div>
          ))}
        </div>
      </div>
      
      {/* Info Skeleton */}
      <div className="space-y-6 pt-4">
        <div className="h-6 w-1/4 bg-stone-100 rounded relative overflow-hidden"><Shimmer /></div>
        <div className="h-12 w-3/4 bg-stone-100 rounded relative overflow-hidden"><Shimmer /></div>
        <div className="h-8 w-1/3 bg-stone-100 rounded relative overflow-hidden"><Shimmer /></div>
        <div className="space-y-2 py-6 border-y border-stone-100">
           <div className="h-4 w-full bg-stone-100 rounded relative overflow-hidden"><Shimmer /></div>
           <div className="h-4 w-full bg-stone-100 rounded relative overflow-hidden"><Shimmer /></div>
           <div className="h-4 w-2/3 bg-stone-100 rounded relative overflow-hidden"><Shimmer /></div>
        </div>
        <div className="flex gap-4">
           <div className="h-14 flex-1 bg-stone-100 rounded-lg relative overflow-hidden"><Shimmer /></div>
           <div className="h-14 w-14 bg-stone-100 rounded-lg relative overflow-hidden"><Shimmer /></div>
        </div>
      </div>
    </div>
  </div>
);

// Fallback for smaller/admin sections or fast loads before we know what to show
export const RootSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
         <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
         <p className="text-sm font-medium text-stone-500 animate-pulse tracking-widest uppercase">Loading Artistry...</p>
      </div>
  </div>
);
