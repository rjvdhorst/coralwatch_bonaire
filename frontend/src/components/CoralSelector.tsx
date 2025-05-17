import React from 'react';
import { Coral } from '../services/apiService';

interface CoralSelectorProps {
  corals: Coral[] | null;
  selectedCoralId: string | null;
  onSelect: (coralId: string | null) => void;
  isLoading: boolean;
  apiService: {
    getImageUrl: (filename: string) => string;
  };
}

const CoralSelector: React.FC<CoralSelectorProps> = ({
  corals,
  selectedCoralId,
  onSelect,
  isLoading,
  apiService,
}) => {
  if (isLoading) {
    return <div className="text-gray-600">Loading existing corals...</div>;
  }

  if (!corals || corals.length === 0) {
    return <div className="text-gray-600">No existing corals found at this site.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {corals.map((coral) => (
        <div
          key={coral.internal_id}
          className={`
            p-2 border rounded-lg cursor-pointer transition-all
            ${selectedCoralId === coral.internal_id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
            }
          `}
          onClick={() => onSelect(coral.internal_id)}
        >
          <div className="aspect-square overflow-hidden rounded mb-2">
            <img
              src={apiService.getImageUrl(coral.thumbnail)}
              alt={`Coral ${coral.internal_id}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-sm text-center text-gray-700 truncate">
            ID: {coral.internal_id}
          </div>
          <div className="text-xs text-center text-gray-500">
            Last updated: {new Date(coral.last_updated_timestamp).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoralSelector;