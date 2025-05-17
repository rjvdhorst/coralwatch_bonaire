import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService, type CoralObservation } from '../services/apiService';

const CoralTimelinePage = () => {
  const { coralInternalId } = useParams<{ coralInternalId: string }>();
  const [observations, setObservations] = useState<CoralObservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!coralInternalId) {
        setError('No coral ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiService.getCoralTimeline(coralInternalId);
        setObservations(data);
        setError(null);
      } catch (err) {
        setError('Failed to load coral timeline');
        console.error('Error fetching coral timeline:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [coralInternalId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading coral timeline...</div>
      </div>
    );
  }

  if (error || !coralInternalId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Invalid coral ID'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Coral Timeline
        <span className="text-gray-500 text-xl ml-4">ID: {coralInternalId}</span>
      </h1>

      {observations.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No observations found for this coral.
        </div>
      ) : (
        <div className="space-y-8">
          {observations.map((obs, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <a 
                    href={apiService.getImageUrl(obs.image_filename)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img
                      src={apiService.getImageUrl(obs.image_filename)}
                      alt={`Observation from ${obs.timestamp}`}
                      className="h-64 w-full md:w-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(obs.timestamp).toLocaleString()}
                  </div>
                  
                  {obs.status && (
                    <div className="mb-4">
                      <span className="font-semibold">Status: </span>
                      <span className={`inline-block px-2 py-1 rounded ${
                        obs.status.toLowerCase().includes('healthy')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {obs.status}
                      </span>
                    </div>
                  )}

                  {obs.notes && (
                    <div>
                      <span className="font-semibold">Notes: </span>
                      <p className="text-gray-700">{obs.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoralTimelinePage;