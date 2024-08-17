import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handle_get_token_balance } from '../wallet/balance';
import { handle_transfer_token } from '../wallet/transfer';

function DashboardVoter() {
    const [candidate_list, set_candidate_list] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        get_candidate();
    }, []);

    const get_candidate = async () => {
        try {
            const candidate_list = await axios.get('http://localhost:3001/api/get_candidate');
            set_candidate_list(candidate_list.data);
        } catch (error) {
            alert('Invalid candidate details.');
            console.error('Error adding Candidate into database', error);
        }
    }

    const vote = async (candidate_id) => {
        try {
          await axios.patch(`http://localhost:3001/api/voter_voted/${localStorage.getItem("wallet_email_user")}`);
          await axios.post(`http://localhost:3001/api/voter_vote/${candidate_id}`);
          sessionStorage.setItem("token_wallet_address_to", process.env.REACT_APP_CONTRACT_OWNER);
          sessionStorage.setItem("token_wallet_address", localStorage.getItem("wallet_address_voter"));
          sessionStorage.setItem("token_amount", 1);
          handle_transfer_token();
          setTimeout(() => {
            handle_get_token_balance();
          }, 10000);
          alert('Vote submitted successfully');
          get_candidate();
          sessionStorage.setItem("wallet_address_user", localStorage.getItem("wallet_address_voter"));
          setTimeout(() => {
            handle_get_token_balance();
          }, 10000);
          navigate('../../');
        } catch (error) {
          alert('Error vote submission');
          console.error('Error incrementing vote count in the database', error);
        }
    }

    return (
        <div>
            <h4>Candidate List</h4>
            {candidate_list.map((candidate) => {
            return(
                <li key={candidate.candidate_id}>
                {candidate.candidate_name} - ID: {candidate.candidate_id}
                <button onClick={() => vote(candidate.candidate_id)}>
                Vote
                </button>
                </li>
            )})}
        </div>
    );
}
export default DashboardVoter;