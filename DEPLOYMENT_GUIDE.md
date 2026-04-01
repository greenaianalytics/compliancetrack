# ComplianceTrack - Deployment Guide

## Overview
This guide walks you through deploying ComplianceTrack with Supabase as the backend.

## Step 1: Set Up Supabase Tables

Run this SQL in your Supabase SQL Editor to add the missing tables:

```sql
-- Add missing columns to existing tables
ALTER TABLE public.compliance_items 
ADD COLUMN IF NOT EXISTS year INT DEFAULT 2026,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- New table: Compliance Templates (NACE-based task templates from JSON imports)
CREATE TABLE IF NOT EXISTS public.compliance_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nace_code text NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  frequency text DEFAULT 'yearly'::text,
  template_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT compliance_templates_pkey PRIMARY KEY (id),
  CONSTRAINT compliance_templates_unique_nace_title UNIQUE (nace_code, title)
);

CREATE INDEX IF NOT EXISTS compliance_templates_nace_code_idx 
ON public.compliance_templates(nace_code);

-- New table: Compliance Task Instances (yearly populated tasks)
CREATE TABLE IF NOT EXISTS public.compliance_task_instances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  template_id uuid NOT NULL,
  year integer NOT NULL,
  title text NOT NULL,
  due_date timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT compliance_task_instances_pkey PRIMARY KEY (id),
  CONSTRAINT compliance_task_instances_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT compliance_task_instances_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.compliance_templates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS compliance_task_instances_tenant_year_idx 
ON public.compliance_task_instances(tenant_id, year);

-- New table: Custom Tasks (user-created tasks with optional recurrence)
CREATE TABLE IF NOT EXISTS public.custom_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone NOT NULL,
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  occurrence_year integer,
  status text DEFAULT 'pending'::text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT custom_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT custom_tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT custom_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS custom_tasks_tenant_year_idx 
ON public.custom_tasks(tenant_id, occurrence_year);

-- Add nace_code column to tenants for tracking primary NACE
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS nace_code text;

-- Enable RLS on new tables (optional but recommended for security)
ALTER TABLE public.compliance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_tasks ENABLE ROW LEVEL SECURITY;
```

## Step 2: Set Up Environment Variables

In Vercel, set these environment variables:

```
# Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# Email
RESEND_API_KEY=[YOUR_RESEND_KEY]
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# Application
NODE_ENV=production
NEXTAUTH_SECRET=[GENERATE_WITH_openssl_rand_base64_32]
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Step 3: Install Dependencies & Deploy

```bash
# Install dependencies
npm install

# Build the application (tests locally)
npm run build

# Deploy to Vercel
npm run vercel:deploy
```

## Data Model Overview

### Core Tables (Existing)
- **users** - Supabase auth users
- **tenants** - Organizations (each SME)
- **tenant_users** - Role-based membership (admin/member)
- **compliance_items** - Legacy compliance tracking

### New Tables (Add via SQL above)
- **compliance_templates** - Task templates imported from JSON, keyed by NACE code
- **compliance_task_instances** - Yearly populated tasks from templates
- **custom_tasks** - User-created tasks with optional yearly recurrence

## Features

### Task Management
1. **NACE-Based Tasks**: Import compliance tasks from JSON files keyed by NACE code
2. **Yearly Population**: Tasks automatically populate each year
3. **Year-Based Navigation**: Users traverse year-by-year to see completion
4. **Custom Tasks**: Users can add their own tasks with recurrence options

### Multi-Tenant
- Each tenant (SME) has isolated data
- Role-based access (admin/member)
- Tenant admins manage custom tasks and team

## Next Steps (After Deployment)

1. **Implement JSON Import** - Create endpoint to bulk-import compliance templates
2. **Create API Endpoints** - Build REST APIs for tasks, custom tasks, exports
3. **Add Authentication** - Implement Supabase auth flows
4. **Build Dashboard UI** - Connect UI to real database queries
5. **Implement Notifications** - Email reminders for due tasks

## Database Schema Location
- Prisma schema: `prisma/schema.prisma`
- TypeScript types: `types/database.ts`
