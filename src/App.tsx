import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './state/AuthContext';
import { AppProvider } from './state/AppContext';
import Layout from './components/Layout';
import SignInModal from './components/auth/SignInModal';
import Gated from './components/auth/Gated';
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
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout>
          <Routes>
            {/* Public — discovery is open to everyone */}
            <Route path="/" element={<Landing />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/login" element={<Login />} />

            {/* Personal — soft-gated behind sign in */}
            <Route
              path="/shortlist"
              element={
                <Gated
                  title="Sign in to see your shortlist"
                  description="Save destinations you love and pick them up on any device."
                >
                  <Shortlist />
                </Gated>
              }
            />
            <Route
              path="/compare"
              element={
                <Gated
                  title="Sign in to compare trips"
                  description="Line up your saved destinations side by side and see which one wins."
                >
                  <Compare />
                </Gated>
              }
            />
            <Route
              path="/itinerary/new"
              element={
                <Gated
                  title="Sign in to build an itinerary"
                  description="Get a day by day plan made for your trip, saved to your profile."
                >
                  <ItineraryBuilder />
                </Gated>
              }
            />
            <Route
              path="/itinerary/:id"
              element={
                <Gated
                  title="Sign in to view your itinerary"
                  description="Your saved plans live in your profile once you sign in."
                >
                  <ItineraryView />
                </Gated>
              }
            />
            <Route
              path="/profile"
              element={
                <Gated
                  title="Sign in to view your profile"
                  description="Your saved trips, preferences, and account settings."
                >
                  <Profile />
                </Gated>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Layout>
          <SignInModal />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
