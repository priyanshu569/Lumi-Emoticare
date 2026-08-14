const CREDENTIAL_KEY = "lumi_biometric_credential_id";

function bufToBase64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(base64: string) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

export async function isBiometricAvailable() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function hasBiometricCredential() {
  return typeof window !== "undefined" && !!localStorage.getItem(CREDENTIAL_KEY);
}

// Registers a platform-authenticator credential purely as a local device
// gate — the assertion is never sent to a server, since it only guards
// re-entry into an already-authenticated session on this device.
export async function registerBiometricCredential(userId: string, email: string) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Lumi", id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(userId),
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Could not create a credential.");
  localStorage.setItem(CREDENTIAL_KEY, bufToBase64(credential.rawId));
}

export function clearBiometricCredential() {
  localStorage.removeItem(CREDENTIAL_KEY);
}

export async function verifyBiometric() {
  const stored = localStorage.getItem(CREDENTIAL_KEY);
  if (!stored) return false;

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: base64ToBuf(stored), type: "public-key" }],
      userVerification: "required",
      timeout: 60000,
    },
  });
  return !!assertion;
}
