import { Server, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";

type ServerState = "initial" | "waking" | "online" | "error";

const ServerStatus = () => {
  const [status, setStatus] = useState<ServerState>("initial");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Show the "waking up" message if the server doesn't respond within 1.5 seconds.
    timeoutId = setTimeout(() => {
      setStatus((prev) => {
        if (prev === "initial") {
          setIsVisible(true);
          return "waking";
        }
        return prev;
      });
    }, 1500);

    const checkServer = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/healthz`);
        if (res.ok) {
          setStatus("online");
          setIsVisible(true);
          // Hide after 3 seconds
          setTimeout(() => setIsVisible(false), 3000);
        } else {
          setStatus("error");
          setIsVisible(true);
        }
      } catch (err) {
        setStatus("error");
        setIsVisible(true);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkServer();

    return () => clearTimeout(timeoutId);
  }, []);

  if (!isVisible || status === "initial") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`pixel-card flex items-center gap-3 px-4 py-3 shadow-lg ${
        status === "online" 
          ? "border-green-500 bg-[color:color-mix(in_oklab,var(--card)_80%,#22c55e)]" 
          : status === "error"
            ? "border-red-500 bg-[color:color-mix(in_oklab,var(--card)_80%,#ef4444)]"
            : "border-yellow-500 bg-[color:color-mix(in_oklab,var(--card)_80%,#eab308)]"
      }`}>
        {status === "online" ? (
          <Wifi size={20} className="text-green-400" />
        ) : status === "error" ? (
          <WifiOff size={20} className="text-red-400" />
        ) : (
          <Server size={20} className="animate-pulse text-yellow-400" />
        )}
        
        <div className="flex flex-col">
          <span className="pixel-text text-[11px] font-black tracking-wider text-[var(--foreground)]">
            {status === "online" && "SERVER ONLINE"}
            {status === "error" && "SERVER OFFLINE"}
            {status === "waking" && "WAKING SERVER..."}
          </span>
          {status === "waking" && (
            <span className="text-[10px] font-bold opacity-70 text-[var(--muted)]">
              May take up to 50s on free tier
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerStatus;
