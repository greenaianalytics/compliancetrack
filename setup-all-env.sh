#!/bin/bash

echo "🚀 Setting up Compliance Track Environment Files..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Your production domain
PRODUCTION_DOMAIN="www.track.greenaianalytics.org"
STAGING_DOMAIN="staging.track.greenaianalytics.org"

echo -e "${BLUE}📁 Creating environment files for:${NC}"
echo -e "  • Local development (.env.local)"
echo -e "  • Production (.env.production)"
echo -e "  • Staging (.env.staging)"
echo -e "  • Template (.env.example)"

# Create .env.local
cat > .env.local << 'ENVLOCAL'
# ============================================
# COMPLIANCE TRACK - LOCAL DEVELOPMENT
# ============================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ntwwwprdpdjqexeszuay.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d3d3cHJkcGRqcWV4ZXN6dWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTQzODQsImV4cCI6MjA3NzU5MDM4NH0.CYyrfNyWOLQkRWeDOzXzAH9EG_CJ4sSx9X9LyHa0dbU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d3d3cHJkcGRqcWV4ZXN6dWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNDM4NCwiZXhwIjoyMDc3NTkwMzg0fQ.Ymi0V4rea2SbBCHSbBfFtXZ-dtajYf4YosP0SwGpAmE

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=DgaK0qkk38T5CyN+F/aZtx8T2jUhQXfrTvf1wEw7+dk=

# Email - Resend (Primary)
RESEND_API_KEY=re_G49rLWz7_BwbY6q7JeYF4bVCBeQa4Ny8m
EMAIL_FROM_ADDRESS=noreply@notification.greenaianalytics.org
EMAIL_FROM_NAME=Compliance Track

# Email - SMTP Fallback (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=9f485e001@smtp-brevo.com
SMTP_PASS=IFaSM7ryJQnjHUWm
SMTP_FROM=Compliance Track <noreply@notification.greenaianalytics.org>

# SMS - 46elks (Optional)
ELKS_USERNAME=your-elks-username
ELKS_PASSWORD=your-elks-password
ELKS_SENDER=ComplianceTrack

# Application
NODE_ENV=development
APP_URL=http://localhost:3000

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_WHATSAPP_NOTIFICATIONS=false
ENVLOCAL

echo -e "${GREEN}✅ Created .env.local${NC}"

# Create .env.production
cat > .env.production << 'ENVPROD'
# ============================================
# COMPLIANCE TRACK - PRODUCTION
# ============================================
# Domain: https://www.track.greenaianalytics.org
# ============================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ntwwwprdpdjqexeszuay.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d3d3cHJkcGRqcWV4ZXN6dWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTQzODQsImV4cCI6MjA3NzU5MDM4NH0.CYyrfNyWOLQkRWeDOzXzAH9EG_CJ4sSx9X9LyHa0dbU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d3d3cHJkcGRqcWV4ZXN6dWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNDM4NCwiZXhwIjoyMDc3NTkwMzg0fQ.Ymi0V4rea2SbBCHSbBfFtXZ-dtajYf4YosP0SwGpAmE

# Authentication (NextAuth.js)
NEXTAUTH_URL=https://www.track.greenaianalytics.org
NEXTAUTH_SECRET=DgaK0qkk38T5CyN+F/aZtx8T2jUhQXfrTvf1wEw7+dk=

# Email - Resend (Primary)
RESEND_API_KEY=re_G49rLWz7_BwbY6q7JeYF4bVCBeQa4Ny8m
EMAIL_FROM_ADDRESS=noreply@notification.greenaianalytics.org
EMAIL_FROM_NAME=Compliance Track

# Email - SMTP Fallback (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=9f485e001@smtp-brevo.com
SMTP_PASS=IFaSM7ryJQnjHUWm
SMTP_FROM=Compliance Track <noreply@notification.greenaianalytics.org>

# SMS - 46elks (Optional)
ELKS_USERNAME=your-elks-username
ELKS_PASSWORD=your-elks-password
ELKS_SENDER=ComplianceTrack

