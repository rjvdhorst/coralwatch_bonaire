import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome to CoralWatch Bonaire
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Coral Image</h2>
          <p className="mb-4">
            Submit a new coral observation by uploading an image and specifying the dive site location.
          </p>
          <Link
            to="/upload"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload Image
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">STINAPA Dashboard</h2>
          <p className="mb-4">
            View and analyze coral health data across different dive sites in Bonaire.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About CoralWatch Bonaire</h2>
        <p className="mb-4">
          CoralWatch Bonaire is a citizen science initiative to monitor and protect
          coral reef health around Bonaire. By collecting and analyzing coral
          observations, we can better understand and respond to threats to coral
          health.
        </p>
      </div>
    </div>
  );
};

export default HomePage;