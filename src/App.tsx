/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import TripDetails from './pages/TripDetails';
import Shortlist from './pages/Shortlist';
import Profile from './pages/Profile';
import NoResults from './pages/NoResults';
import Compare from './pages/Compare';
import { MoodProvider } from './state/MoodContext';

export default function App() {
  return (
    <MoodProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/shortlist" element={<Shortlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/no-results" element={<NoResults />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </Layout>
      </Router>
    </MoodProvider>
  );
}
