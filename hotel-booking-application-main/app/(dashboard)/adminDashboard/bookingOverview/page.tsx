import React from 'react'

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video animate-pulse rounded-xl bg-gray-100" />
          <div className="aspect-video animate-pulse rounded-xl bg-gray-100" />
          <div className="aspect-video animate-pulse rounded-xl bg-gray-100" />
        </div>
        <div className="min-h-[100vh] animate-pulse flex-1 rounded-xl bg-gray-100" />
    </div>
  );
}