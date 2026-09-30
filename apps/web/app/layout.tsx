import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'KittyAI / KritiAI - Autonomous Personal AI Assistant',
  description: 'Local-first multi-agent personal assistant for Windows, Web, and Mobile. Automated OS control, VS Code debugging, autonomous meeting delegation, and plugin hub.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0d14] text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-kitty-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
