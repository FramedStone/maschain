import './App.css';
import LoginRegister from './components/host/login_register.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardHost from './components/host/dashboard.js';
import DashboardVoter from './components/voter/dashboard.js';
import DashboardPublic from './components/public/dashboard.js';

/*
  API_URL/api/wallet/create-user - method: POST

  client_id
  client_secret
  "Content-Type": application/json
*/

function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path = "/" element={<LoginRegister />} />
          <Route path="/dashboard" element={<DashboardHost />} />
          <Route path="/voter/dashboard" element={<DashboardVoter />} />
          <Route path="/public/dashboard" element={<DashboardPublic />} />
        </Routes>
      </Router>
      {/* <Create />
      <Mint />
      <LoginRegister/> */}
    </div>
  );
}

export default App;
