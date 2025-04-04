'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              Sistema de Transportes
            </Link>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
            >
              Início
            </Link>
            
            <Link 
              href="/transportes" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/transportes')}`}
            >
              Transportes
            </Link>
            
            <Link 
              href="/upload" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/upload')}`}
            >
              Upload
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 