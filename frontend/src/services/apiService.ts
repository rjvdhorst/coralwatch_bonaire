import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Types
export interface DiveSite {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

export interface CoralObservation {
    image_filename: string;
    timestamp: string;
    status: string | null;
    notes: string | null;
}

export interface Coral {
    id: number;
    internal_id: string;
    last_updated_timestamp: string;
    thumbnail: string;
}

// API client setup
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API functions
export const apiService = {
    // Dive Sites
    getDiveSites: async (): Promise<DiveSite[]> => {
        const response = await apiClient.get('/dive_sites');
        return response.data;
    },

    addDiveSite: async (name: string, latitude?: number | null, longitude?: number | null): Promise<DiveSite> => {
        const response = await apiClient.post('/dive_sites', {
            name,
            latitude,
            longitude
        });
        return response.data;
    },

    // Corals at Site
    getCoralsAtSite: async (diveSiteId: number): Promise<Coral[]> => {
        const response = await apiClient.get(`/corals_at_site/${diveSiteId}`);
        return response.data;
    },

    // Coral Timeline
    getCoralTimeline: async (coralInternalId: string): Promise<CoralObservation[]> => {
        const response = await apiClient.get(`/coral_timeline/${coralInternalId}`);
        return response.data;
    },

    // Image Upload
    uploadCoralImage: async (
        imageFile: File,
        diveSiteName: string,
        sctldStatusGuess?: string,
        userNotes?: string,
        existingCoralInternalId?: string
    ): Promise<{
        coral_internal_id: string;
        filename: string;
        dive_site: string;
        message: string;
    }> => {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('dive_site_name', diveSiteName);
        
        if (sctldStatusGuess) formData.append('sctld_status_guess', sctldStatusGuess);
        if (userNotes) formData.append('user_notes', userNotes);
        if (existingCoralInternalId) formData.append('existing_coral_internal_id', existingCoralInternalId);

        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get image URL
    getImageUrl: (filename: string): string => {
        return `${API_BASE_URL}/images/${filename}`;
    },
};

export default apiService;