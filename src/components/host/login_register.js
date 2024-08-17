import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { handle_create_wallet_voter } from '../wallet/create_user';

function LoginRegister() {
  const [host_email, host_set_email] = useState("");
  const [host_password, host_set_password] = useState('');
  const [host_is_login, host_set_is_login] = useState(true);

  const [voter_name, voter_set_name] = useState('');
  const [voter_email, voter_set_email] = useState('');
  const [voter_ic, voter_set_ic] = useState('');
  const [voter_password, voter_set_password] = useState('');
  const [voter_is_login, voter_set_is_login] = useState(true);

  const [voter_list, voter_set_list] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    get_voter();
  }, []);

  // Function to register a new host
  const register_host = async () => {
    try {
      await axios.post('http://localhost:3001/api/host_register', { host_email, host_password });
      alert('User registered successfully');
      host_set_email('');
      host_set_password('');
      host_set_is_login(true);
    } catch (error) {
      alert('Error registering user: Account Existed');
      console.error('Error registering user:', error);
    }
  };

  // Function to login a host
  const login_host = async () => {
    try {
      await axios.post('http://localhost:3001/api/host_login', { host_email, host_password });
      alert('Login successful');
      host_set_email('');
      host_set_password('');
      navigate('/dashboard');
    } catch (error) {
      alert('Incorrect credentials');
      console.error('Error logging in:', error);
    }
  };

  // Function to register a new voter
  const register_voter = async () => {
    try {
      await axios.post('http://localhost:3001/api/voter_register', { voter_email, voter_password });
      alert('User registered successfully');
      voter_set_email('');
      voter_set_password('');
      voter_set_is_login(true);

      sessionStorage.setItem("wallet_name_user", voter_name);
      localStorage.setItem("wallet_email_user", voter_email);
      sessionStorage.setItem("wallet_ic_user", voter_ic);
      handle_create_wallet_voter();
    } catch (error) {
      alert('Error registering user: Account Existed');
      console.error('Error registering user:', error);
    }
  };

  const get_voter = async () => {
    try {
      const voter_list = await axios.get('http://localhost:3001/api/get_voter');
      voter_set_list(voter_list.data);
    } catch (error) {
      console.error("Error fetching Voters from database", error);
    }
  }

  // Function to login a voter
  const login_voter = async () => {
    try {
      axios.post('http://localhost:3001/api/voter_login', { voter_email, voter_password });

      voter_list.forEach((voter) => {
        if(voter.voter_email === voter_email && voter.voter_status === 'voted') {
          navigate('./public/dashboard');
        }
        if(voter.voter_email === voter_email && voter.voter_status === 'pending') {
          alert("Please wait for host to verify your account");
        }
        if(voter.voter_email === voter_email && voter.voter_status === 'verified') {
          navigate('./voter/dashboard');
        }
      })
    } catch (error) {
      alert('Incorrect credentials');
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="App">
      <h1>{host_is_login ? 'Host Login' : 'Host Register'}</h1>
      <div>
        <input
          type="email"
          value={host_email}
          placeholder="Enter email"
          onChange={(e) => host_set_email(e.target.value)}
        />
        <input
          type="password"
          value={host_password}
          placeholder="Enter password"
          onChange={(e) => host_set_password(e.target.value)}
        />
        <button onClick={() => (host_is_login ? login_host() : register_host())}>
          {host_is_login ? 'Login' : 'Register'}
        </button>
        <button onClick={() => host_set_is_login(!host_is_login)}>
          {host_is_login ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </div>

      <h1>{voter_is_login ? 'Voter Login' : 'Voter Register'}</h1>
      <div>
        { !voter_is_login ? 
        <div>
          <input
            type="name"
            value={voter_name}
            placeholder="Enter name"
            onChange={(e) => voter_set_name(e.target.value)}
          />
          <input
            type="ic"
            value={voter_ic}
            placeholder="Enter IC"
            onChange={(e) => voter_set_ic(e.target.value)}
          />
          </div> : <br/>}
          <input
            type="email"
            value={voter_email}
            placeholder="Enter email"
            onChange={(e) => voter_set_email(e.target.value)}
          />
        <input
          type="password"
          value={voter_password}
          placeholder="Enter password"
          onChange={(e) => voter_set_password(e.target.value)}
        />
        <br/>
        <button onClick={() => (voter_is_login ? login_voter() : register_voter())}>
          {voter_is_login ? 'Login' : 'Register'}
        </button>
        <button onClick={() => voter_set_is_login(!voter_is_login)}>
          {voter_is_login ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </div>
    </div>
  );
}

export default LoginRegister;
