#!/bin/bash

echo "🚀 Preparing for Vercel deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📋 Pages detected:"
    echo "   • / (Home page)"
    echo "   • /admin (Admin dashboard)"
    echo "   • /admin/login (Admin login)"
    echo "   • /admin/setup (Admin setup)"
    echo "   • /admin/schedule (Schedule management)"
    echo "   • /admin/settings (Settings)"
    echo "   • /admin/videos (Video management)"
    echo ""
    echo "🔧 API endpoints detected:"
    echo "   • /api/active-move"
    echo "   • /api/cloudinary-signature"
    echo "   • /api/moves"
    echo "   • /api/schedules"
    echo "   • /api/schedules/[id]"
    echo "   • /api/settings"
    echo "   • /api/setup"
    echo "   • /api/video"
    echo "   • /api/videos"
    echo "   • /api/videos/[id]"
    echo ""
    echo "🌐 Ready for Vercel deployment!"
    echo "⚠️  Don't forget to set these environment variables in Vercel:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
    echo "   - CLOUDINARY_API_KEY"
    echo "   - CLOUDINARY_API_SECRET"
    echo "   - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
else
    echo "❌ Build failed!"
    exit 1
fi
