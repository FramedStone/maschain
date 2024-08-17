const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://vanoss22:James%40030813@dvs.5fg61.mongodb.net/?retryWrites=true&w=majority&appName=DVS";
const secret = 'your_jwt_secret'; // Change this to a secure secret key

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db("DVS");
    const collection_host = db.collection("Host");
    const collection_candidate = db.collection("Candidate");
    const collection_voter = db.collection("Voter");

    // Host Register (POST)
    app.post('/api/host_register', async (req, res) => {
      const { host_email, host_password } = req.body;
      try {
        const host_exist = await collection_host.findOne({ host_email });
        if (host_exist) return res.status(409).send('User already exists');
        const hashedPassword = await bcrypt.hash(host_password, 10);
        const result = await collection_host.insertOne({ host_email, host_password: hashedPassword });
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Host Login (POST)
    app.post('/api/host_login', async (req, res) => {
      const { host_email, host_password } = req.body;
      try {
        const user = await collection_host.findOne({ host_email });
        if (!user) return res.status(401).send('Invalid email or password');
        const isMatch = await bcrypt.compare(host_password, user.host_password);
        if (!isMatch) return res.status(401).send('Invalid email or password');
        const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
        res.status(200).send({ token });
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Voter Register (POST)
    app.post('/api/voter_register', async (req, res) => {
      const { voter_email, voter_password } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(voter_password, 10);
        const voter_exist = await collection_voter.findOne({ voter_email });
        if (voter_exist) return res.status(409).send("User already exists");
        const result = await collection_voter.insertOne({ voter_email, voter_password: hashedPassword, voter_status: "pending" });
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Voter Login (POST)
    app.post('/api/voter_login', async (req, res) => {
      const { voter_email, voter_password } = req.body;
      try {
        const user = await collection_voter.findOne({ voter_email });
        if (!user) return res.status(401).send('Invalid email or password');
        const isMatch = await bcrypt.compare(voter_password, user.voter_password);
        if (!isMatch) return res.status(401).send('Invalid email or password');
        const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
        res.status(200).send({ token });
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Get Voter (GET)
    app.get('/api/get_voter', async (req, res) => {
      try {
        const voters = await collection_voter.find().toArray();
        res.status(200).send(voters);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Verify Voter Status (PATCH)
    app.patch('/api/verify_voter/:voter_email', async (req, res) => {
      const { voter_email } = req.params;
      try {
        const result = await collection_voter.updateOne(
          { voter_email },
          { $set: { voter_status: "verified" } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).send('Voter not found');
        }
        res.status(200).send('Voter status updated successfully');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Pending Voter Status (PATCH)
    app.patch('/api/remove_voter/:voter_email', async (req, res) => {
      const { voter_email } = req.params;
      try {
        const result = await collection_voter.updateOne(
          { voter_email },
          { $set: { voter_status: "pending" } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).send('Voter not found');
        }
        res.status(200).send('Voter status updated successfully');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Voted Voter Status (PATCH)
    app.patch('/api/voter_voted/:voter_email', async (req, res) => {
      const { voter_email } = req.params;
      try {
        const result = await collection_voter.updateOne(
          { voter_email },
          { $set: { voter_status: "voted" } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).send('Voter not found');
        }
        res.status(200).send('Voter status updated successfully');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Add Candidate (POST)
    app.post('/api/add_candidate', async (req, res) => {
      const { candidate_name, candidate_id } = req.body;
      try {
        const exist_candidate = await collection_candidate.findOne({ candidate_id });
        if (exist_candidate) return res.status(409).send("Candidate already exists");
        const result = await collection_candidate.insertOne({ candidate_name, candidate_id, candidate_vote_count: 0 });
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Get Candidate (GET)
    app.get('/api/get_candidate', async (req, res) => {
      try {
        const candidates = await collection_candidate.find().toArray();
        res.status(200).send(candidates);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Remove Candidate (DELETE)
    app.delete('/api/remove_candidate/:candidate_id', async (req, res) => {
      const { candidate_id } = req.params;
      try {
        const result = await collection_candidate.deleteOne({ candidate_id });
        if (result.deletedCount === 1) {
          res.status(200).send({ message: 'Candidate removed successfully' });
        } else {
          res.status(404).send({ message: 'Candidate not found' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Increment Candidate Vote Count (POST)
    app.post('/api/voter_vote/:candidate_id', async (req, res) => {
      const { candidate_id, voter_email } = req.params;
      try {
        const result = await collection_candidate.updateOne(
          { candidate_id },
          { $inc: { candidate_vote_count: 1 } } // Increment the vote count by 1
        );
        await collection_voter.updateOne(
          { voter_email },
          { $set: { voter_status: "voted" } }
        );
        if (result.matchedCount === 1) {
          res.status(200).send({ message: 'Vote count incremented successfully' });
        } else {
          res.status(404).send({ message: 'Candidate not found' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.delete('/api/reset_election', async () => {
      try {
        await Promise.all([
          collection_candidate.deleteMany({}),
          collection_voter.deleteMany({}),
        ]);
      } catch (error) {
        console.log(error);
      }
    });
    

    app.listen(3001, () => {
      console.log('Server is running');
    });

  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
}

run().catch(console.dir);