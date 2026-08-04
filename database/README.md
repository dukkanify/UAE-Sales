# AEP Database

## Overview

PostgreSQL hosted on **Supabase**, with:

- Auth (`auth.users`)
- Profiles table with RLS
- Storage bucket `aep-uploads`
- Optional Prisma ORM for complex queries

## Setup

1. Create a Supabase project
2. Copy credentials into `.env.local` (see `.env.example`)
3. Run `database/migrations/001_initial_schema.sql` in the Supabase SQL editor
4. (Optional) `npx prisma generate --schema=database/prisma/schema.prisma`

## Roles

| Role | Description |
|------|-------------|
| `student` | Default learner |
| `instructor` | Training staff |
| `admin` | Platform administrator |
| `super_admin` | Full system access |

## RLS

All profile reads/writes are gated by Row Level Security. Users can only update their own non-role fields. Admins can read all profiles.
