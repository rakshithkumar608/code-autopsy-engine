'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Zap, Clock, Server, Rocket, AlertCircle, CheckCircle } from 'lucide-react';

interface Incident {
  _id: string;
  title: string;
  description: string;
  timestamp: string;
  environment: string;
  status: string;
  severity: string;
}

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    environment: 'prod'
  });
  const router = useRouter();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/incidents`);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      router.push(`/incident/${data.incidentId}`);
    } catch (error) {
      console.error('Failed to create incident:', error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      triggered: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4" />;
    return <Activity className="w-4 h-4 animate-pulse" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-indigo-700 to-indigo-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Code Autopsy Engine</h1>
                <p className="text-indigo-200 text-sm">AI-Powered Root Cause Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm bg-indigo-800 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Create Incident Form */}
        <div className="card mb-8 border-t-4 border-t-indigo-600">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-indigo-600" />
            <span>Start New Investigation</span>
          </h2>
          <form onSubmit={createIncident} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                placeholder="e.g., Login API returning 500 errors"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                rows={3}
                placeholder="Describe what happened..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Environment
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                >
                  <option value="prod">🚀 Production</option>
                  <option value="staging">🧪 Staging</option>
                  <option value="dev">💻 Development</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={creating}
              className="btn-primary flex items-center space-x-2 w-full justify-center"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Starting Investigation...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Start Autopsy</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Recent Incidents */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>Recent Investigations</span>
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-3 text-gray-500">Loading incidents...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500">No incidents yet. Create your first investigation above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
                  onClick={() => router.push(`/incident/${incident._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${getStatusBadge(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          <span>{incident.status}</span>
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                      {incident.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{incident.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Server className="w-3 h-3" />
                          <span className="capitalize">{incident.environment}</span>
                        </span>
                        <span>{new Date(incident.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium ml-4">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}