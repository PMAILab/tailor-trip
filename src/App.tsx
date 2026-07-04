import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './state/AuthContext';
import { AppProvider } from './state/AppContext';
import { ItineraryProvider } from './state/ItineraryContext';
import Layout from './components/Layout';
import SignInModal from './components/auth/SignInModal';
import Gated from './components/auth/Gated';

// Route-level code splitting keeps the initial bundle small.
const Landing = lazy(() => import('./pages/Landing'));
const Discover = lazy(() => import('./pages/Discover'));
const Explore = lazy(() => import('./pages/Explore'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const Shortlist = lazy(() => import('./pages/Shortlist'));
const Compare = lazy(() => import('./pages/Compare'));
const ItineraryBuilder = lazy(() => import('./pages/ItineraryBuilder'));
const ItineraryView = lazy(() => import('./pages/ItineraryView'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ItineraryProvider>
          <BrowserRouter>
            <Layout>
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </Layout>
            <SignInModal />
          </BrowserRouter>
        </ItineraryProvider>
      </AppProvider>
    </AuthProvider>
  );
}
