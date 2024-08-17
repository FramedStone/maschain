import { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardPublic() {
    const [election_date, set_election_date] = useState(null);
    const [time_remaining, set_time_remaining] = useState({days: 0, hours: 0, minutes: 0, seconds: 0});

    const [candidate_list, set_candidate_list] = useState([]);

    // Function to update the remaining time
    useEffect(() => {
        set_election_date(localStorage.getItem('election_time'))
        if (election_date !== null) {
            const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(election_date).getTime() - now;

            if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            set_time_remaining({ days, hours, minutes, seconds });
            } else {
            clearInterval(interval);
            set_time_remaining({days: 0, hours: 0, minutes: 0, seconds: 0});
            localStorage.setItem('election_time', 0);
            }
        }, 1000);

        return () => clearInterval(interval);
        }
    }, [election_date]);

    useEffect(() => {
        get_candidate();
    }, []);

    const get_candidate = async () => {
        try {
            const candidate_list = await axios.get('http://localhost:3001/api/get_candidate');
            set_candidate_list(candidate_list.data);
        } catch (error) {
            console.error('Error adding Candidate into database', error);
        }
    }

    return (
        <div>
            <h1>Public Interface</h1>
            <h4>Election Time Remaining</h4>
            {time_remaining.days === 0 && time_remaining.hours === 0 && time_remaining.minutes === 0 && time_remaining.seconds === 0 ? 
            <p>Election has ended!</p>
            : 
            <p>
                {time_remaining.days} Days, {time_remaining.hours} Hours, {time_remaining.minutes} Minutes, {time_remaining.seconds} Seconds
            </p>}
            <div>
            <h4>Result</h4>
            {candidate_list.map((candidate) => {
            return(
                <li key={candidate.candidate_id}>
                {candidate.candidate_name} - ID: {candidate.candidate_id} - Vote Count: {candidate.candidate_vote_count}
                </li>
            )})}
        </div>
        </div>
    );
}
export default DashboardPublic;