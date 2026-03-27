import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function RequestCard({ request, onApprove, onReject, actionLoading }) {
  const isPending = request.status === 'pending';
  return (
    <div className={`card transition-all duration-300 ${!isPending ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-amber-400 font-semibold shrink-0">
          {request.fromUser?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <p className="font-medium text-white text-sm">{request.fromUser?.name}</p>
            <span className={`badge border text-xs ${
              request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
              request.status === 'rejected' ? 'bg-red-500/15 text-red-300 border-red-500/30' :
              'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {request.status}
            </span>
          </div>
          <p className="text-ink-500 text-xs mb-1">{request.fromUser?.email}</p>
          <Link
            to={`/projects/${request.projectId?._id}`}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            📁 {request.projectId?.title}
          </Link>
          {request.message && (
            <p className="text-ink-400 text-sm mt-2 bg-ink-800 rounded-lg px-3 py-2 border border-ink-700">
              "{request.message}"
            </p>
          )}
          <p className="text-ink-600 text-xs mt-2">
            {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {isPending && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-ink-800">
          <button
            onClick={() => onApprove(request._id)}
            disabled={actionLoading === request._id}
            className="btn-success flex-1 text-center disabled:opacity-60"
          >
            {actionLoading === request._id ? 'Processing...' : '✓ Approve'}
          </button>
          <button
            onClick={() => onReject(request._id)}
            disabled={actionLoading === request._id}
            className="btn-danger flex-1 text-center disabled:opacity-60"
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
}

function OutgoingCard({ request }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/projects/${request.projectId?._id}`} className="font-display font-semibold text-white hover:text-amber-400 transition-colors text-sm leading-snug block mb-1">
            {request.projectId?.title}
          </Link>
          <p className="text-ink-500 text-xs mb-0.5">
            {request.projectId?.department} · {request.projectId?.year}
          </p>
          <p className="text-ink-500 text-xs">To: {request.toUser?.name}</p>
          {request.message && (
            <p className="text-ink-400 text-sm mt-2 bg-ink-800 rounded-lg px-3 py-2 border border-ink-700 line-clamp-2">
              "{request.message}"
            </p>
          )}
        </div>
        <span className={`badge border text-xs shrink-0 ${
          request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
          request.status === 'rejected' ? 'bg-red-500/15 text-red-300 border-red-500/30' :
          'bg-amber-500/15 text-amber-300 border-amber-500/30'
        }`}>
          {request.status}
        </span>
      </div>
      <p className="text-ink-600 text-xs mt-3">
        {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function CollaborationRequestsPage() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      const [inc, out] = await Promise.all([
        api.get('/requests/incoming'),
        api.get('/requests/outgoing'),
      ]);
      setIncoming(inc.data);
      setOutgoing(out.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (reqId) => {
    setActionLoading(reqId);
    try {
      await api.put(`/requests/${reqId}/approve`);
      setIncoming((prev) =>
        prev.map((r) => r._id === reqId ? { ...r, status: 'accepted' } : r)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqId) => {
    setActionLoading(reqId);
    try {
      await api.put(`/requests/${reqId}/reject`);
      setIncoming((prev) =>
        prev.map((r) => r._id === reqId ? { ...r, status: 'rejected' } : r)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = incoming.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 fade-up">
        <h1 className="page-header mb-2">Collaboration Requests</h1>
        <p className="text-ink-400 text-sm">Manage who can collaborate on your projects</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-ink-900 border border-ink-800 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'incoming' ? 'bg-ink-700 text-white' : 'text-ink-400 hover:text-white'
          }`}
        >
          Incoming
          {pendingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-ink-950 text-xs font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'outgoing' ? 'bg-ink-700 text-white' : 'text-ink-400 hover:text-white'
          }`}
        >
          Outgoing ({outgoing.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-36 skeleton" />)}
        </div>
      ) : activeTab === 'incoming' ? (
        incoming.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-ink-300 font-medium mb-1">No incoming requests</h3>
            <p className="text-ink-500 text-sm">When others request to collaborate on your projects, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending first */}
            {incoming.filter(r => r.status === 'pending').map((r) => (
              <div key={r._id} className="fade-up">
                <RequestCard request={r} onApprove={handleApprove} onReject={handleReject} actionLoading={actionLoading} />
              </div>
            ))}
            {incoming.filter(r => r.status !== 'pending').length > 0 && (
              <>
                <p className="text-xs text-ink-600 font-medium uppercase tracking-wider pt-2">Processed</p>
                {incoming.filter(r => r.status !== 'pending').map((r) => (
                  <div key={r._id} className="fade-up">
                    <RequestCard request={r} onApprove={handleApprove} onReject={handleReject} actionLoading={actionLoading} />
                  </div>
                ))}
              </>
            )}
          </div>
        )
      ) : (
        outgoing.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-ink-300 font-medium mb-1">No outgoing requests</h3>
            <p className="text-ink-500 text-sm mb-5">Browse projects and request to collaborate with other students.</p>
            <Link to="/" className="btn-primary inline-flex">Browse Projects</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {outgoing.map((r, i) => (
              <div key={r._id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <OutgoingCard request={r} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
