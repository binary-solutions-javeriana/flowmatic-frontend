export const metadata = { title: 'Flowmatic', description: 'Frontend' };

import './globals.css';
import { AuthProvider } from '@/lib/auth-store';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
