// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Response = require('./response');
const UseCase = require('./usecases');
const User = require('./user')
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateMiddleware = require('./middleware');



const app = express();
const port = process.env.PORT || 8000;
const mongoDbUri= 'mongodb+srv://vivek:bhatt@cluster0.tgft48d.mongodb.net/response?retryWrites=true&w=majority'
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // This allows cookies to be sent cross-origin
  }));
  
// Connect to MongoDB Atlas
mongoose.connect(mongoDbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(bodyParser.json());

// Define a route to handle quiz responses
// app.post('/api/userresponses', (req, res) => {
//   const { question, selectedOption } = req.body;

//   if (!question || selectedOption === undefined) {
//     return res.status(400).json({ message: 'Invalid request' });
//   }

//   const response = new Response({
//     question,
//     selectedOption,
//   });

//   response.save()
//     .then(savedResponse => {
//       res.status(201).json({ message: 'Response saved successfully', savedResponse });
//     })
//     .catch(err => {
//       console.error('Error saving response:', err);
//       res.status(500).json({ message: 'Error saving response' });
//     });
// });

app.post('/api/userresponses', authenticateMiddleware, (req, res) => {
  const { question, selectedOption } = req.body;
  const userId = req.user._id; // Get the user ID from the authenticated user

  if (!question || selectedOption === undefined) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const response = new Response({
    question,
    selectedOption,
    userId, // Include the user's ID in the response
  });

  response.save()
    .then(savedResponse => {
      res.status(201).json({ message: 'Response saved successfully', savedResponse });
    })
    .catch(err => {
      console.error('Error saving response:', err);
      res.status(500).json({ message: 'Error saving response' });
    });
});

// app.get('/api/userresponses', async (req, res) => {
//     try {
//       // Fetch all user responses from the database
//       const userResponses = await Response.find({});
//       res.status(200).json(userResponses);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       res.status(500).json({ message: 'Error fetching user responses' });
//     }
//   });

app.get('/api/userresponses', authenticateMiddleware, async (req, res) => {
  const userId = req.user._id; // Get the user ID from the authenticated user
  try {
    // Fetch user-specific responses from the database
    const userResponses = await Response.find({ userId });
    res.status(200).json(userResponses);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    res.status(500).json({ message: 'Error fetching user responses' });
  }
});

// app.patch('/api/userresponses/:question', async (req, res) => {
//     try {
//       const { question } = req.params;
//       const { selectedOption, correctOption } = req.body;
  
//       // Find the existing response by the question
//       const existingResponse = await Response.findOne({ question });
  
//       if (!existingResponse) {
//         return res.status(404).json({ message: 'Response not found' });
//       }
  
//       // Update the selectedOption and correctOption
//       existingResponse.selectedOption = selectedOption;
//       existingResponse.correctOption = correctOption;
  
//       // Save the updated response
//       await existingResponse.save();
  
//       res.status(200).json({ message: 'Response updated successfully' });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

// Modify the patch endpoint to include user authentication
app.patch('/api/userresponses/:question', authenticateMiddleware, async (req, res) => {
  try {
    const { question } = req.params;
    const { selectedOption, correctOption } = req.body;
    const userId = req.user._id; // Get the user's ID from the authenticated user

    // Find the existing response by the question and user
    const existingResponse = await Response.findOne({ question, userId });

    if (!existingResponse) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Update the selectedOption and correctOption
    existingResponse.selectedOption = selectedOption;
    existingResponse.correctOption = correctOption;

    // Save the updated response
    await existingResponse.save();

    res.status(200).json({ message: 'Response updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/usecases', async (req, res) => {
    try {
      const useCasesData = req.body; 
      console.log(useCasesData)

      const savedUseCases = await UseCase.create(useCasesData);
      console.log(savedUseCases);
  
      res.status(201).json({ message: 'Use Cases saved successfully', savedUseCases });
    } catch (error) {
      console.error('Error saving Use Cases:', error);
      res.status(500).json({ message: 'Error saving Use Cases' });
    }
  });

  app.get('/api/usecases', async (req, res) => {
    try {
      const useCases = await UseCase.find({});
      res.status(200).json(useCases);
    } catch (error) {
      console.error('Error fetching Use Cases:', error);
      res.status(500).json({ message: 'Error fetching Use Cases' });
    }
  });

  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Validate input data (you should add more validation)
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
      }
  
      // Check if the user already exists (you should add better error handling)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'email_already_registered' });
      }
  
      // Hash the password before saving it
      const saltRounds = 10; // Number of salt rounds (higher is more secure but slower)
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create a new user with the hashed password
      const newUser = new User({
        username,
        email,
        password: hashedPassword, // Store the hashed password in the database
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }
  
      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Authentication failed' });
      }
  
      // Generate a JWT token for authentication
      const token = jwt.sign({ userId: user._id }, 'hello', {
        expiresIn: '1h', // Token expires in 1 hour (adjust as needed)
      });
  
      res.status(200).json({ message: 'Authentication successful', token });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  }); 
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
