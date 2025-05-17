import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import StinapaDashboardPage from './pages/StinapaDashboardPage';
import CoralTimelinePage from './pages/CoralTimelinePage';
import DiveSitesPage from './pages/DiveSitesPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<StinapaDashboardPage />} />
            <Route path="/coral/:coralInternalId" element={<CoralTimelinePage />} />
            <Route path="/dive-sites" element={<DiveSitesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;