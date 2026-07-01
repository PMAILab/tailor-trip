import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Discover from './pages/Discover';
import Explore from './pages/Explore';
import TripDetails from './pages/TripDetails';
import Shortlist from './pages/Shortlist';
import Compare from './pages/Compare';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import Profile from './pages/Profile';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/itinerary/new" element={<ItineraryBuilder />} />
          <Route path="/itinerary/:id" element={<ItineraryView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
