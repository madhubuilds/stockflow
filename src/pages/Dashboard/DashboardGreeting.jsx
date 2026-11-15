
import { useEffect, useState } from "react";

function getDateInfo() {
  const now = new Date();
  const hour = now.getHours();

  let greeting = "Good evening";
  let emoji = "🌙";

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
    emoji = "☀️";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
    emoji = "🌤️";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening";
    emoji = "🌆";
  }

  const weekday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
  }).format(now);

  const date = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return {
    greeting,
    emoji,
    weekday,
    date,
  };
}

export default function DashboardGreeting() {
  const [dateInfo, setDateInfo] = useState(getDateInfo);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateInfo(getDateInfo());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p className="text-sm font-medium text-slate-400">
        {dateInfo.weekday}, {dateInfo.date}
      </p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {dateInfo.greeting}, Manager {dateInfo.emoji}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Here's what's happening in your warehouse today.
      </p>
    </div>
  );
}
