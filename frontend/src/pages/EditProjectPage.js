import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Biotechnology', 'Chemical', 'Other'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - i);

export default function EditProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', description: '', department: '', year: '', status: 'ongoing' });
  const [file, setFile] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const p = res.data;
        const isOwner = p.ownerId?._id === user._id;
        const isCollab = p.collaborators?.some((c) => c._id === user._id);
        if (!isOwner && !isCollab) {
          navigate(`/projects/${id}`);
          return;
        }
        setProject(p);
        setForm({
          title: p.title,
          description: p.description,
          department: p.department,
          year: p.year,
          status: p.status,
        });
      } catch {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append('file', file);

      await api.put(`/projects/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const isOwner = project && user && project.ownerId?._id === user._id;

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12"><div className="card skeleton h-80" /></div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-red-400">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 fade-up">
        <h1 className="page-header mb-2">Edit Project</h1>
        <p className="text-ink-400 text-sm">Update your project details</p>
      </div>

      <div className="card fade-up" style={{ animationDelay: '0.1s' }}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Project Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="input-field" required />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input-field resize-none" required />
          </div>

          {/* Only owner can change dept/year */}
          {isOwner && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <select name="department" value={form.department} onChange={handleChange} className="input-field">
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select name="year" value={form.year} onChange={handleChange} className="input-field">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="label">Status</label>
            <div className="flex gap-3">
              {['ongoing', 'published'].map((s) => (
                <label key={s} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all flex-1 ${form.status === s ? 'border-amber-500/50 bg-amber-500/10 text-white' : 'border-ink-600 bg-ink-800 text-ink-400'}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={handleChange} className="sr-only" />
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${form.status === s ? 'border-amber-400' : 'border-ink-500'}`}>
                    {form.status === s && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <span className="capitalize text-sm font-medium">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Replace PDF (optional)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block text-sm text-ink-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-ink-700 file:text-white file:text-sm file:font-medium hover:file:bg-ink-600 cursor-pointer"
              />
              {file && <span className="text-emerald-400 text-xs">{file.name}</span>}
            </div>
            {project?.fileUrl && !file && (
              <p className="text-ink-500 text-xs mt-1">Current: PDF already uploaded. Upload new to replace.</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/projects/${id}`)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
