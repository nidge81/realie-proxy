// Vercel Serverless Function - Realie API Proxy
// File: api/realie.js

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get query parameters
  const { address, state } = req.query;

  if (!address || !state) {
    return res.status(400).json({ 
      error: 'Missing required parameters: address and state are required' 
    });
  }

  try {
    // Build Realie API URL
    const params = new URLSearchParams({
      address: address,
      state: state,
    });

    const realieUrl = `https://app.realie.ai/api/public/property/address/?${params.toString()}`;

    console.log('Calling Realie API:', realieUrl);

    // Call Realie API with your API key
    const response = await fetch(realieUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'e24535aec5774fd3120cd76255ad38b5',
        'Accept': 'application/json',
      },
    });

    console.log('Realie response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Realie API error:', errorText);
      return res.status(response.status).json({ 
        error: `Realie API error: ${errorText}` 
      });
    }

    const data = await response.json();
    console.log('Realie data received');

    // Return the data
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
