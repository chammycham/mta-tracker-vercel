// src/components/TrainCard.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { loadStopNames } from "../lib/stopNames";


type TrainData = {
  route: string;
  stop: string;
  arrivals: number[];
  alerts: string[];
};

type Props = {
  route: string;
  stop: string;
  isOpen: boolean;
  onToggle: () => void;
};

export default function TrainCard({ route, stop, isOpen, onToggle }: Props) {
  const [data, setData] = useState<TrainData | null>(null);
  const [stopMap, setStopMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      const map = await loadStopNames("train");
      setStopMap(map);  
      const res = await fetch(`/api/feed?route=${route}&stop=${stop}&type=subway`);
      const json = await res.json();
      json.stop = map[json.stop] || stop;
      setData(json as TrainData);

    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [route, stop]);

  if (!data) return <p>Loading...</p>;

  return (
  <div className="flex items-center space-x-2 text-sm font-mono relative">
    {/* Directional Arrow */}
    <span className="text-xs">
      {stop.endsWith("N") ? "▲" : stop.endsWith("S") ? "▼" : ""}
    </span>

    {/* Train Icon */}
    <Image
      src={`/icons/${route.toLowerCase()}.png`}
      alt={`${route} icon`}
      width={20}
      height={20}
      unoptimized
    />

    {/* Stop Name */}
    <span className="min-w-[100px]">{data.stop}</span>

    {/* Arrival Times */}
    <span>
      {data.arrivals.length
        ? data.arrivals.join(", ") + " min"
        : "No trains"}
    </span>

    {/* Alert Icon and Popup */}
    {data.alerts?.length > 0 && (
  <>
    <Image
      src="/icons/warning.png"
      alt="Warning"
      width={16}
      height={16}
      className="cursor-pointer ml-1"
      onClick={onToggle}
    />
    {isOpen && (
      <div className="absolute top-full left-0 mt-1 p-2 bg-yellow-100 border border-yellow-500 rounded shadow-md z-10 max-w-xs">
        {data.alerts.map((text, idx) => (
          <div key={idx} className="mb-2">
            {text
              .replace(/\.:\s*/g, ". ")
              .split(/(?<=[.?!])\s+/)
              .map((sentence, sIdx) => (
                <p key={sIdx} className="text-xs text-yellow-800">{sentence}</p>
            ))}
          </div>
        ))}
      </div>
    )}
  </>
)}

  </div>
);
}
