import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  type User,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useNavigate, useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";

// Credentials pulled from environment variables (configure in .env)
const apiKey = import.meta.env.VITE_STREAM_API_KEY as string;
const apiSecret = import.meta.env.VITE_STREAM_API_SECRET as string;
const fallbackUserId = "xdegen_user";
const fallbackUserName = "Xdegen User";

const makeUser = (id: string, name: string): User => ({
  id,
  name,
  image: `https://getstream.io/random_svg/?id=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}`,
});

const MyUILayout: React.FC = () => {
  const shareLink = typeof window !== "undefined" ? window.location.href : "";

  return (
    <StreamTheme>
      {/* Top bar with share link */}
      <div className="w-full flex items-center justify-end px-4 py-2">
        <button
          onClick={() => navigator.clipboard.writeText(shareLink)}
          className="py-2 px-4 rounded-md text-white border border-primary/20 bg-primary/10 hover:bg-primary/20 transition-all duration-200"
        >
          Copy invite link
        </button>
      </div>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};

const VideoCall: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [isJoining, setIsJoining] = useState(true);
  const { publicKey } = useWallet();

  // Resolve callId from URL; if missing, generate one and redirect for shareable link
  const resolvedCallId = useMemo(() => {
    return params.callId ?? "";
  }, [params.callId]);

  useEffect(() => {
    if (!resolvedCallId) {
      const newId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      navigate(`/call/${newId}`, { replace: true });
    }
  }, [resolvedCallId, navigate]);

  const envToken = (import.meta.env.VITE_STREAM_USER_TOKEN as string | undefined) || undefined;

  const userFromWalletOrEnv = useMemo(() => {
    const walletAddress = publicKey?.toBase58();
    const walletDisplay = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : undefined;
    // If an env token is provided, we MUST use its user_id as the user.id
    if (envToken) {
      const idFromToken = safeExtractUserIdFromJwt(envToken) || fallbackUserId;
      // Name should reflect wallet address when available
      const displayName = walletDisplay || `${idFromToken}`;
      return makeUser(idFromToken, displayName);
    }
    const displayName = walletDisplay || fallbackUserName;
    const id = walletAddress || fallbackUserId;
    return makeUser(id, displayName);
  }, [envToken, publicKey]);

  const [token, setToken] = useState<string | null>(envToken || null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (envToken) {
          setToken(envToken);
          return;
        }
        const payload = {
          user_id: userFromWalletOrEnv.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        };
        const t = await generateHs256Jwt(apiSecret, payload);
        if (!cancelled) setToken(t);
      } catch (e) {
        console.error("Failed to generate token", e);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [apiSecret, envToken, userFromWalletOrEnv.id]);

  const client = useMemo(() => {
    if (!token) return undefined;
    return new StreamVideoClient({ apiKey, user: userFromWalletOrEnv, token });
  }, [apiKey, userFromWalletOrEnv, token]);
  const call = useMemo(() => (client && resolvedCallId ? client.call("default", resolvedCallId) : undefined), [client, resolvedCallId]);

  useEffect(() => {
    let cancelled = false;
    const join = async () => {
      if (!call) return;
      try {
        setIsJoining(true);
        await call.join({ create: true });
      } finally {
        if (!cancelled) setIsJoining(false);
      }
    };
    join();
    return () => {
      cancelled = true;
    };
  }, [call]);

  const handleCopy = useCallback(() => {
    const href = window.location.href;
    navigator.clipboard.writeText(href);
  }, []);

  // Friendly, fast loading state overlay while joining
  if (!client || !call || isJoining) {
    const shareLink = typeof window !== "undefined" ? window.location.href : "";
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center gap-6 bg-[#0c0c0c] text-white">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse [animation-delay:120ms]" />
          <div className="h-3 w-3 rounded-full bg-emerald-600 animate-pulse [animation-delay:240ms]" />
        </div>
        <div className="text-lg">Preparing your call...</div>
        <div className="text-sm text-white/60 -mt-4">Optimizing audio & video quality</div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleCopy}
            className="py-2 px-4 rounded-md text-white border border-primary/20 bg-primary/10 hover:bg-primary/20 transition-all duration-200"
          >
            Copy invite link
          </button>
          {shareLink && (
            <a
              href={`mailto:?subject=Xdegen%20Call%20Invite&body=Join%20my%20call:%20${encodeURIComponent(shareLink)}`}
              className="py-2 px-4 rounded-md text-white border border-primary/20 bg-primary/10 hover:bg-primary/20 transition-all duration-200"
            >
              Share via email
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        {/* Redirect to /home when call ends */}
        <CallEndRedirect />
        <MyUILayout />
      </StreamCall>
    </StreamVideo>
  );
};

export default VideoCall;

// Internal component to observe call state and redirect on leave
const CallEndRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT || callingState === CallingState.IDLE) {
      navigate("/home", { replace: true });
    }
  }, [callingState, navigate]);
  return null;
};

// Minimal HS256 JWT generator using Web Crypto API
async function generateHs256Jwt(secret: string, payload: Record<string, unknown>): Promise<string> {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const base64url = (data: Uint8Array) =>
    btoa(String.fromCharCode(...data))
      .replace(/=+/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  const encodePart = (obj: unknown) => base64url(enc.encode(JSON.stringify(obj)));

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  const unsigned = `${encodePart(header)}.${encodePart(payload)}`;
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(unsigned));
  const signature = base64url(new Uint8Array(sigBuf));
  return `${unsigned}.${signature}`;
}

// Extract user_id from JWT without verification (safe enough for selecting matching id)
function safeExtractUserIdFromJwt(jwt: string): string | null {
  try {
    const [, payloadB64] = jwt.split(".");
    const json = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json?.user_id === "string" ? json.user_id : null;
  } catch {
    return null;
  }
}


