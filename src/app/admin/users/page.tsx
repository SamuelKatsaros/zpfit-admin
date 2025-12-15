"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, Search, X, Calendar, Target, Dumbbell, TrendingUp, Lock, LockOpen, Plus, Trash2, Save, Edit2 } from "lucide-react";
import { User } from "@/types";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userCompletions, setUserCompletions] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isLocked, setIsLocked] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<Partial<User>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
        // Load lock state from localStorage
        const savedLockState = localStorage.getItem("adminUsersLocked");
        if (savedLockState !== null) {
            setIsLocked(savedLockState === "true");
        }
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, users]);

    const loadUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = users.filter(
            (user) =>
                user.firstName.toLowerCase().includes(query) ||
                user.lastName.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
        );
        setFilteredUsers(filtered);
    };

    const toggleLock = () => {
        const newLockState = !isLocked;
        setIsLocked(newLockState);
        localStorage.setItem("adminUsersLocked", String(newLockState));
        // Cancel editing when locking
        if (newLockState) {
            setIsEditing(false);
            setEditedUser({});
        }
    };

    const viewUserDetails = async (user: User) => {
        setSelectedUser(user);
        setEditedUser(user);
        setIsEditing(false);
        setLoadingDetails(true);

        try {
            const res = await fetch(`/api/users/${user.id}`);
            const data = await res.json();
            setUserCompletions(data.completions || []);
        } catch (error) {
            console.error("Failed to load user details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedUser),
            });

            if (res.ok) {
                setShowCreateModal(false);
                setEditedUser({});
                loadUsers();
            } else {
                const error = await res.json();
                alert(`Failed to create user: ${error.error}`);
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setSubmitting(true);

        try {
            const res = await fetch(`/api/users/${selectedUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedUser),
            });

            if (res.ok) {
                setIsEditing(false);
                loadUsers();
                setSelectedUser({ ...selectedUser, ...editedUser } as User);
            } else {
                alert("Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone and will delete all associated data including workout completions and progress.`)) {
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setSelectedUser(null);
                loadUsers();
            } else {
                alert("Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "Invalid Date";
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Invalid Date";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
                        Manage all users across the app
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900 px-3 md:px-4 py-2 rounded-lg">
                        <span className="text-blue-800 dark:text-blue-200 font-semibold text-sm md:text-base">
                            {users.length} Users
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            setEditedUser({
                                firstName: "",
                                lastName: "",
                                email: "",
                                experienceLevel: "Beginner",
                                goals: [],
                                heightFeet: 0,
                                heightInches: 0,
                                weightPounds: 0,
                                currentDayNumber: 0,
                            });
                            setShowCreateModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center transition-colors text-sm md:text-base"
                        title="Add new user (always available)"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Add User</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                    <button
                        onClick={toggleLock}
                        className={`px-3 md:px-4 py-2 rounded-lg flex items-center transition-colors text-sm md:text-base ${isLocked
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                            }`}
                        title={isLocked ? "Click to unlock and enable editing/deletion" : "Click to lock and prevent editing/deletion"}
                    >
                        {isLocked ? (
                            <>
                                <Lock className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">Locked</span>
                            </>
                        ) : (
                            <>
                                <LockOpen className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">Unlocked</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Lock Status Info */}
            {!isLocked && (
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        <strong>Editing Mode Active:</strong> You can now edit and delete users. Click the lock icon to return to view-only mode.
                    </p>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Experience
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Current Day
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.experienceLevel === "Beginner"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : user.experienceLevel === "Intermediate"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}>
                                                {user.experienceLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            Day {user.currentDayNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(user.joinedDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => viewUserDetails(user)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {searchQuery ? "No users found" : "No users yet"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery
                            ? "Try adjusting your search query"
                            : "Users will appear here once they sign up"}
                    </p>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <UserFormModal
                    title="Create New User"
                    user={editedUser}
                    onUserChange={setEditedUser}
                    onSubmit={handleCreateUser}
                    onCancel={() => {
                        setShowCreateModal(false);
                        setEditedUser({});
                    }}
                    submitting={submitting}
                    submitText="Create User"
                />
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {selectedUser.firstName} {selectedUser.lastName}
                            </h2>
                            <div className="flex items-center gap-2">
                                {!isLocked && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                        Edit
                                    </button>
                                )}
                                {!isLocked && (
                                    <button
                                        onClick={() => handleDeleteUser(selectedUser.id, `${selectedUser.firstName} ${selectedUser.lastName}`)}
                                        disabled={submitting}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setIsEditing(false);
                                        setEditedUser({});
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* User Profile Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Personal Information
                                    </h3>
                                    <div className="space-y-3">
                                        <FormField
                                            label="First Name"
                                            value={isEditing ? editedUser.firstName : selectedUser.firstName}
                                            editing={isEditing}
                                            onChange={(v) => setEditedUser({ ...editedUser, firstName: v })}
                                        />
                                        <FormField
                                            label="Last Name"
                                            value={isEditing ? editedUser.lastName : selectedUser.lastName}
                                            editing={isEditing}
                                            onChange={(v) => setEditedUser({ ...editedUser, lastName: v })}
                                        />
                                        <FormField
                                            label="Email"
                                            value={isEditing ? editedUser.email : selectedUser.email}
                                            editing={isEditing}
                                            onChange={(v) => setEditedUser({ ...editedUser, email: v })}
                                        />
                                        <FormField
                                            label="Date of Birth"
                                            value={isEditing ? editedUser.dateOfBirth : selectedUser.dateOfBirth}
                                            editing={isEditing}
                                            onChange={(v) => setEditedUser({ ...editedUser, dateOfBirth: v })}
                                            formatter={formatDate}
                                            type="date"
                                        />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Height</label>
                                            {isEditing ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={editedUser.heightFeet ?? selectedUser.heightFeet}
                                                        onChange={(e) => setEditedUser({ ...editedUser, heightFeet: parseInt(e.target.value) || 0 })}
                                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="Feet"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editedUser.heightInches ?? selectedUser.heightInches}
                                                        onChange={(e) => setEditedUser({ ...editedUser, heightInches: parseInt(e.target.value) || 0 })}
                                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="Inches"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">
                                                    {selectedUser.heightFeet}'{selectedUser.heightInches}"
                                                </p>
                                            )}
                                        </div>
                                        <FormField
                                            label="Weight (lbs)"
                                            value={isEditing ? editedUser.weightPounds : selectedUser.weightPounds}
                                            editing={isEditing}
                                            onChange={(v) => setEditedUser({ ...editedUser, weightPounds: parseInt(v) || 0 })}
                                            type="number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Dumbbell className="w-5 h-5 mr-2" />
                                        Fitness Profile
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience Level</label>
                                            {isEditing ? (
                                                <select
                                                    value={editedUser.experienceLevel ?? selectedUser.experienceLevel}
                                                    onChange={(e) => setEditedUser({ ...editedUser, experienceLevel: e.target.value as any })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                </select>
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">{selectedUser.experienceLevel}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Goals</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={(editedUser.goals ?? selectedUser.goals).join(", ")}
                                                    onChange={(e) => setEditedUser({ ...editedUser, goals: e.target.value.split(",").map(g => g.trim()) })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Comma-separated goals"
                                                />
                                            ) : (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {selectedUser.goals.map((goal, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center"
                                                        >
                                                            <Target className="w-3 h-3 mr-1" />
                                                            {goal}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <FormField
                                            label="Current Day"
                                            value={isEditing ? editedUser.currentDayNumber : selectedUser.currentDayNumber}
                                            editing={isEditing}
                                            onChange={(v) => setEditedUser({ ...editedUser, currentDayNumber: parseInt(v) || 0 })}
                                            type="number"
                                            formatter={(v) => `Day ${v}`}
                                        />
                                        <FormField
                                            label="Current Program ID"
                                            value={isEditing ? editedUser.currentProgramId : selectedUser.currentProgramId}
                                            editing={isEditing}
                                            onChange={(v) => setEditedUser({ ...editedUser, currentProgramId: v })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={handleUpdateUser}
                                        disabled={submitting}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedUser(selectedUser);
                                        }}
                                        className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {/* Activity Information */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Activity Timestamps
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</label>
                                        <p className="text-gray-900 dark:text-white">{formatDateTime(selectedUser.joinedDate)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Completion</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedUser.lastCompletionDate ? formatDateTime(selectedUser.lastCompletionDate) : "None"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedUser.updatedAt ? formatDateTime(selectedUser.updatedAt) : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Workout Completions */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Workout Completions
                                </h3>
                                {loadingDetails ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                                    </div>
                                ) : userCompletions.length > 0 ? (
                                    <div className="space-y-2">
                                        {userCompletions.map((completion, index) => (
                                            <div
                                                key={completion.id || index}
                                                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Day {completion.dayNumber}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Duration: {completion.durationMinutes} min
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDateTime(completion.completedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                        No workout completions yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for form fields
function FormField({
    label,
    value,
    editing,
    onChange,
    type = "text",
    formatter,
}: {
    label: string;
    value: any;
    editing: boolean;
    onChange: (value: string) => void;
    type?: string;
    formatter?: (value: any) => string;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
            {editing ? (
                <input
                    type={type}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            ) : (
                <p className="text-gray-900 dark:text-white">
                    {formatter ? formatter(value) : value || "N/A"}
                </p>
            )}
        </div>
    );
}

// User Form Modal Component
function UserFormModal({
    title,
    user,
    onUserChange,
    onSubmit,
    onCancel,
    submitting,
    submitText,
}: {
    title: string;
    user: Partial<User>;
    onUserChange: (user: Partial<User>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitting: boolean;
    submitText: string;
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={user.firstName || ""}
                                onChange={(e) => onUserChange({ ...user, firstName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={user.lastName || ""}
                                onChange={(e) => onUserChange({ ...user, lastName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            value={user.email || ""}
                            onChange={(e) => onUserChange({ ...user, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={user.dateOfBirth || ""}
                            onChange={(e) => onUserChange({ ...user, dateOfBirth: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Height (Feet)
                            </label>
                            <input
                                type="number"
                                value={user.heightFeet || ""}
                                onChange={(e) => onUserChange({ ...user, heightFeet: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Height (Inches)
                            </label>
                            <input
                                type="number"
                                value={user.heightInches || ""}
                                onChange={(e) => onUserChange({ ...user, heightInches: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Weight (lbs)
                            </label>
                            <input
                                type="number"
                                value={user.weightPounds || ""}
                                onChange={(e) => onUserChange({ ...user, weightPounds: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Experience Level
                        </label>
                        <select
                            value={user.experienceLevel || "Beginner"}
                            onChange={(e) => onUserChange({ ...user, experienceLevel: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Goals (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={(user.goals || []).join(", ")}
                            onChange={(e) => onUserChange({ ...user, goals: e.target.value.split(",").map(g => g.trim()).filter(g => g) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., Build Muscle, Lose Weight"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                submitText
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
