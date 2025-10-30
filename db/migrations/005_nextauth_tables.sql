-- 005_nextauth_tables.sql
-- NextAuth.js required tables for authentication

-- Users table for NextAuth
CREATE TABLE IF NOT EXISTS public.users (
  id            text PRIMARY KEY,
  name          text,
  email         text UNIQUE,
  "emailVerified" timestamptz,
  image         text,
  password      text,
  "createdAt"   timestamptz DEFAULT now(),
  "updatedAt"   timestamptz DEFAULT now()
);

-- Accounts table for NextAuth
CREATE TABLE IF NOT EXISTS public.accounts (
  id                text PRIMARY KEY,
  "userId"          text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type              text NOT NULL,
  provider          text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token     text,
  access_token      text,
  expires_at        integer,
  token_type        text,
  scope             text,
  id_token          text,
  session_state     text,
  UNIQUE(provider, "providerAccountId")
);

-- Sessions table for NextAuth
CREATE TABLE IF NOT EXISTS public.sessions (
  id           text PRIMARY KEY,
  "sessionToken" text UNIQUE NOT NULL,
  "userId"     text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires      timestamptz NOT NULL
);

-- Verification tokens table for NextAuth
CREATE TABLE IF NOT EXISTS public.verificationtokens (
  identifier text NOT NULL,
  token      text UNIQUE NOT NULL,
  expires    timestamptz NOT NULL,
  UNIQUE(identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts("userId");
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions("userId");
CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON public.sessions("sessionToken");
CREATE INDEX IF NOT EXISTS verificationtokens_token_idx ON public.verificationtokens(token);
