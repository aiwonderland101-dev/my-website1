"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useAuth } from "@lib/supabase/auth-context";

type Plan = {
  id: "spark" | "builder" | "visionary" | "sovereign";
  name: string;
  price: string;
  monthlyTokens: string;
  hook: string;
  wall: string;
  cta: string;
  mode: "free" | "paid";
};

function getSafeRedirectPath(raw: string | null): string {
  if (!raw) return "/dashboard/projects";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard/projects";
  return raw;
}

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));

  const { user, session, loading: authLoading } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "spark",
        name: "Spark",
        price: "$0",
        monthlyTokens: "25,000",
        hook: "1 Simple Landing Page OR 1 Basic 2D Sprite Game.",
        wall: "2D Grid only. No 3D preview. Public projects only.",
        cta: "Start with Spark",
        mode: "free",
      },
      {
        id: "builder",
        name: "Builder",
        price: "$15/mo",
        monthlyTokens: "100,000",
        hook: "1 Full Mobile App OR 1 Multi-level 2D Platformer.",
        wall: "Limited 3D Preview (10 mins/day). Watermarked exports.",
        cta: "Upgrade to Builder",
        mode: "paid",
      },
      {
        id: "visionary",
        name: "Visionary",
        price: "$39/mo",
        monthlyTokens: "500,000",
        hook: "1 Complex 3D World OR Full SaaS with Auth.",
        wall: "Unlimited 3D WebGPU. No watermarks. Private projects.",
        cta: "Go Visionary",
        mode: "paid",
      },
      {
        id: "sovereign",
        name: "Sovereign",
        price: "$99/mo",
        monthlyTokens: "2,500,000",
        hook: "Entire 3D Universes OR Multiple Client Apps.",
        wall: "Dual-View (2D+3D Sync). Priority AI reasoning. White-label.",
        cta: "Choose Sovereign",
        mode: "paid",
      },
    ],
    []
  );

  const requireAuthToken = () => {
    const token = session?.access_token;
    if (!token) {
      const back = `/subscription?redirectTo=${encodeURIComponent(redirectTo)}`;
      router.push(`/public-pages/auth?redirectTo=${encodeURIComponent(back)}`);
      return null;
    }
    return token;
  };

  const ensureSpark = async () => {
    const token = requireAuthToken();
    if (!token) return;

    setLoadingPlan("spark");
    try {
      const res = await fetch("/api/subscription/ensure", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create Spark plan");
      }

      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      alert("Could not enable Spark plan. Check console + API logs.");
      setLoadingPlan(null);
    }
  };

  const subscribePaid = async (planId: Plan["id"]) => {
    const token = requireAuthToken();
    if (!token) return;

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Subscription failed");
      }

      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      alert("Subscription failed. Please try again.");
      setLoadingPlan(null);
    }
  };

  const onSelect = async (plan: Plan) => {
    if (authLoading) return;

    if (!user) {
      const back = `/subscription?redirectTo=${encodeURIComponent(redirectTo)}`;
      router.push(`/public-pages/auth?redirectTo=${encodeURIComponent(back)}`);
      return;
    }

    if (plan.mode === "free") return ensureSpark();
    return subscribePaid(plan.id);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">Subscription</p>
          <h1 className="text-3xl font-bold text-white mb-3">Choose your tier</h1>
          <p className="text-gray-400">Token-based tiers built for launch-ready products.</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((p) => {
            const isLoading = loadingPlan === p.id;
            const isVisionary = p.id === "visionary";
            const isSovereign = p.id === "sovereign";

            return (
              <div
                key={p.id}
                className={[
                  "relative rounded-2xl p-6 border text-left flex flex-col",
                  isVisionary
                    ? "bg-gradient-to-b from-purple-950/50 to-gray-950 border-purple-500/50 shadow-xl shadow-purple-900/20"
                    : isSovereign
                    ? "bg-gradient-to-b from-amber-950/30 to-gray-950 border-amber-500/30"
                    : "bg-gray-900 border-gray-800",
                ].join(" ")}
              >
                {isVisionary && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-md whitespace-nowrap">
                    MOST POPULAR
                  </span>
                )}
                {isSovereign && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-[10px] font-bold text-white shadow-md whitespace-nowrap">
                    ENTERPRISE POWER
                  </span>
                )}

                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-white/40">{p.id}</p>
                  <div className="text-xl font-bold text-white">{p.name}</div>
                  <div className="text-3xl font-extrabold text-white mt-1">{p.price}</div>
                </div>

                <div className="mb-4 rounded-lg bg-white/5 border border-white/10 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-cyan-300">Monthly tokens</p>
                  <p className="text-2xl font-bold text-white">{p.monthlyTokens}</p>
                </div>

                <div className="text-sm text-gray-300 mb-3">
                  <span className="font-semibold text-white">The Hook:</span> {p.hook}
                </div>
                <div className="text-sm text-gray-400 mb-6 flex-1">
                  <span className="font-semibold text-white">The Wall:</span> {p.wall}
                </div>

                <button
                  onClick={() => onSelect(p)}
                  disabled={!!loadingPlan}
                  className={[
                    "w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 text-sm",
                    isVisionary
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/20"
                      : isSovereign
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-amber-500/20"
                      : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90",
                  ].join(" ")}
                >
                  {isLoading ? "Processing..." : p.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button className="text-gray-400 hover:text-white" onClick={() => router.push("/")}>
            ← Back to home
          </button>

          <button className="text-gray-400 hover:text-white" onClick={() => router.push(redirectTo)}>
            Skip → {redirectTo}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionContent />
    </Suspense>
  );
}
