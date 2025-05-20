export default async function getPaymeHeaders(secretKet: boolean = false) {
  const authHeaders = new Headers();
  authHeaders.append('Content-Type', 'application/json');
  if (secretKet) {
    authHeaders.append('X-Auth', process.env.PAYME_SECRET_KEY);
  } else {
    authHeaders.append('X-Auth', process.env.PAYME_ID);
  }
  authHeaders.append('Cache-Control', 'no-cache');

  return authHeaders;
}
