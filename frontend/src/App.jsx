import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import JobDetail from './pages/JobDetail';
import FreelancerProfile from './pages/FreelancerProfile';
import PublicProfile from './pages/PublicProfile';
import ProtectedRoute from './pages/ProtectedRoute';
import ClientRoute from './pages/ClientRoute';
import FreelancerRoute from './pages/FreelancerRoute';
import Profile from './pages/Profile';
import MyProposals from './pages/MyProposals';
import Toaster from './components/Toaster';
import CreateJob from './pages/CreateJob';
import ClientJobView from './pages/ClientJobView';
import DisputeTicket from './pages/DisputeTicket';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './pages/AdminRoute';
import { useThemeSync } from './utils/useThemeSync';

function App() {
  // Keeps <html data-mode="..."> in sync with active_role so the Client/
  // Freelancer color palettes (index.css) apply app-wide, live.
  useThemeSync();

  return (
    <>
    <Toaster />
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<Navigate to="/explore" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/explore/:id" element={<FreelancerProfile />} />
        {/* Public profile + reviews of any user: /users/:id?role=freelancer|customer */}
        <Route path="/users/:id" element={<PublicProfile />} />
        {/* Profile page for both modes: the photo and fields shown depend on the active mode */}
        <Route path="/profile" element={<Profile />} />
        {/* Client-mode only: redirects freelancers to /dashboard with a toast */}
        <Route element={<ClientRoute />}>
          <Route path="/jobs/create" element={<CreateJob />} />
          <Route path="/my-jobs" element={<ClientJobView />} />
          <Route path="/my-jobs/:id" element={<ClientJobView />} />
        </Route>
        {/* Freelancer-mode only: redirects clients to /dashboard with a toast */}
        <Route element={<FreelancerRoute />}>
          <Route path="/my-proposals" element={<MyProposals />} />
        </Route>
        {/* Part 4: any contract participant can file a dispute */}
        <Route path="/contracts/:id/dispute" element={<DisputeTicket />} />
      </Route>

      {/* Part 4: Admin-only routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;