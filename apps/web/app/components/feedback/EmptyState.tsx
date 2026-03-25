import { type ReactNode } from "react";

export function EmptyState({ 
  title, 
  description, 
  cta,
  icon = "📦"
}: { 
  title: string; 
  description: string; 
  cta?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 via-transparent to-purple-900/10 px-6 py-16 text-center backdrop-blur-sm">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="text-5xl mb-4 inline-block animate-bounce">{icon}</div>
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
        {title}
      </h3>
      
      {/* Description */}
      <p className="mx-auto mt-3 max-w-sm text-sm text-white/60 leading-relaxed">
        {description}
      </p>
      
      {/* CTA */}
      {cta ? (
        <div className="mt-8 flex justify-center">
          {cta}
        </div>
      ) : null}
    </div>
  );
}

export function SkeletonGrid({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
      ))}
    </div>
  );
}
