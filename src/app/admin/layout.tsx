import AdminNavigation from "@/components/AdminNavigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <AdminNavigation />

            {/* Main Content - adjusted for mobile header and desktop sidebar */}
            <main className="pt-16 md:pt-0 md:ml-64 min-h-screen">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

