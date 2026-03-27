import { useState, useEffect } from "react";
import { CollaboratorMatch } from "@/app/api/collaborators/route";

export interface UseCollaboratorsResult {
  collaborators: CollaboratorMatch[];
  mySubscribers: number | null;
  searchRange: { min: number; max: number } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCollaborators(
  rangePercent: number = 20
): UseCollaboratorsResult {
  const [collaborators, setCollaborators] = useState<CollaboratorMatch[]>([]);
  const [mySubscribers, setMySubscribers] = useState<number | null>(null);
  const [searchRange, setSearchRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/collaborators?range=${rangePercent}&limit=10`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch collaborators");
      }

      if (data.success) {
        setCollaborators(data.collaborators || []);
        setMySubscribers(data.mySubscribers || null);
        setSearchRange(data.searchRange || null);
      } else {
        setError(data.error || "Unknown error occurred");
        setCollaborators([]);
      }
    } catch (err) {
      console.error("Error fetching collaborators:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load collaborators"
      );
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [rangePercent]);

  return {
    collaborators,
    mySubscribers,
    searchRange,
    loading,
    error,
    refetch: fetchCollaborators,
  };
}
