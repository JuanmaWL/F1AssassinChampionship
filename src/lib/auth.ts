/**
 * Simple SHA-256 hashing for client-side password verification.
 * Note: This is not a replacement for proper server-side authentication,
 * but it prevents the password from being stored in plain text in the repo.
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(inputPassword: string): Promise<boolean> {
  const envHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
  
  if (!envHash) {
    console.warn("Admin password hash not set in environment variables.");
    return false;
  }

  const inputHash = await hashPassword(inputPassword);
  return inputHash === envHash;
}
