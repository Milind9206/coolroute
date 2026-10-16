"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator, Sun } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import LanguageToggle from "@/components/language-toggle";

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
  const { t, language } = useLanguage();
  const selectedTime = `${Math.floor(scenario.hour) % 12 || 12}:${String(Math.round(scenario.hour % 1 * 60)).padStart(2, "0")} ${language === "hi" ? scenario.hour >= 12 ? "अपराह्न" : "पूर्वाह्न" : scenario.hour >= 12 ? "PM" : "AM"}`;
  const minute = language === "hi" ? "मिनट" : "min";
  const distance = scenario.distance >= 1000 ? `${(scenario.distance / 1000).toFixed(2)} km` : `${Math.round(scenario.distance)} m`;
  const formula = language === "hi" ? `खंड की लंबाई Lᵢ = haversine(pointᵢ, pointᵢ₊₁)
खंड का समय tᵢ = कुल मार्ग समय × Lᵢ / ΣL
खंड के मध्य का समय = रवाना होने का समय + बीता समय + tᵢ / 2

पेड़ों की छाँव C = min(1, 0.25 × छाँव उपलब्धता)
इमारतों की छाँव B = 1, जब सूर्य की ऊँचाई α ≤ 0
                 = min(1, |sin(सूर्य दिगंश φ − सड़क दिशा θ)| / max(0.15, tan α)), अन्यथा
संयुक्त छाँव Sᵢ = 1 − (1 − C) × (1 − B)

अनुमानित सीधी धूप (मिनट) = Σ [tᵢ × (1 − Sᵢ)] / 60` : `segment length Lᵢ = haversine(pointᵢ, pointᵢ₊₁)
segment time tᵢ = total route time × Lᵢ / ΣL
segment midpoint time = departure time + elapsed time + tᵢ / 2

canopy shade C = min(1, 0.25 × shade availability)
building shade B = 1, when sun altitude α ≤ 0
                 = min(1, |sin(sun azimuth φ − street bearing θ)| / max(0.15, tan α)), otherwise
combined shade Sᵢ = 1 − (1 − C) × (1 − B)

estimated direct-sun minutes = Σ [tᵢ × (1 − Sᵢ)] / 60`;

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 md:px-8">
    <header className="mb-10 flex items-center justify-between"><Link href="/planner" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" />{t("Back to planner")}</Link><div className="flex items-center gap-3"><span className="flex items-center gap-2 text-sm text-muted-foreground"><Calculator className="h-4 w-4" />{t("CoolRoute model")}</span><LanguageToggle compact /></div></header>
    <div className="mb-8"><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("How the route is calculated")}</h1><p className="mt-2 text-muted-foreground">{t("Real pedestrian paths, distances and travel times with modeled shade exposure for the selected route.")}</p></div>
    <div className="space-y-5">
    <Card>
      <CardHeader><CardTitle className="text-base">{t("Current route estimate")}</CardTitle></CardHeader>
      <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <p><span className="block text-muted-foreground">{t("Walking distance")}</span><strong>{distance}</strong></p>
        <p><span className="block text-muted-foreground">{t("Estimated walk time")}</span><strong>{scenario.walkTime.toFixed(1)} {minute}</strong></p>
        <p><span className="block text-muted-foreground">{t("Estimated direct sun")}</span><strong>{scenario.exposure.toFixed(2)} {minute}</strong></p>
        <p><span className="block text-muted-foreground">{t("Departure time")}</span><strong>{selectedTime} ({scenario.timezone})</strong></p>
        <p><span className="block text-muted-foreground">{t("Shade availability multiplier")}</span><strong>×{scenario.shade.toFixed(2)}</strong></p>
        <p><span className="block text-muted-foreground">{t("Exposure budget")}</span><strong>{scenario.budget.toFixed(2)} {minute}</strong></p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle className="text-base">{t("Direct-sun exposure calculation")}</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>{t("The route is divided into map segments. Each segment gets a share of the route’s total walking time based on its geodesic length. Sun position is evaluated at that segment’s midpoint and estimated time during the walk.")}</p>
        <Formula>
          {formula}
        </Formula>
        <p className="text-muted-foreground">{t("The building term uses a simplified 10 m building height and 10 m street-width baseline. The canopy multiplier starts from an assumed 25% coverage. OpenStreetMap route geometry does not report actual tree cover or building heights, so these are estimates for comparing the returned routes, not measured shade or a personal medical risk score.")}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle className="text-base">{t("How the route and budget are handled")}</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p><strong>{t("Fastest route:")}</strong> {t("the route with the shortest estimated walking time from the pedestrian route service.")}</p>
        <p><strong>{t("CoolRoute:")}</strong> {t("among the returned alternatives no more than 1.6× the fastest route distance, it selects a route within your exposure budget when one is available. If none fit, it shows the lowest-exposure candidate and reports how far that estimate exceeds your budget.")}</p>
        <p className="text-muted-foreground">{t("The budget is a route-selection target. The available alternatives may not contain a route that meets it; the app reports the closest candidate instead of claiming the budget was met.")}</p>
      </CardContent>
    </Card>
    </div>
    <p className="mt-8 rounded-xl border border-border p-4 text-sm text-muted-foreground"><Sun className="mr-2 inline h-4 w-4" />{t("Walking paths use OpenStreetMap pedestrian data through Valhalla. Exposure is estimated from solar position and simplified shade assumptions, not measured tree or building data.")}</p>
  </main>;
}
