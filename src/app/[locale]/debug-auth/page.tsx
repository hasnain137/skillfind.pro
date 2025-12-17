'use client';

// Temporary debug page to check auth state
import { useUser } from '@clerk/nextjs';

export default function DebugAuthPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Auth Debug Info</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <strong>Is Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <strong>User ID:</strong> {user?.id || 'None'}
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress || 'None'}
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <strong>First Name:</strong> {user?.firstName || 'None'}
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <strong>Role (publicMetadata):</strong> 
          <span className={`ml-2 font-bold ${(user?.publicMetadata?.role as string) ? 'text-green-600' : 'text-red-600'}`}>
            {(user?.publicMetadata?.role as string) || '❌ NOT SET'}
          </span>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <strong>Full publicMetadata:</strong>
          <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
            {JSON.stringify(user?.publicMetadata, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <strong>Expected Dashboard URL:</strong>
          <div className="mt-2">
            {(user?.publicMetadata?.role as string) === 'PROFESSIONAL' 
              ? '→ /pro' 
              : (user?.publicMetadata?.role as string) === 'CLIENT'
              ? '→ /client'
              : '→ ⚠️ No role set - will cause redirect loop'}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <strong>🔧 Next Steps:</strong>
        <ul className="mt-2 space-y-1 text-sm">
          <li>✓ If role is NOT SET, go to <a href="/auth-redirect" className="text-blue-600 underline">/auth-redirect</a> to complete onboarding</li>
          <li>✓ If role is set but dashboard redirect fails, check middleware</li>
          <li>✓ Clear browser cookies and sign in again if issues persist</li>
        </ul>
      </div>
    </div>
  );
}
