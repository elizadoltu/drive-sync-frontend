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
        registrationNumber: '',   // plate for admin, auto for driver

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

    /* ── Decode token once ───────────────────────────────────── */
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setRole(decoded.role);
            if (decoded.role === 'driver') {
                // assume plate lives at decoded.plate || decoded.registrationNumber
                setFormData((prev) => ({
                    ...prev,
                    registrationNumber:
                        decoded.registrationNumber || decoded.plate || '',
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

    const fetchIssues = async (token) => {
        try {
            setIssuesLoading(true);
            const { data } = await axios.get(
                'https://maintenance-dot-cloud-app-455515.lm.r.appspot.com/api/maintenance',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIssues(data);
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
            !formData.registrationNumber.trim() ||
            !formData.category.trim() ||
            !formData.description.trim()
        ) {
            alert('Please complete all required fields.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setSubmitting(true);
            await axios.post(
                'https://maintenance-dot-cloud-app-455515.lm.r.appspot.com/api/maintenance',
                {
                    // map to backend field names
                    carId: formData.registrationNumber,
                    category: formData.category,
                    description: formData.description,
                    dateObserved: formData.dateObserved,
                    urgency: formData.urgency,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Issue submitted!');
            // reset (admin keeps their typed plate)
            setFormData((p) => ({
                ...p,
                description: '',
                category: '',
                dateObserved: '',
                urgency: 'medium',
            }));
        } catch (err) {
            console.error('Submit error', err);
            alert('Submit failed – see console.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Admin status / delete helpers (unchanged) … add your existing helpers here ── */
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden bg-white flex">
            <Sidebar />

            <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
                <div className="max-w-4xl mx-auto py-8 px-4 w-full">
                    {/* ── Header ─────────────────────────────────────── */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold uppercase mb-2">
                            {role === 'admin' ? 'Maintenance Dashboard' : 'Report Vehicle Issue'}
                        </h1>
                        <p className="text-gray-600">
                            {role === 'admin'
                                ? 'Track, edit, or remove reported problems.'
                                : 'Describe the problem you’re having with your car.'}
                        </p>
                    </div>

                    {/* ── CREATE ISSUE FORM (both roles) ─────────────── */}
                    <div className="bg-[#e7e7e7] rounded-xl p-6 mb-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Registration Number (visible for admin, read-only for driver) */}
                            <div className="flex flex-col">
                                <label htmlFor="registrationNumber" className="mb-1 text-sm font-medium">
                                    Licence Plate <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="registrationNumber"
                                    name="registrationNumber"
                                    type="text"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                    className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100"
                                    placeholder="ABC-123"
                                    disabled={role === 'driver'}
                                />
                            </div>

                            {/* Category */}
                            <div className="flex flex-col">
                                <label htmlFor="category" className="mb-1 text-sm font-medium">
                                    Problem Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
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

                            {/* Urgency */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">Urgency</span>
                                <div className="flex items-center gap-6">
                                    {['low', 'medium', 'high'].map((u) => (
                                        <label key={u} className="inline-flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="urgency"
                                                value={u}
                                                checked={formData.urgency === u}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                                            />
                                            <span className="capitalize text-sm">{u}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col">
                                <label htmlFor="description" className="mb-1 text-sm font-medium">
                                    Detailed Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    placeholder="Describe the issue…"
                                />
                            </div>

                            {/* Date observed (optional) */}
                            <div className="flex flex-col">
                                <label htmlFor="dateObserved" className="mb-1 text-sm font-medium">
                                    Date Observed
                                </label>
                                <input
                                    id="dateObserved"
                                    name="dateObserved"
                                    type="date"
                                    value={formData.dateObserved}
                                    onChange={handleChange}
                                    className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 bg-blue-500 text-white rounded disabled:bg-gray-400"
                                >
                                    {submitting ? 'Submitting…' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── ADMIN TABLE (unchanged list, edit, delete, etc.) ── */}
                    {role === 'admin' && (
                        <div className="bg-[#e7e7e7] rounded-xl p-6">
                            {issuesLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : issues.length === 0 ? (
                                <p>No issues reported yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="py-2 px-4 font-medium">Car</th>
                                                <th className="py-2 px-4 font-medium">Category</th>
                                                <th className="py-2 px-4 font-medium">Urgency</th>
                                                <th className="py-2 px-4 font-medium">Status</th>
                                                <th className="py-2 px-4 font-medium">Description</th>
                                                <th className="py-2 px-4 font-medium">Reported</th>
                                                <th className="py-2 px-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {issues.map((issue) => (
                                                <tr key={issue._id} className="border-b hover:bg-white/50">
                                                    {/* ─── CAR ─── */}
                                                    <td className="py-2 px-4 whitespace-nowrap">
                                                        {issue.make} {issue.model} ({issue.year})
                                                    </td>

                                                    {/* ─── CATEGORY ─── */}
                                                    <td className="py-2 px-4 capitalize">
                                                        {editingId === issue._id ? (
                                                            <select
                                                                className="border p-1 rounded"
                                                                value={editBuffer.category}
                                                                onChange={(e) =>
                                                                    setEditBuffer({ ...editBuffer, category: e.target.value })
                                                                }
                                                            >
                                                                {categories.map((c) => (
                                                                    <option key={c} value={c}>
                                                                        {c}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            issue.category
                                                        )}
                                                    </td>

                                                    {/* ─── URGENCY ─── */}
                                                    <td className="py-2 px-4 capitalize">
                                                        {editingId === issue._id ? (
                                                            <select
                                                                className="border p-1 rounded"
                                                                value={editBuffer.urgency}
                                                                onChange={(e) =>
                                                                    setEditBuffer({ ...editBuffer, urgency: e.target.value })
                                                                }
                                                            >
                                                                {['low', 'medium', 'high'].map((u) => (
                                                                    <option key={u} value={u}>
                                                                        {u}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            issue.urgency
                                                        )}
                                                    </td>

                                                    {/* ─── STATUS (read-only here) ─── */}
                                                    <td className="py-2 px-4 capitalize font-semibold">
                                                        {issue.status.replace('_', ' ')}
                                                    </td>

                                                    {/* ─── DESCRIPTION ─── */}
                                                    <td className="py-2 px-4">
                                                        {editingId === issue._id ? (
                                                            <textarea
                                                                className="border p-1 rounded w-full text-xs"
                                                                rows={2}
                                                                value={editBuffer.description}
                                                                onChange={(e) =>
                                                                    setEditBuffer({ ...editBuffer, description: e.target.value })
                                                                }
                                                            />
                                                        ) : (
                                                            <span className="line-clamp-2">{issue.description}</span>
                                                        )}
                                                    </td>

                                                    {/* ─── REPORTED DATE ─── */}
                                                    <td className="py-2 px-4 whitespace-nowrap">
                                                        {new Date(issue.createdAt).toLocaleDateString()}
                                                    </td>

                                                    {/* ─── ACTIONS ─── */}
                                                    <td className="py-2 px-4 text-right space-x-2">
                                                        {/* status buttons */}
                                                        {['open', 'in_progress', 'resolved'].map((status) => (
                                                            <button
                                                                key={status}
                                                                disabled={issue.status === status}
                                                                onClick={() => updateStatus(issue._id, status)}
                                                                className={`px-2 py-1 rounded text-xs border ${issue.status === status
                                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                                        : 'bg-blue-500 text-white'
                                                                    }`}
                                                            >
                                                                {status.replace('_', ' ')}
                                                            </button>
                                                        ))}

                                                        {/* EDIT / SAVE toggle */}
                                                        <button
                                                            onClick={() => {
                                                                if (editingId === issue._id) {
                                                                    // Save
                                                                    editIssue(issue._id, editBuffer);
                                                                    setEditingId(null);
                                                                } else {
                                                                    // Enter edit mode
                                                                    setEditingId(issue._id);
                                                                    setEditBuffer({
                                                                        category: issue.category,
                                                                        urgency: issue.urgency,
                                                                        description: issue.description,
                                                                    });
                                                                }
                                                            }}
                                                            className="px-2 py-1 rounded text-xs border bg-yellow-500 text-white"
                                                        >
                                                            {editingId === issue._id ? 'Save' : 'Edit'}
                                                        </button>

                                                        {/* DELETE */}
                                                        <button
                                                            onClick={() => deleteIssue(issue._id)}
                                                            className="px-2 py-1 rounded text-xs border bg-red-600 text-white"
                                                        >
                                                            Delete
                                                        </button>
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
