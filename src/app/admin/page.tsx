import Link from "next/link";
import { Plus } from "lucide-react";
import { getFirestore } from "@/lib/firebase-admin";
import { Program } from "@/types";

async function getPrograms() {
    const db = await getFirestore();
    const snapshot = await db.collection("programs").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
}

export default async function AdminDashboard() {
    const programs = await getPrograms();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Programs</h1>
                <Link
                    href="/admin/programs/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Program
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                    <Link key={program.id} href={`/admin/programs/${program.id}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                                {program.thumbnailUrl ? (
                                    <img
                                        src={program.thumbnailUrl}
                                        alt={program.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Thumbnail
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {program.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm">
                                    {program.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
