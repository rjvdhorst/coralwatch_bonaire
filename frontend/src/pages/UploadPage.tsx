import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { Coral, DiveSite } from '../services/apiService';
import CoralSelector from '../components/CoralSelector';

type UploadMode = 'new' | 'existing';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [diveSites, setDiveSites] = useState<DiveSite[]>([]);
  const [selectedDiveSiteId, setSelectedDiveSiteId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCorals, setIsLoadingCorals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('new');
  const [existingCoralsForSite, setExistingCoralsForSite] = useState<Coral[] | null>(null);
  const [selectedExistingCoralId, setSelectedExistingCoralId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dive sites on component mount
    const fetchDiveSites = async () => {
      try {
        const sites = await apiService.getDiveSites();
        setDiveSites(sites);
      } catch (err) {
        setError('Failed to load dive sites');
      }
    };
    fetchDiveSites();
  }, []);

  useEffect(() => {
    // Fetch corals when dive site changes and mode is 'existing'
    const fetchCoralsForSite = async () => {
      if (selectedDiveSiteId && uploadMode === 'existing') {
        setIsLoadingCorals(true);
        try {
          const corals = await apiService.getCoralsAtSite(selectedDiveSiteId);
          setExistingCoralsForSite(corals);
        } catch (err) {
          setError('Failed to load existing corals');
          setExistingCoralsForSite(null);
        } finally {
          setIsLoadingCorals(false);
        }
      } else {
        setExistingCoralsForSite(null);
      }
    };

    setSelectedExistingCoralId(null);
    fetchCoralsForSite();
  }, [selectedDiveSiteId, uploadMode]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleDiveSiteChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const siteId = event.target.value ? parseInt(event.target.value) : null;
    setSelectedDiveSiteId(siteId);
    setError(null);
  };

  const handleUploadModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadMode(event.target.value as UploadMode);
    if (event.target.value === 'new') {
      setSelectedExistingCoralId(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }
    
    if (!selectedDiveSiteId) {
      setError('Please select a dive site');
      return;
    }

    const selectedSite = diveSites.find(site => site.id === selectedDiveSiteId);
    if (!selectedSite) {
      setError('Invalid dive site selected');
      return;
    }

    if (uploadMode === 'existing' && !selectedExistingCoralId) {
      setError('Please select an existing coral or switch to "Upload as New Coral"');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.uploadCoralImage(
        selectedFile,
        selectedSite.name,
        undefined,
        undefined,
        uploadMode === 'existing' ? selectedExistingCoralId : undefined
      );
      
      // Clear form and preview
      setSelectedFile(null);
      setSelectedDiveSiteId(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      // Navigate to the coral's timeline page
      navigate(`/coral/${response.coral_internal_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Coral Image</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Dive Site
          </label>
          <select
            value={selectedDiveSiteId?.toString() || ''}
            onChange={handleDiveSiteChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            disabled={isLoading}
          >
            <option value="">Select a dive site</option>
            {diveSites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Upload Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="new"
                checked={uploadMode === 'new'}
                onChange={handleUploadModeChange}
                className="mr-2"
              />
              Upload as New Coral
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="existing"
                checked={uploadMode === 'existing'}
                onChange={handleUploadModeChange}
                className="mr-2"
              />
              Add to Existing Coral
            </label>
          </div>
        </div>

        {uploadMode === 'existing' && selectedDiveSiteId && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Existing Coral
            </label>
            <CoralSelector
              corals={existingCoralsForSite}
              selectedCoralId={selectedExistingCoralId}
              onSelect={setSelectedExistingCoralId}
              isLoading={isLoadingCorals}
              apiService={apiService}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Coral Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            disabled={isLoading}
          />
        </div>

        {previewUrl && (
          <div className="mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;