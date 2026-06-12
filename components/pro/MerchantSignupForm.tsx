"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCATIONS, PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { CATEGORIES, type Category } from "@/lib/types";

export function MerchantSignupForm() {
  const { t } = useLocale();
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [siret, setSiret] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>(["Cannes"]);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat: Category) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleArea = (area: string) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (categories.length === 0 || serviceAreas.length === 0) {
      setError(t.pro.applicationError);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: businessName,
        siret: siret || null,
        categories,
        service_areas: serviceAreas,
        whatsapp_phone: whatsappPhone,
        email,
      }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setError(data.error ?? t.pro.applicationError);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  };

  if (success) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}
      >
        <p style={{ color: "#1F7A4D", fontWeight: 600 }}>{t.pro.applicationSent}</p>
        <Link
          href="/pro/dashboard"
          className="mt-4 inline-block underline"
          style={{ color: PALETTE.azure }}
        >
          {t.pro.goToDashboard}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 space-y-4"
      style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}
    >
      <div>
        <label className="block text-sm mb-1 font-medium">{t.pro.businessName}</label>
        <input
          type="text"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.pro.siret}</label>
        <input
          type="text"
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          placeholder="123 456 789 00012"
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
        <p className="text-xs mt-1" style={{ color: "#5C7E92" }}>
          {t.pro.siretHint}
        </p>
      </div>

      <div>
        <label className="block text-sm mb-2 font-medium">{t.pro.categories}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer"
              style={{
                border: `1px solid ${categories.includes(cat) ? PALETTE.azure : PALETTE.line}`,
                background: categories.includes(cat) ? PALETTE.azureSoft : PALETTE.white,
              }}
            >
              <input
                type="checkbox"
                checked={categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-[#2B86BC]"
              />
              <span className="text-sm">{t.categories[cat]}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-2 font-medium">{t.pro.serviceAreas}</label>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((area) => (
            <label
              key={area}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer text-sm"
              style={{
                border: `1px solid ${serviceAreas.includes(area) ? PALETTE.azure : PALETTE.line}`,
                background: serviceAreas.includes(area) ? PALETTE.azureSoft : PALETTE.white,
              }}
            >
              <input
                type="checkbox"
                checked={serviceAreas.includes(area)}
                onChange={() => toggleArea(area)}
                className="accent-[#2B86BC]"
              />
              {area}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.pro.whatsapp}</label>
        <input
          type="tel"
          required
          value={whatsappPhone}
          onChange={(e) => setWhatsappPhone(e.target.value)}
          placeholder="+33 6 12 34 56 78"
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.pro.email}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

      {error && (
        <p
          className="text-sm px-4 py-3 rounded-xl"
          style={{ background: "#FBE9E7", color: "#8C3A2B" }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold"
        style={{ background: PALETTE.navy, color: PALETTE.white }}
      >
        {t.pro.submitApplication}
      </button>
    </form>
  );
}
