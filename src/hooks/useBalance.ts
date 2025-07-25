"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export function useBalance() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const refreshBalance = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/balance");
      if (!response.ok) throw new Error("Failed to fetch balance");
      const data = await response.json();
      // Update the session with the new balance
      await update({ ...session, user: { ...session?.user, balance: data.balance } });
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch balance immediately when the hook is first used
    refreshBalance();

    // Set up the interval to refresh the balance periodically
    const intervalId = setInterval(refreshBalance, REFRESH_INTERVAL);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once on mount

  return { ...session?.user, refreshBalance, isLoading };
}
