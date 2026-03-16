import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * A simple redirect component for wouter.
 * Usage: <Route path="/old-path"><Redirect to="/new-path" /></Route>
 */
export default function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(to, { replace: true });
  }, [to, setLocation]);

  return null;
}
