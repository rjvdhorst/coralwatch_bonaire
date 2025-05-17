import React, { useState, useEffect, FormEvent } from 'react';
import apiService, { DiveSite } from '../services/apiService';

const DiveSitesPage: React.FC = () => {
  const [diveSites, setDiveSites] = useState<DiveSite[]>([]);
  const [newSiteName, setNewSiteName] = useState('');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchDiveSites();
  }, []);

  const fetchDiveSites = async () => {
    try {
      const sites = await apiService.getDiveSites();
      setDiveSites(sites);
    } catch (err) {
      setError('Failed to load dive sites');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newSiteName.trim()) {
      setError('Dive site name is required');
      return;
    }

    // Validate coordinates if provided
    const lat = newLatitude ? parseFloat(newLatitude) : null;
    const lon = newLongitude ? parseFloat(newLongitude) : null;

    if (newLatitude && (isNaN(lat!) || lat! < -90 || lat! > 90)) {
      setError('Latitude must be between -90 and 90 degrees');
      return;
    }

    if (newLongitude && (isNaN(lon!) || lon! < -180 || lon! > 180)) {
      setError('Longitude must be between -180 and 180 degrees');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.addDiveSite(newSiteName, lat, lon);
      setSuccess(`Dive site "${newSiteName}" added successfully`);
      setNewSiteName('');
      setNewLatitude('');
      setNewLongitude('');
      fetchDiveSites(); // Refresh the list
    } catch (err) {
      setError('Failed to add dive site');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Dive Sites</h1>

      {/* Add New Dive Site Form */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Dive Site</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Dive Site Name *
            </label>
            <input
              type="text"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              placeholder="Enter dive site name"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Latitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={newLatitude}
                onChange={(e) => setNewLatitude(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                placeholder="e.g., 12.1543"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Longitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={newLongitude}
                onChange={(e) => setNewLongitude(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                placeholder="e.g., -68.2775"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Adding...' : 'Add Dive Site'}
          </button>
        </form>
      </div>

      {/* Existing Dive Sites List */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold mb-4">Existing Dive Sites</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Latitude</th>
                <th className="px-4 py-2 text-left">Longitude</th>
              </tr>
            </thead>
            <tbody>
              {diveSites.map((site) => (
                <tr key={site.id} className="border-b">
                  <td className="px-4 py-2">{site.name}</td>
                  <td className="px-4 py-2">
                    {site.latitude ? site.latitude.toFixed(4) : '-'}
                  </td>
                  <td className="px-4 py-2">
                    {site.longitude ? site.longitude.toFixed(4) : '-'}
                  </td>
                </tr>
              ))}
              {diveSites.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                    No dive sites found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiveSitesPage;