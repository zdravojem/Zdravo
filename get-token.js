const { google } = require('googleapis');
const fs = require('fs');
const http = require('http');
const url = require('url');

const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const { client_id, client_secret } = credentials.installed || credentials.web;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  'http://localhost:3000/callback'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent',
});

console.log('\n✅ Open this URL in your browser:\n');
console.log(authUrl);
console.log('\nWaiting for authorization...\n');

const server = http.createServer(async (req, res) => {
  const query = url.parse(req.url, true).query;
  if (query.code) {
    const { tokens } = await oauth2Client.getToken(query.code);
    fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
    console.log('\n✅ Token saved to token.json!');
    console.log('Your refresh token:', tokens.refresh_token);
    res.end('Authorization successful! You can close this tab.');
    server.close();
  }
});

server.listen(3000);