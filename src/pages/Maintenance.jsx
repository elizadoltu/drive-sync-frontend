import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../components/Sidebar';

const Maintenance = () => {
    const navigate = useNavigate();

    /* ── Auth / role ─────────────────────────────────────────── */
    const [role, setRole] = useState(null);   // 'driver' | 'admin'
    const [isLoading, setIsLoading] = useState(true);

    /* ── Form (create issue) ─────────────────────────────────── */
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        /* car */
        carId: '',   // plate for admin, auto for driver

        /* issue */
        category: '',
        description: '',
        dateObserved: '',
        urgency: 'medium',
    });

    const categories = [
        'engine',
        'transmission',
        'brakes',
        'suspension',
        'electrical',
        'other',
    ];

    /* ── Admin list / table ──────────────────────────────────── */
    const [issues, setIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(false);

    /* ── Edit functionality ──────────────────────────────────── */
    const [editingId, setEditingId] = useState(null);
    const [editBuffer, setEditBuffer] = useState({
        category: '',
        urgency: '',
        description: '',
    });

    /* ── Dropdown state ──────────────────────────────────────── */
    const [openDropdown, setOpenDropdown] = useState(null);

    /* ── Decode token once ───────────────────────────────────── */
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setRole(decoded.role);
            if (decoded.role === 'driver') {
                // assume plate lives at decoded.plate || decoded.registrationNumber
                setFormData((prev) => ({
                    ...prev,
                    carId: decoded.registrationNumber || decoded.plate || '',
                }));
            } else {
                fetchIssues(token); // admin view
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Bad token', err);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchIssues = async (token) => {
        try {
            setIssuesLoading(true);
            const { data } = await axios.get(
                'https://maintenance-dot-cloud-app-455515.lm.r.appspot.com/api/maintenance',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIssues(data);
            console.log(data);
        } catch (err) {
            console.error('Fetch issues error', err);
        } finally {
            setIssuesLoading(false);
        }
    };

    /* ── Form helpers ────────────────────────────────────────── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // validation
        if (
            !formData.carId.trim() ||
            !formData.category.trim() ||
            !formData.description.trim()
        ) {
            alert('Please complete all required fields.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.post(
                'https://maintenance-dot-cloud-app-455515.lm.r.appspot.com/api/maintenance',
                {
                    // map to backend field names
                    carId: formData.carId,
                    category: formData.category,
                    description: formData.description,
                    dateObserved: formData.dateObserved,
                    urgency: formData.urgency,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Issue submitted!');

            // reset form (admin keeps their typed plate)
            setFormData((p) => ({
                ...p,
                description: '',
                category: '',
                dateObserved: '',
                urgency: 'medium',
            }));

            // If admin, refresh the issues list to show the new issue
            if (role === 'admin') {
                fetchIssues(token);
            }

        } catch (err) {
            console.error('Submit error', err);
            alert('Submit failed – see console.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Admin status / delete helpers ─────────────────────── */
    const updateStatus = async (issueId, newStatus) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.put(
                `https://maintenance-dot-cloud-app-455515.lm.r.appspot.com/api/maintenance/${issueId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIssues((prev) =>
                prev.map((i) => (i._id === issueId ? { ...i, status: newStatus } : i))
            );
            setOpenDropdown(null);
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const deleteIssue = async (issueId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (!window.confirm('Are you sure you want to delete this issue?')) return;

        try {
            await axios.delete(
                `https://maintenance-dot-cloud-app-455515.lm.r.appspot.com/api/maintenance/${issueId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // remove from UI
            setIssues((prev) => prev.filter((i) => i._id !== issueId));
            setOpenDropdown(null);
        } catch (err) {
            console.error('Error deleting issue', err);
            alert('Delete failed – see console.');
        }
    };

    const editIssue = async (issueId, payload) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.put(
                `https://maintenance-dot-cloud-app-455515.lm.r.appspot.com/api/maintenance/${issueId}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // merge changes into state
            setIssues((prev) =>
                prev.map((i) => (i._id === issueId ? { ...i, ...payload } : i))
            );
        } catch (err) {
            console.error('Error updating issue', err);
            alert('Update failed – see console.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-white">
            <Sidebar />

            <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
                <div className="max-w-6xl mx-auto py-8 px-4 w-full">
                    {/* ── Header ─────────────────────────────────────── */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {role === 'admin' ? 'Maintenance Dashboard' : 'Report Vehicle Issue'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {role === 'admin'
                                ? 'Track, edit, and manage reported vehicle issues.'
                                : "Describe the problem you're experiencing with your vehicle."}
                        </p>
                    </div>

                    {/* ── CREATE ISSUE FORM (both roles) ─────────────── */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">
                            {role === 'admin' ? 'Create New Issue' : 'Report Issue'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Registration Number */}
                            <div className="flex flex-col">
                                <label htmlFor="carId" className="mb-2 text-sm font-medium text-gray-700">
                                    License Plate <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="carId"
                                    name="carId"
                                    type="text"
                                    value={formData.carId}
                                    onChange={handleChange}
                                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="ABC-123"
                                    disabled={role === 'driver'}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category */}
                                <div className="flex flex-col">
                                    <label htmlFor="category" className="mb-2 text-sm font-medium text-gray-700">
                                        Problem Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="" disabled>
                                            -- Select a category --
                                        </option>
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c.charAt(0).toUpperCase() + c.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date observed */}
                                <div className="flex flex-col">
                                    <label htmlFor="dateObserved" className="mb-2 text-sm font-medium text-gray-700">
                                        Date Observed
                                    </label>
                                    <input
                                        id="dateObserved"
                                        name="dateObserved"
                                        type="date"
                                        value={formData.dateObserved}
                                        onChange={handleChange}
                                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Urgency */}
                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-medium text-gray-700">Urgency Level</span>
                                <div className="flex items-center gap-6">
                                    {['low', 'medium', 'high'].map((u) => (
                                        <label key={u} className="inline-flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="urgency"
                                                value={u}
                                                checked={formData.urgency === u}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="capitalize text-sm font-medium text-gray-700">{u}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col">
                                <label htmlFor="description" className="mb-2 text-sm font-medium text-gray-700">
                                    Detailed Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Please provide a detailed description of the issue, including when it occurs and any symptoms..."
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── ADMIN TABLE ── */}
                    {role === 'admin' && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Issue Management</h2>
                                <p className="text-sm text-gray-600 mt-1">View and manage all reported maintenance issues</p>
                            </div>

                            {issuesLoading ? (
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full w-12 border-t-2 border-b-2 border-blue-600"></div>
                                </div>
                            ) : issues.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-lg">No issues reported yet</p>
                                    <p className="text-gray-400 text-sm">Issues will appear here once they are reported</p>
                                </div>
                            ) : (
                                <div className="">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {issues.map((issue) => (
                                                <tr key={issue._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                    {/* ─── CAR ─── */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{issue.carId}</div>
                                                    </td>

                                                    {/* ─── CATEGORY ─── */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingId === issue._id ? (
                                                            <select
                                                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                value={editBuffer.category}
                                                                onChange={(e) =>
                                                                    setEditBuffer({ ...editBuffer, category: e.target.value })
                                                                }
                                                            >
                                                                {categories.map((c) => (
                                                                    <option key={c} value={c}>
                                                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="text-sm font-medium text-gray-900 capitalize">{issue.category}</div>
                                                        )}
                                                    </td>

                                                    {/* ─── URGENCY ─── */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingId === issue._id ? (
                                                            <select
                                                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                value={editBuffer.urgency}
                                                                onChange={(e) =>
                                                                    setEditBuffer({ ...editBuffer, urgency: e.target.value })
                                                                }
                                                            >
                                                                {['low', 'medium', 'high'].map((u) => (
                                                                    <option key={u} value={u}>
                                                                        {u.charAt(0).toUpperCase() + u.slice(1)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(issue.urgency)}`}>
                                                                {issue.urgency.charAt(0).toUpperCase() + issue.urgency.slice(1)}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* ─── STATUS ─── */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>
                                                            {issue.status.replace('_', ' ').charAt(0).toUpperCase() + issue.status.replace('_', ' ').slice(1)}
                                                        </span>
                                                    </td>

                                                    {/* ─── DESCRIPTION ─── */}
                                                    <td className="px-6 py-4">
                                                        {editingId === issue._id ? (
                                                            <textarea
                                                                className="text-sm border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                rows={2}
                                                                value={editBuffer.description}
                                                                onChange={(e) =>
                                                                    setEditBuffer({ ...editBuffer, description: e.target.value })
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-gray-900 max-w-xs">
                                                                <p className="line-clamp-2">{issue.description}</p>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* ─── REPORTED DATE ─── */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(issue.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>

                                                    {/* ─── ACTIONS DROPDOWN ─── */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="relative inline-block text-left">
                                                            {editingId === issue._id ? (
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            editIssue(issue._id, editBuffer);
                                                                            setEditingId(null);
                                                                        }}
                                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingId(null)}
                                                                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenDropdown(openDropdown === issue._id ? null : issue._id);
                                                                        }}
                                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                                    >
                                                                        Actions
                                                                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </button>

                                                                    {openDropdown === issue._id && (
                                                                        <div className="absolute right-0 z-50 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                                                                            <div className="py-2">
                                                                                {/* Status Actions */}
                                                                                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                                                                                    Change Status
                                                                                </div>
                                                                                {['open', 'in_progress', 'resolved'].map((status) => (
                                                                                    <button
                                                                                        key={status}
                                                                                        disabled={issue.status === status}
                                                                                        onClick={() => updateStatus(issue._id, status)}
                                                                                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${issue.status === status
                                                                                                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                                                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                                                                            }`}
                                                                                    >
                                                                                        <span>{status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</span>
                                                                                        {issue.status === status && (
                                                                                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                            </svg>
                                                                                        )}
                                                                                    </button>
                                                                                ))}

                                                                                {/* Divider */}
                                                                                <div className="border-t border-gray-100 my-2"></div>

                                                                                {/* Edit Action */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingId(issue._id);
                                                                                        setEditBuffer({
                                                                                            category: issue.category,
                                                                                            urgency: issue.urgency,
                                                                                            description: issue.description,
                                                                                        });
                                                                                        setOpenDropdown(null);
                                                                                    }}
                                                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center"
                                                                                >
                                                                                    <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                    </svg>
                                                                                    Edit Issue
                                                                                </button>

                                                                                {/* Delete Action */}
                                                                                <button
                                                                                    onClick={() => deleteIssue(issue._id)}
                                                                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center"
                                                                                >
                                                                                    <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                    Delete Issue
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Maintenance;