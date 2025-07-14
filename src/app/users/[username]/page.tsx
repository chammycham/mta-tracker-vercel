//src/app/users/[username]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRef } from "react";
import BusCard from "@/components/BusCard";
import TrainCard from "@/components/TrainCard";
import ServiceAlerts from "@/components/ServiceAlerts";
import SettingsPanel from "@/components/SettingsPanel";

export default function UserDashboard() {
  const [openAlertCardIndex, setOpenAlertCardIndex] = useState<number | null>(null);
  const { username } = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [trackedRoutes, setTrackedRoutes] = useState<string[]>([]);
  const [trackedStops, setTrackedStops] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [mode, setMode] = useState<"none" | "add" | "remove">("none");
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const decodedName = decodeURIComponent(username as string);
  const firstName = decodedName.split(" ")[0];
  const now = new Date();
  const hour = now.getHours();
  
  //change the greeting based on time of day
  let greeting = "Hello";
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.uid);
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setPreferences(data);
        setTrackedRoutes(data.routes || []);
        setTrackedStops(data.stops || []);
        setAlerts(data.alerts || []);
      } else {
        const defaultPrefs = { routes: [], stops: [], alerts: [] };
        await setDoc(docRef, defaultPrefs);
        setPreferences(defaultPrefs);
      }
      setPreferencesLoaded(true);
    });
    
    return () => unsub();
  }, [router, username]);
  
  useEffect(() => {
    if (!userId || !preferencesLoaded) return;
    const timeout = setTimeout(() => {
      updateDoc(doc(db, "users", userId), {
        routes: trackedRoutes,
        stops: trackedStops,
        alerts
      });
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [trackedRoutes, trackedStops, alerts, userId, preferencesLoaded]);


  const handleAddRoute = (route: string, stopId: string) => {
    setTrackedRoutes((prev) => [...prev, route]);
    setTrackedStops((prev) => [...prev, stopId]);
  };

  const handleRemoveRoute = (route: string) => {
    const index = trackedRoutes.indexOf(route);
    if (index !== -1) {
      setTrackedRoutes((prev) => prev.filter((_, i) => i !== index));
      setTrackedStops((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (!preferences) return <p>Loading preferences...</p>;

  return (
  <div className="relative min-h-screen p-4 pb-45">
    <h1
      className="text-xl mb-4 font-sans"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {greeting} {firstName}! 🚇
    </h1>

    <div ref={dashboardRef} className="flex flex-col gap-4 pl-4">
      {trackedRoutes.map((route, i) => (
        <div key={`${route}-${i}`} className="flex items-center gap-2 relative">
          {mode === "remove" && (
            <button
              onClick={() => handleRemoveRoute(route)}
              className="absolute -left-7 top-1/2 -translate-y-1/2 bg-red-500 text-white w-6 h-6 rounded-full text-sm hover:bg-red-600"
              title="Remove this route"
            >
              −
            </button>
          )}

          {/^M\d/.test(route) ? (
            <BusCard
              route={route}
              stop={trackedStops[i]}
              isOpen={openAlertCardIndex === i}
              onToggle={() =>
                setOpenAlertCardIndex(
                  openAlertCardIndex === i ? null : i
                )
              }
            />
          ) : (
            <TrainCard
              route={route}
              stop={trackedStops[i]}
              isOpen={openAlertCardIndex === i}
              onToggle={() =>
                setOpenAlertCardIndex(
                  openAlertCardIndex === i ? null : i
                )
              }
            />
          )}
        </div>
      ))}

      <ServiceAlerts alerts={{ stop: alerts }} />
      <SettingsPanel
        trackedRoutes={trackedRoutes}
        trackedStops={trackedStops}
        onAddRoute={handleAddRoute}
        onRemoveRoute={handleRemoveRoute}
        mode={mode}
        setMode={setMode}
        dashboardRef={dashboardRef}
      />
    </div>

    {/* bottom train border */}
    <div
      className="w-full h-72 absolute bottom-0 left-0 z-10"
      style={{
        backgroundImage: 'url("/icons/train_border.png")',
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        imageRendering: 'pixelated',
        pointerEvents: 'none',
      }}
    />
    
  </div>
);

}
