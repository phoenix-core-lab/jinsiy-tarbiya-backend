import * as crypto from 'crypto';

export function getClickHeader() {
  const timestamp = Date.now().toString().slice(0, 10);
  // Function to compute SHA-1 hash of a string
  function computeSHA1(input) {
    const sha1Hash = crypto.createHash('sha1');
    sha1Hash.update(input);
    return sha1Hash.digest('hex');
  }
  // Function to generate SHA-1 hash of (timestamp + secret_key)
  function generateSHA1(timestamp, secretKey) {
    const inputString = timestamp + secretKey;
    const compute = computeSHA1(inputString);
    return compute;
  }
  const sha1Hash = generateSHA1(timestamp, process.env.CLICK_SECRET_KEY);
  const auth =
    process.env.CLICK_MERCHANT_USER_ID + ':' + sha1Hash + ':' + timestamp;
  const authHeaders = new Headers();
  authHeaders.append('accept', 'application/json');
  authHeaders.append('Content-Type', 'application/json');
  authHeaders.append('Auth', auth);

  return authHeaders;
}
