'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Bot protection for public forms (waitlist, contact/help queries, feedback).
// Adds a Cloudflare Turnstile widget plus a hidden honeypot field; the backend
// verifies both (see actionboard_back/abuse_protection.py).

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise = null;

function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Failed to load Turnstile'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

function TurnstileWidget({ onToken }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let widgetId;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => onToken(token),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        });
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      if (widgetId !== undefined) window.turnstile?.remove(widgetId);
    };
  }, [onToken]);

  return <div ref={containerRef} className="flex justify-center" />;
}

/**
 * Usage:
 *   const guard = usePublicFormGuard();
 *   // in submit: if (!guard.isReady) return; post {...data, ...guard.payload}; finally guard.reset()
 *   // in JSX, above the submit button: {guard.fields}
 */
export function usePublicFormGuard() {
  const [token, setToken] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [widgetKey, setWidgetKey] = useState(0);

  // Tokens are single-use, so every submit attempt needs a fresh widget.
  const reset = useCallback(() => {
    setToken('');
    setWidgetKey((k) => k + 1);
  }, []);

  const fields = (
    <>
      {/* Honeypot: hidden from humans; bots that fill every input get dropped server-side.
          The DOM name is deliberately unusual so browser autofill leaves it alone. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Leave this field empty
          <input
            type="text"
            name="nm_contact_hp"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>
      <TurnstileWidget key={widgetKey} onToken={setToken} />
    </>
  );

  return {
    // When no site key is configured (e.g. local dev without keys), don't block submits.
    isReady: !SITE_KEY || Boolean(token),
    payload: { cf_turnstile_response: token, website: honeypot },
    fields,
    reset,
  };
}
