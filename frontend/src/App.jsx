import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import JobDetail from './pages/JobDetail';
import FreelancerProfile from './pages/FreelancerProfile';
import ProtectedRoute from './pages/ProtectedRoute';
import CreateJob from './pages/CreateJob';
import ClientJobView from './pages/ClientJobView';
import DisputeTicket from './pages/DisputeTicket';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './pages/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<Navigate to="/explore" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/jobs/create" element={<CreateJob />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/explore/:id" element={<FreelancerProfile />} />
        <Route path="/my-jobs" element={<ClientJobView />} />
        <Route path="/my-jobs/:id" element={<ClientJobView />} />
        {/* Part 4: any contract participant can file a dispute */}
        <Route path="/contracts/:id/dispute" element={<DisputeTicket />} />
      </Route>

      {/* Part 4: Admin-only routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;