# Application
NODE_ENV=production
APP_URL=https://www.track.greenaianalytics.org

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_WHATSAPP_NOTIFICATIONS=false

# Security (Production-specific)
SECURE_COOKIES=true
COOKIE_DOMAIN=.greenaianalytics.org
ENVPROD

echo -e "${GREEN}✅ Created .env.production${NC}"

# Create .env.staging
cat > .env.staging << 'ENVSTAGE'
# ============================================
# COMPLIANCE TRACK - STAGING
# ============================================
# Domain: https://staging.track.greenaianalytics.org
# ============================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ntwwwprdpdjqexeszuay.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d3d3cHJkcGRqcWV4ZXN6dWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTQzODQsImV4cCI6MjA3NzU5MDM4NH0.CYyrfNyWOLQkRWeDOzXzAH9EG_CJ4sSx9X9LyHa0dbU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d3d3cHJkcGRqcWV4ZXN6dWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNDM4NCwiZXhwIjoyMDc3NTkwMzg0fQ.Ymi0V4rea2SbBCHSbBfFtXZ-dtajYf4YosP0SwGpAmE

# Authentication (NextAuth.js)
NEXTAUTH_URL=https://staging.track.greenaianalytics.org
NEXTAUTH_SECRET=generate-different-secret-for-staging

# Email - Resend (Primary) - Use staging/test API key
RESEND_API_KEY=re_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@staging.greenaianalytics.org
EMAIL_FROM_NAME="Compliance Track (Staging)"

# Application
NODE_ENV=production
APP_URL=https://staging.track.greenaianalytics.org

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
ENVSTAGE

echo -e "${GREEN}✅ Created .env.staging${NC}"

# Create .env.example
cat > .env.example << 'ENVEXAMPLE'
# ============================================
# COMPLIANCE TRACK - ENVIRONMENT TEMPLATE
# ============================================
# Copy to .env.local and fill in values
# ============================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Email - Resend (Primary)
RESEND_API_KEY=your-resend-api-key-here
EMAIL_FROM_ADDRESS=noreply@notification.greenaianalytics.org
EMAIL_FROM_NAME=Compliance Track

# Email - SMTP Fallback (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-username
SMTP_PASS=your-brevo-password
SMTP_FROM=Compliance Track <noreply@notification.greenaianalytics.org>

# Application
NODE_ENV=development
APP_URL=http://localhost:3000

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
ENVEXAMPLE

echo -e "${GREEN}✅ Created .env.example${NC}"

# Create .gitignore entry if not exists
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    echo -e "\n# Environment files" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.staging" >> .gitignore
    echo "!.env.example" >> .gitignore
    echo -e "${GREEN}✅ Updated .gitignore${NC}"
fi

echo -e "\n${BLUE}📋 Summary:${NC}"
echo -e "${GREEN}✓ .env.local${NC}       - Local development (gitignored)"
echo -e "${GREEN}✓ .env.production${NC}  - Production (${PRODUCTION_DOMAIN})"
echo -e "${GREEN}✓ .env.staging${NC}     - Staging (${STAGING_DOMAIN})"
echo -e "${GREEN}✓ .env.example${NC}     - Template (committed to git)"

echo -e "\n${YELLOW}⚠️  Security Notes:${NC}"
echo -e "1. These files contain sensitive API keys"
echo -e "2. .env.local, .env.production, .env.staging are gitignored"
echo -e "3. Only .env.example should be committed to git"
echo -e "4. Consider rotating API keys for production"

echo -e "\n${BLUE}🚀 Next Steps:${NC}"
echo -e "1. Update package.json scripts to use different env files"
echo -e "2. Deploy to Vercel with production environment"
echo -e "3. Set up DNS for ${PRODUCTION_DOMAIN}"
echo -e "4. Test email notifications in production"

echo -e "\n${GREEN}🎉 All environment files created successfully!${NC}"
