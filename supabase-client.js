// ==========================================================================
// CYBERNEXA — Real backend auth via Supabase
//
// This replaces the old localStorage-only mock auth with a real database +
// authentication service. Accounts are created for real, passwords are
// hashed server-side by Supabase (never stored in plaintext), and sessions
// are managed securely. The publishable key below is meant to be public —
// it only allows what your Row Level Security rules permit.
// ==========================================================================

const SUPABASE_URL = 'https://pevuvovlzgfyoigohnbb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_TF2_FPBGyfsqBfYpnjW5GQ_DRktRihV';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Register a new account.
 * Returns { ok: true, user } or { ok: false, error }.
 */
async function registerUser({ name, email, password }) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // If email confirmation is still enabled on the project, there will be
  // no active session yet even though the account was created.
  if (!data.session) {
    return {
      ok: true,
      user: data.user,
      needsConfirmation: true,
    };
  }

  return { ok: true, user: data.user };
}

/**
 * Sign in an existing account.
 * Returns { ok: true, user } or { ok: false, error }.
 */
async function loginUser({ email, password }) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, user: data.user };
}

/**
 * Get the current session (or null).
 */
async function getSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

/**
 * Sign out and redirect to login.
 */
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

/**
 * Protect a page: redirect to login if there's no active session.
 * Call this with `await` at the top of a protected page's script.
 */
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

/**
 * Send a password-reset email. The link opens reset.html.
 */
async function sendPasswordReset(email) {
  const redirectTo = new URL('reset.html', window.location.href).href;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Set a new password for the user opened via a reset link.
 */
async function updatePassword(password) {
  const { error } = await supabaseClient.auth.updateUser({ password });
  return error ? { ok: false, error: error.message } : { ok: true };
}
