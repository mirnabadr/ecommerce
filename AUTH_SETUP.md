# Authentication System Setup

## Overview
This authentication system is built with Better Auth, Drizzle ORM, and PostgreSQL (Neon), supporting both authenticated users and guest sessions.

## Structure

### Database Schemas
All auth-related schemas are located in `src/lib/db/schema/`:

- **`user.ts`** - User table with email, name, emailVerified, image
- **`session.ts`** - Session table for authenticated users (Better Auth managed)
- **`account.ts`** - Account table for email/password and OAuth providers
- **`verification.ts`** - Email verification tokens (for future use)
- **`guest.ts`** - Guest session table for unauthenticated users

### Server Actions
Located in `src/lib/auth/actions.ts`:

- `signUp(formData)` - Register new user
- `signIn(formData)` - Sign in existing user
- `signOut()` - Sign out current user
- `createGuestSession()` - Create new guest session
- `guestSession()` - Get or create guest session
- `mergeGuestCartWithUserCart(userId)` - Migrate guest cart to user

### Validation
Zod schemas in `src/lib/auth/validations.ts`:
- `signUpSchema` - Validates sign up form data
- `signInSchema` - Validates sign in form data

## Cookie Management

- **`auth_session`** - Managed by Better Auth for authenticated users
- **`guest_session`** - UUID token for guest users
  - HttpOnly: true
  - Secure: true (production)
  - SameSite: strict
  - Path: /
  - MaxAge: 7 days

## Next Steps

1. **Run Database Migrations:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Update MCP Configuration:**
   - Edit `~/.cursor/mcp.json`
   - Add your Neon API key and project ID
   - Restart Cursor

3. **Environment Variables:**
   Ensure `.env.local` has:
   ```
   DATABASE_URL=your_neon_connection_string
   BETTER_AUTH_SECRET=your_secret_key
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Integrate with Sign Up/Sign In Pages:**
   - Update `src/app/(auth)/sign-up/page.tsx` to use `signUp` action
   - Update `src/app/(auth)/sign-in/page.tsx` to use `signIn` action

## Notes

- MVP setup: Email/password only, no email verification
- OAuth support is planned post-MVP (schema ready)
- Guest-to-user cart migration is ready (cart schema needed)
- All routes are public except checkout (to be implemented)

