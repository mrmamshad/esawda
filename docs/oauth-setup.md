# eShauda — Social Sign-In Setup

This guide gets **Login with Google** and **Login with Facebook** working end-to-end for the Bikroy-style login popup (and the top-right "Continue as …" one-tap card on return visits).

The frontend + backend code is already in place; you only need to create the OAuth apps and drop the client IDs into `.env.local`.

---

## 1. Google Sign-In

### Google Cloud Console

1. Go to **https://console.cloud.google.com/apis/credentials**
2. Select (or create) a project — e.g. `eshauda-prod`
3. Configure the **OAuth consent screen**:
   - User type: **External**
   - App name: `eShauda`
   - User support email: your address
   - Authorized domains: `eshauda.com` (add `localhost` for dev)
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
4. **Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Name: `eShauda web`
   - **Authorized JavaScript origins**
     - `http://localhost:3000`   *(dev)*
     - `https://eshauda.com`     *(prod)*
   - **Authorized redirect URIs**
     - `http://localhost:3000/auth/oauth-callback`
     - `https://eshauda.com/auth/oauth-callback`
5. Copy the generated **Client ID** (looks like `12345-abcde.apps.googleusercontent.com`)

### Frontend `.env.local`

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=12345-abcde.apps.googleusercontent.com
```

That's it — no client secret is needed on the frontend because we use the **implicit** flow (returns an access token in the URL fragment which we exchange server-side).

---

## 2. Facebook Login

### Facebook for Developers

1. Go to **https://developers.facebook.com/apps**
2. **Create app → Consumer**
3. Under **Add products**, add **Facebook Login → Web**
4. **Facebook Login → Settings**
   - Client OAuth Login: **Yes**
   - Web OAuth Login: **Yes**
   - Enforce HTTPS: **Yes** (prod), **No** (dev)
   - **Valid OAuth Redirect URIs**
     - `http://localhost:3000/auth/oauth-callback?provider=facebook`
     - `https://eshauda.com/auth/oauth-callback?provider=facebook`
5. **Settings → Basic**
   - App Domains: `localhost` + `eshauda.com`
   - Privacy Policy URL: `https://eshauda.com/pages/privacy`
   - Copy the **App ID**
6. Switch the app **Live** (top bar) once you're ready for real users; while in dev-mode only listed test users can sign in.

### Frontend `.env.local`

```env
NEXT_PUBLIC_FB_APP_ID=1234567890123456
```

---

## 3. Backend routes (already in place)

The Laravel backend exposes three public endpoints — nothing to install (no `laravel/socialite` dependency; we call the providers' REST APIs directly via `Http::`).

| Method | Route                                            | Purpose                                                                 |
|--------|--------------------------------------------------|-------------------------------------------------------------------------|
| POST   | `/api/v1/auth/social/google/callback`            | Exchange Google access-token → eShauda `{ user, token }`                |
| POST   | `/api/v1/auth/social/facebook/callback`          | Exchange Facebook access-token → eShauda `{ user, token }`              |
| POST   | `/api/v1/auth/social/google/silent`              | "Continue as …" one-tap card (email hint → fresh session for that user) |

Users are **upserted by email**, so the same account is reused whether the visitor signs in via Google, Facebook, or the classic email + password form.

Controller: `app/Http/Controllers/Api/V1/SocialAuthController.php`

---

## 4. How the flow works

1. Visitor clicks **Google** (or **Facebook**) in the login popup
2. Frontend redirects to the provider's OAuth URL in a centered popup window
3. User authorises → provider redirects back to `/auth/oauth-callback` with `access_token` in the URL fragment
4. Callback route POSTs the token to `/api/v1/auth/social/{provider}/callback`
5. Backend verifies the token by calling the provider's userinfo endpoint, upserts the user, returns `{ user, token }`
6. Callback route `postMessage`s the result back to the opener window → popup closes → user is logged in
7. **Google only:** the profile is cached in `localStorage.eshauda_google_hint` so the top-right "Continue as [Name]" card appears on the next visit

---

## 5. Troubleshooting

- **"Google sign-in is being configured…"** — `NEXT_PUBLIC_GOOGLE_CLIENT_ID` isn't set (or the dev server wasn't restarted after editing `.env.local`)
- **`redirect_uri_mismatch`** — the URI in the OAuth console must match `${NEXT_PUBLIC_SITE_URL}/auth/oauth-callback` **exactly** (including protocol + port)
- **Facebook: "email did not return"** — the user denied the `email` permission on the consent screen; ask them to re-approve
- **Popup blocked** — some browsers block popups that aren't opened by a user gesture; the click handler in the popup already runs synchronously so this only happens if the user has an aggressive popup blocker
- **Cross-origin `postMessage` ignored** — check that `NEXT_PUBLIC_SITE_URL` matches the browser origin exactly (no trailing slash mismatch)

---

## 6. Local test recipe

```bash
# 1. Set the env vars
echo 'NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-id>' >> .env.local
echo 'NEXT_PUBLIC_FB_APP_ID=<your-id>'        >> .env.local

# 2. Restart Next.js
npm run dev

# 3. Open any ad detail page and click "Message" → popup appears
# 4. Click "Google" → provider popup → consent → auto-redirect
# 5. Refresh the page → the "Continue as …" card appears top-right
```
