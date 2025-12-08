import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FilterOverlay } from './FilterOverlay';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-700">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-24 md:ml-48">
        <Header />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      <FilterOverlay />
    </div>
  );
}
