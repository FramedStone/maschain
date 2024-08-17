import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handle_transfer_token } from '../wallet/transfer';
import { handle_get_token_balance } from '../wallet/balance';
import { handle_mint_token } from '../wallet/mint';

function DashboardHost() {
  const [candidate_name, set_candidat_name] = useState('');
  const [candidate_id, set_candidate_id] = useState('');
  const [candidate_list, set_candidate_list] = useState([]);

  const [voter_list, set_voter_list] = useState([]);

  const [election_date, set_election_date] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    get_candidate();
    get_voter();
  }, []);

  const add_candidate = async () => {
    try {
      await axios.post('http://localhost:3001/api/add_candidate', { candidate_name, candidate_id });
      alert('Candidate added successfully');
      set_candidat_name('');
      set_candidate_id('');
      get_candidate();
    } catch (error) {
      alert('Invalid candidate details.');
      console.error('Error adding Candidate into database', error);
    }
  }

  const get_candidate = async () => {
    try {
      const candidate_list = await axios.get('http://localhost:3001/api/get_candidate');
      set_candidate_list(candidate_list.data);
    } catch (error) {
      console.error('Error fetching Candidates from database', error);
    }
  }

  const remove_candidate = async (candidate_id) => {
    try {
      await axios.delete(`http://localhost:3001/api/remove_candidate/${candidate_id}`);
      alert('Candidate removed successfully');
      get_candidate(); // Refresh the candidate list after removing a candidate
    } catch (error) {
      alert('Error removing candidate');
      console.error('Error removing Candidate from the database', error);
    }
  }

  const get_voter = async () => {
    try {
      const voter_list = await axios.get('http://localhost:3001/api/get_voter');
      set_voter_list(voter_list.data);
    } catch (error) {
      console.error("Error fetching Voters from database", error);
    }
  }

  const verify_voter = async (voter_email) => {
    try {
      await axios.patch(`http://localhost:3001/api/verify_voter/${voter_email}`);
      alert("Voter's status updated");
      // if (handle_get_token_balance() === '0') {
        sessionStorage.setItem("token_wallet_address", process.env.REACT_APP_CONTRACT_OWNER);
        sessionStorage.setItem("token_wallet_address_to", process.env.REACT_APP_CONTRACT_OWNER);
        sessionStorage.setItem("token_amount", 1);
        await handle_mint_token();
      // } else {

        sessionStorage.setItem("token_wallet_address", process.env.REACT_APP_CONTRACT_OWNER);
        sessionStorage.setItem("token_wallet_address_to", localStorage.getItem("wallet_address_voter"));
        sessionStorage.setItem("token_amount", 1);
        await handle_transfer_token();
        sessionStorage.setItem("wallet_address_user", localStorage.getItem("wallet_address_voter"));
        setTimeout(() => {
          handle_get_token_balance();
        }, 10000);
        get_voter();
      // }
    } catch (error) {
      console.error("Error vverifying voter status", error);
    }
  }

  const remove_voter = async (voter_email) => {
    try {
      await axios.patch(`http://localhost:3001/api/remove_voter/${voter_email}`);
      alert("Voter's status updated");

      sessionStorage.setItem("token_wallet_address", localStorage.getItem("wallet_address_voter"));
      sessionStorage.setItem("token_wallet_address_to", process.env.REACT_APP_CONTRACT_OWNER);
      sessionStorage.setItem("token_amount", 1);
      await handle_transfer_token();
      sessionStorage.setItem("wallet_address_user", localStorage.getItem("wallet_address_voter"));
      setTimeout(() => {
        handle_get_token_balance();
      }, 10000);
      get_voter();
    } catch (error) {
      console.error("Error vverifying voter status", error);
    }
  }

  const start_election = () => {
    localStorage.setItem('election_time', election_date);
    alert("Election started successfully");
    navigate('../public/dashboard');
  }

  const reset_election = async () => {
    localStorage.setItem('election_time', 0);
    axios.delete('http://localhost:3001/api/reset_election');
    alert("Election reset successfully");
    navigate('../../');
  }

  return (
    <div>
      <h1>Host Interface</h1>
      <h4>Add Candidate</h4>
      <div>
        <input
          type="text"
          value={candidate_name}
          placeholder="candidate name"
          onChange={(e) => set_candidat_name(e.target.value)}
        />
        <input
          type="text"
          value={candidate_id}
          placeholder="candidate id"
          onChange={(e) => set_candidate_id(e.target.value)}
        />
        <button onClick={add_candidate}>
          Add Candidate
        </button>
      </div>
      <div>
        <h4>Candidate List</h4>
        {candidate_list.map((candidate) => {
          return(
            <li key={candidate.candidate_id}>
            {candidate.candidate_name} - ID: {candidate.candidate_id} - Vote Count: {candidate.candidate_vote_count}
            <button onClick={() => remove_candidate(candidate.candidate_id)} disabled={localStorage.getItem('election_time') !== '0' }>
              Remove
            </button>
            </li>
        )})}
      </div>
      <div>
        <h4>Voter List</h4>
        {voter_list.map((voter) => {
          return(
            <li key={voter.voter_email}>
            {voter.voter_email} - status: {voter.voter_status}
            {voter.voter_status === "pending" ? <button onClick={() => verify_voter(voter.voter_email)} disabled={voter.voter_status === "voted"}>
              Verify
            </button>
            :
            <button onClick={() => remove_voter(voter.voter_email)} disabled={voter.voter_status === "voted"}>
              Set Pending 
            </button>
            }
            </li>
        )})}
      </div>
      <div>
        <h4>Election Interface</h4>
        <div>
          <input
            type="datetime-local"
            value={election_date}
            onChange={(e) => set_election_date(e.target.value)}
          />
          {localStorage.getItem('election_time') === '0' ? <button onClick={start_election}>
            Start Election
          </button> : <button onClick={reset_election}>
            Reset Election
          </button>}

        </div>
      </div>
    </div>
  );
}

export default DashboardHost;
