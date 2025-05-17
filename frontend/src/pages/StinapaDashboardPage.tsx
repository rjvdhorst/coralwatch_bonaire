import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiveSite, Coral } from '../services/apiService';
import { apiService } from '../services/apiService';

const StinapaDashboardPage = () => {
  const [diveSites, setDiveSites] = useState<DiveSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [corals, setCorals] = useState<Coral[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch dive sites on component mount
  useEffect(() => {
    const fetchDiveSites = async () => {
      try {
        setIsLoading(true);
        const sites = await apiService.getDiveSites();
        setDiveSites(sites);
        if (sites.length > 0) {
          setSelectedSiteId(sites[0].id);
        }
      } catch (err) {
        setError('Failed to load dive sites');
        console.error('Error fetching dive sites:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiveSites();
  }, []);

  // Fetch corals when a site is selected
  useEffect(() => {
    const fetchCorals = async () => {
      if (!selectedSiteId) return;

      try {
        setIsLoading(true);
        const coralData = await apiService.getCoralsAtSite(selectedSiteId);
        setCorals(coralData);
        setError(null);
      } catch (err) {
        setError('Failed to load corals for this site');
        console.error('Error fetching corals:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCorals();
  }, [selectedSiteId]);

  const handleSiteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSiteId(Number(event.target.value));
  };

  const handleCoralClick = (coralInternalId: string) => {
    navigate(`/coral/${coralInternalId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">STINAPA Dashboard</h1>

      <div className="mb-8">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select Dive Site
        </label>
        <select
          value={selectedSiteId || ''}
          onChange={handleSiteChange}
          className="shadow border rounded w-full md:w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select a dive site...</option>
          {diveSites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corals.map((coral) => (
            <div
              key={coral.internal_id}
              onClick={() => handleCoralClick(coral.internal_id)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={apiService.getImageUrl(coral.thumbnail)}
                  alt={`Coral ${coral.internal_id}`}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  ID: {coral.internal_id}
                </p>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(coral.last_updated_timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && corals.length === 0 && selectedSiteId && (
        <div className="text-center py-4 text-gray-600">
          No corals found for this dive site.
        </div>
      )}
    </div>
  );
};

export default StinapaDashboardPage;