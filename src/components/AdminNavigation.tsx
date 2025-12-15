"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Video, Users, Menu, X, Dumbbell, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function AdminNavigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { href: "/admin", label: "Programs", icon: LayoutDashboard },
        { href: "/admin/sessions", label: "Sessions", icon: Video },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/exercises", label: "Exercises", icon: Dumbbell },
    ];

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });
            if (response.ok) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ZP Fit Admin</h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 hidden md:block">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ZP Fit Admin</h1>
                </div>

                {/* Spacer for mobile header */}
                <div className="h-16 md:hidden" />

                <nav className="mt-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    "flex items-center px-6 py-3 transition-colors",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors w-full disabled:opacity-50"
                    >
                        {loggingOut ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <LogOut className="w-5 h-5 mr-3" />
                        )}
                        {loggingOut ? "Signing out..." : "Sign Out"}
                    </button>
                </div>
            </aside>
        </>
    );
}

