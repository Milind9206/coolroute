"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Scenario = {
  hour: number;
  shade: number;
  budget: number;
  distance: number;
  walkTime: number;
  exposure: number;
  timezone: string;
};

function Formula({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl bg-muted p-4 font-mono text-xs leading-6">{children}</div>;
}

export default function CoolRouteFormulas({ scenario }: { scenario: Scenario }) {
  const selectedTime = `${Math.floor(scenario.hour) % 12 || 12}:${String(Math.round(scenario.hour % 1 * 60)).padStart(2, "0")} ${scenario.hour >= 12 ? "PM" : "AM"}`;

  return <div className="space-y-5">
    <Card>
      <CardHeader><CardTitle className="text-base">Current route estimate</CardTitle></CardHeader>
      <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <p><span className="block text-muted-foreground">Walking distance</span><strong>{scenario.distance >= 1000 ? `${(scenario.distance / 1000).toFixed(2)} km` : `${Math.round(scenario.distance)} m`}</strong></p>
        <p><span className="block text-muted-foreground">Estimated walk time</span><strong>{scenario.walkTime.toFixed(1)} min</strong></p>
        <p><span className="block text-muted-foreground">Estimated direct sun</span><strong>{scenario.exposure.toFixed(2)} min</strong></p>
        <p><span className="block text-muted-foreground">Departure time</span><strong>{selectedTime} ({scenario.timezone})</strong></p>
        <p><span className="block text-muted-foreground">Shade availability multiplier</span><strong>×{scenario.shade.toFixed(2)}</strong></p>
        <p><span className="block text-muted-foreground">Exposure budget</span><strong>{scenario.budget.toFixed(2)} min</strong></p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle className="text-base">Direct-sun exposure calculation</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>The route is divided into map segments. Each segment gets a share of the route’s total walking time based on its geodesic length. Sun position is evaluated at that segment’s midpoint and estimated time during the walk.</p>
        <Formula>
          {`segment length Lᵢ = haversine(pointᵢ, pointᵢ₊₁)
segment time tᵢ = total route time × Lᵢ / ΣL
segment midpoint time = departure time + elapsed time + tᵢ / 2

canopy shade C = min(1, 0.25 × shade availability)
building shade B = 1, when sun altitude α ≤ 0
                 = min(1, |sin(sun azimuth φ − street bearing θ)| / max(0.15, tan α)), otherwise
combined shade Sᵢ = 1 − (1 − C) × (1 − B)

estimated direct-sun minutes = Σ [tᵢ × (1 − Sᵢ)] / 60`}
        </Formula>
        <p className="text-muted-foreground">The building term uses a simplified 10 m building height and 10 m street-width baseline. The canopy multiplier starts from an assumed 25% coverage. OpenStreetMap route geometry does not report actual tree cover or building heights, so these are estimates for comparing the returned routes, not measured shade or a personal medical risk score.</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle className="text-base">How the route and budget are handled</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p><strong>Fastest route:</strong> the route with the shortest estimated walking time from the pedestrian route service.</p>
        <p><strong>CoolRoute:</strong> among the returned alternatives no more than 1.6× the fastest route distance, it selects a route within your exposure budget when one is available. If none fit, it shows the lowest-exposure candidate and reports how far that estimate exceeds your budget.</p>
        <p className="text-muted-foreground">The budget is a route-selection target. The available alternatives may not contain a route that meets it; the app reports the closest candidate instead of claiming the budget was met.</p>
      </CardContent>
    </Card>
  </div>;
}
