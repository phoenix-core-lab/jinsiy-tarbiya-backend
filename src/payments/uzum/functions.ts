import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export async function getUzumHeaders(): Promise<Headers> {
  const timestamp = Date.now().toString();

  // Function to compute SHA-256 hash of a file
  function computeSHA256(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  // Function to generate SHA-256 hash of (timestamp + secret_key)
  function generateSHA256(timestamp: string, secretKey: string): string {
    const inputString = timestamp + secretKey;
    return crypto.createHash('sha256').update(inputString).digest('hex');
  }

  const certPath = path.resolve(__dirname, 'cert.pem');
  const signature = computeSHA256(certPath);
  const serviceId = 'your-service-id'; // Update this with your actual service ID
  const sha256Hash = generateSHA256(timestamp, process.env.UZUM_SECRET_KEY!);
  const auth = `${serviceId}:${sha256Hash}:${timestamp}`;

  const authHeaders = new Headers();
  authHeaders.append('accept', 'application/json');
  authHeaders.append('Content-Type', 'application/json');
  authHeaders.append('X-Signature', signature);
  authHeaders.append('X-Service-Id', serviceId);
  authHeaders.append('X-Auth', auth);
  authHeaders.append('Cache-Control', 'no-cache'); // If needed

  return authHeaders;
}
