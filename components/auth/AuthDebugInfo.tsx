'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';

interface AuthDebugInfoProps {
  showByDefault?: boolean;
}

export function AuthDebugInfo({ showByDefault = false }: AuthDebugInfoProps) {
  const { user, session, profile, loading, error } = useAuth();
  const [isExpanded, setIsExpanded] = useState(showByDefault);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  const debugData = {
    user: user ? {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
    } : null,
    session: session ? {
      access_token: session.access_token ? 'Present' : 'Missing',
      refresh_token: session.refresh_token ? 'Present' : 'Missing',
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
    } : null,
    profile: profile ? {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      first_name: profile.first_name,
      last_name: profile.last_name,
    } : null,
    loading,
    error: error ? {
      type: error.type,
      message: error.message,
      retryable: error.retryable,
    } : null,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Bug className="w-4 h-4 mr-2 text-orange-600" />
              Auth Debug
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span>User:</span>
                <Badge variant={user ? "default" : "destructive"} className="text-xs">
                  {user ? '✓' : '✗'}
                </Badge>
                {user && <span className="text-gray-600">{user.email}</span>}
              </div>
              
              <div className="flex items-center space-x-2">
                <span>Session:</span>
                <Badge variant={session ? "default" : "destructive"} className="text-xs">
                  {session ? '✓' : '✗'}
                </Badge>
                {session && (
                  <span className="text-gray-600">
                    Expires: {new Date(session.expires_at || 0).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span>Profile:</span>
                <Badge variant={profile ? "default" : "destructive"} className="text-xs">
                  {profile ? '✓' : '✗'}
                </Badge>
                {profile && <span className="text-gray-600">{profile.role}</span>}
              </div>
              
              {error && (
                <div className="bg-red-100 p-2 rounded text-red-800">
                  <strong>{error.type}:</strong> {error.message}
                </div>
              )}
              
              {loading && (
                <div className="bg-orange-100 p-2 rounded text-orange-800">
                  Loading authentication state...
                </div>
              )}
            </div>
            
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                Raw Debug Data
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-32">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </details>
          </CardContent>
        )}
      </Card>
    </div>
  );
}