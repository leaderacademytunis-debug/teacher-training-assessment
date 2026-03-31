import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

/**
 * Hook to check if user's profile is completed
 * Returns loading state and completion status
 */
export function useProfileCompletion() {
  const user = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Query to check if profile is completed
  const { data: profileCompleted, isLoading: queryLoading } = trpc.profileBuilder.isProfileCompleted.useQuery(
    undefined,
    {
      enabled: !!user, // Only run query if user is authenticated
      retry: 1,
    }
  );

  useEffect(() => {
    if (!queryLoading) {
      setIsCompleted(profileCompleted ?? false);
      setIsLoading(false);
    }
  }, [profileCompleted, queryLoading]);

  return {
    isLoading,
    isCompleted,
    user,
  };
}
