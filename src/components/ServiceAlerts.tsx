// src/components/ServiceAlerts.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

type Props = {
  alerts?: {
    stop?: string[];
    route?: string[];
  };
};

export default function ServiceAlerts({ alerts }: Props) {
  const [showList, setShowList] = useState(false);
  const [openAlertIndex, setOpenAlertIndex] = useState<number | null>(null);

  const hasAlerts = alerts && (
    (alerts.stop && alerts.stop.length > 0) ||
    (alerts.route && alerts.route.length > 0)
  );

  if (!hasAlerts) return null;

  const messages = [
    ...(alerts?.stop || []),
    ...(alerts?.route || [])
  ];

  return (
    <div className="relative">
      {/* service alert icon */}
      <Image
        src="/icons/warning.png"
        alt="Service alert"
        width={14}
        height={14}
        className="cursor-pointer"
        onClick={() => setShowList(!showList)}
      />

      {/* dropdown alerts */}
      {showList && (
        <div className="absolute right-0 mt-2 p-2 bg-yellow-100 text-black text-xs border border-yellow-400 rounded shadow z-10 max-w-xs">
          {messages.map((msg, i) => (
            <div key={i} className="mb-2">
              <p
                className="font-bold cursor-pointer underline"
                onClick={() => setOpenAlertIndex(openAlertIndex === i ? null : i)}
              >
                Alert {i + 1}
              </p>
              {openAlertIndex === i && (
                <div className="mt-1 text-yellow-900">
                  {msg
                    .replace(/\.:\s*/g, ". ")
                    .split(/(?<=[.?!])\s+/)
                    .map((line, j) => (
                      <p key={j}>{line}</p>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
