const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Special handling for direct access to routes that should be handled by React Router
app.get('/signup', (req, res) => {
  console.log('Redirecting /signup to /#/signup');
  res.redirect('/#/signup');
});

app.get('/login', (req, res) => {
  console.log('Redirecting /login to /#/login');
  res.redirect('/#/login');
});

app.get('/dashboard', (req, res) => {
  console.log('Redirecting /dashboard to /#/dashboard');
  res.redirect('/#/dashboard');
});

app.get('/invoices', (req, res) => {
  console.log('Redirecting /invoices to /#/invoices');
  res.redirect('/#/invoices');
});

app.get('/payments', (req, res) => {
  console.log('Redirecting /payments to /#/payments');
  res.redirect('/#/payments');
});

app.get('/reports', (req, res) => {
  console.log('Redirecting /reports to /#/reports');
  res.redirect('/#/reports');
});

app.get('/clients', (req, res) => {
  console.log('Redirecting /clients to /#/clients');
  res.redirect('/#/clients');
});

// API requests should be proxied to the backend
// This is just a placeholder - your frontend should handle API calls directly
app.use('/api', (req, res) => {
  res.status(404).send('API endpoint not found on frontend server');
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  console.log(`Serving index.html for: ${req.url}`);
  
  // Check if the build/index.html file exists
  const indexPath = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('Error: build/index.html does not exist');
    
    // Try to serve the fallback HTML
    const fallbackPath = path.join(__dirname, 'build', 'fallback.html');
    if (fs.existsSync(fallbackPath)) {
      console.log('Serving fallback.html instead');
      res.sendFile(fallbackPath);
    } else {
      // If fallback doesn't exist either, serve a simple error message
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1>Server Error</h1>
          <p>The application is currently unavailable. Please try again later.</p>
          <p><a href="/">Try going to the homepage</a></p>
        </body>
        </html>
      `);
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'build')}`);
  
  // Check if the build directory exists
  const buildPath = path.join(__dirname, 'build');
  if (fs.existsSync(buildPath)) {
    console.log('Build directory exists');
    
    // List files in the build directory
    const files = fs.readdirSync(buildPath);
    console.log('Files in build directory:', files);
    
    // Check if index.html exists
    if (fs.existsSync(path.join(buildPath, 'index.html'))) {
      console.log('index.html exists in build directory');
    } else {
      console.error('ERROR: index.html does not exist in build directory');
      
      // Copy fallback.html to build directory if it doesn't exist there
      const publicFallbackPath = path.join(__dirname, 'public', 'fallback.html');
      const buildFallbackPath = path.join(buildPath, 'fallback.html');
      
      if (fs.existsSync(publicFallbackPath) && !fs.existsSync(buildFallbackPath)) {
        try {
          fs.copyFileSync(publicFallbackPath, buildFallbackPath);
          console.log('Copied fallback.html to build directory');
        } catch (err) {
          console.error('Error copying fallback.html:', err);
        }
      }
    }
  } else {
    console.error('ERROR: Build directory does not exist');
    
    // Create build directory if it doesn't exist
    try {
      fs.mkdirSync(buildPath);
      console.log('Created build directory');
      
      // Copy fallback.html to build directory
      const publicFallbackPath = path.join(__dirname, 'public', 'fallback.html');
      const buildFallbackPath = path.join(buildPath, 'fallback.html');
      
      if (fs.existsSync(publicFallbackPath)) {
        fs.copyFileSync(publicFallbackPath, buildFallbackPath);
        console.log('Copied fallback.html to build directory');
      }
    } catch (err) {
      console.error('Error creating build directory:', err);
    }
  }
}); 