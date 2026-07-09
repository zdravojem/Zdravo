const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const r2 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.CF_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEYS,
  },
});
r2.send(new ListBucketsCommand({}))
  .then(d => console.log('Buckets found:', d.Buckets.map(b => b.Name)))
  .catch(e => console.error('Error:', e.message));
