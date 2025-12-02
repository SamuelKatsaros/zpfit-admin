import Link from "next/link";
import { LogOut, LayoutDashboard, Dumbbell } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ZP Fit Admin</h1>
                </div>
                <nav className="mt-6">
                    <Link
                        href="/admin"
                        className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Programs
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors w-full">
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 ml-64 overflow-y-auto min-h-screen">
                {children}
            </main>
        </div>
    );
}
