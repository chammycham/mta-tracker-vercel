//src/components/SettingsPanel.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { loadRouteStops } from "../lib/routeStops";
import { loadStopNames } from "../lib/stopNames";
import classNames from "classnames";

type Props = {
  trackedRoutes: string[];
  trackedStops: string[];
  onAddRoute: (route: string, stopId: string) => void;
  onRemoveRoute: (route: string) => void;
  mode: "none" | "add" | "remove";
  dashboardRef: React.RefObject<HTMLDivElement | null>;
  setMode: React.Dispatch<React.SetStateAction<"none" | "add" | "remove">>;
};


export default function SettingsPanel({ trackedRoutes, trackedStops, onAddRoute, onRemoveRoute, mode, setMode, dashboardRef }: Props) {
  const [isOpen, setIsOpen] = useState(false); //settings menu not open by default
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const routeMenuRef = useRef<HTMLDivElement>(null);
  const stopListRef = useRef<HTMLDivElement>(null);


  //matching stop ids to stop names
  const [stopMap, setStopMap] = useState<Record<string, string>>({});
  const [routeStopsMap, setRouteStopsMap] = useState<
  Record<string, { stop_id: string; stop_name: string }[]>
>({});

  //how to close the settings menu
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsidePanel = panelRef.current?.contains(target);
      const clickedInsideDashboard = dashboardRef.current?.contains(target);
      const clickedInsideRouteMenu = routeMenuRef.current?.contains(target);
      const clickedInsideStopList = stopListRef.current?.contains(target);
      
      if (!clickedInsidePanel && !clickedInsideDashboard) {
        setIsOpen(false);
      }
      if (mode === "add") {
        if (!selectedRoute && !clickedInsideRouteMenu) {
          setMode("none");
        } else if (selectedRoute && !clickedInsideStopList) {
          setMode("none");
          setSelectedRoute(null);
        }
      }
      
      if (mode === "remove" && !clickedInsidePanel && !clickedInsideDashboard) {
        setMode("none");
      }
    };

    const delayedHandleClick = (e: MouseEvent) =>
      requestAnimationFrame(() => handleClick(e));
    document.addEventListener("mousedown", delayedHandleClick);
    return () => document.removeEventListener("mousedown", delayedHandleClick);
  }, [mode, selectedRoute, dashboardRef]);
  
  //loading stop names
  useEffect(() => {
    async function fetchStops() {
      if (!selectedRoute) return;
      const loadMode = /^M\d/.test(selectedRoute) ? "bus" : "train";
      const map = await loadStopNames(loadMode);
      setStopMap(map);
    }
    fetchStops();
  }, [selectedRoute]);

  useEffect(() => {
    async function fetchRouteStops() {
      const map = await loadRouteStops();
      setRouteStopsMap(map);
    }
    fetchRouteStops();
  }, []);

  const allRoutes = ["1", "2", "3", "4", "5", "6", "6X", "7", "7X", 
    "A", "C", "E", 
    "G", 
    "N", "Q", "R", "W", 
    "B", "D", "F", "M", "J", "Z", "L", 
    "M4"];
    
    const stopsForRoute = (route: string) => {
      const usedCombos = new Set(
        trackedRoutes.map((r, i) => `${r}-${trackedStops[i]}`)
      );
      
      const allStops = routeStopsMap[route] || [];
      return allStops.filter(
        ({ stop_id }) =>
          (stop_id.endsWith("N") || stop_id.endsWith("S")) && !usedCombos.has(`${route}-${stop_id}`)
      );
    };
    
    return (
    <div ref={panelRef} className="fixed inset-0 z-50 pointer-events-none">
      {/* settings button */}
      <div className="pointer-events-auto fixed bottom-4 right-4">
        <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (mode === "remove") {
            setMode("none");
          }
        }}
        className="bg-white p-2 rounded-full shadow border">
          <span className="text-xl">⚙️</span>
          </button>
          
          {isOpen && (
            <div className="absolute bottom-14 right-0 flex flex-col items-end gap-2">
              <button
              onClick={() => {
                setMode("add");
                setSelectedRoute(null);}
              }
              className="bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600">
              ＋
            </button>
            
            <button
            onClick={() => {
              setMode((prev) => (prev === "remove" ? "none" : "remove"));}
            }
            className={classNames("p-2 rounded-full shadow", trackedRoutes.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600")
            }
            disabled={trackedRoutes.length === 0}>
              －
              </button>
              </div>
            
          )}
          </div>
          
          <div className="pointer-events-auto">
            {/* adding routes */}
            {mode === "add" && !selectedRoute && (
              <div ref={routeMenuRef} className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white border shadow p-3 rounded w-fit flex flex-wrap gap-2">
                {allRoutes.map((route) => (
                  <div
                  key={route}
                  onClick={() => {
                  console.log("Route clicked:", route);
                  setSelectedRoute(route);}
                }
                className="cursor-pointer hover:scale-110 transition p-1">
                  <Image
                  src={`/icons/${route}.png`}
                  alt={route}
                  width={30}
                  height={30}
                  />
                  </div>
                ))}
                </div>
              )
            }
            
            {mode === "add" && selectedRoute && (
              <div ref={stopListRef} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border shadow p-3 rounded w-fit z-50 max-h-[300px] overflow-y-auto">
                <h2 className="text-md font-semibold mb-2 text-center">Choose Stop for {selectedRoute}</h2>
                <ul>
                  {stopsForRoute(selectedRoute).length === 0 ? (
                    <li className="text-gray-500 text-sm text-center">No more available stops!</li>
                  ) : (
                    stopsForRoute(selectedRoute).map(({ stop_id, stop_name }) => (
                    <li
                    key={stop_id}
                    onClick={() => {
                      onAddRoute(selectedRoute, stop_id);
                      setMode("none");
                      setSelectedRoute(null);
                    }}
                    className="cursor-pointer hover:bg-gray-100 p-1 flex items-center gap-2">
                      <span className="text-xs">
                        {stop_id.endsWith("N") ? "▲" : stop_id.endsWith("S") ? "▼" : ""}
                        </span>
                        <span>{stop_name}</span>
                    </li>
                    ))
                  )}
                </ul>
              </div>
              )}
          </div>
    </div>
    );
}
