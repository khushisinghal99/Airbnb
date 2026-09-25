"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Globe2, Heart, House, Menu, Search, UserRound } from "lucide-react";
import { setMockUserId } from "@/lib/api/client";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [hostMode, setHostMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchPanel, setSearchPanel] = useState<"location" | "dates" | "guests" | null>(null);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const searchFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => { setHostMode(window.localStorage.getItem("staybnb_user_id") === "1"); }, []);

  useEffect(() => {
    function closeSearchPanel(event: PointerEvent) {
      if (!searchFormRef.current?.contains(event.target as Node)) setSearchPanel(null);
    }
    function closeSearchPanelOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchPanel(null);
    }
    document.addEventListener("pointerdown", closeSearchPanel);
    document.addEventListener("keydown", closeSearchPanelOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeSearchPanel);
      document.removeEventListener("keydown", closeSearchPanelOnEscape);
    };
  }, []);

  function switchMode() {
    const nextHostMode = !hostMode;
    setMockUserId(nextHostMode ? 1 : 6);
    setHostMode(nextHostMode);
    setMenuOpen(false);
    router.push(nextHostMode ? "/host" : "/");
  }

  function openHostDashboard() {
    if (!hostMode) {
      setMockUserId(1);
      setHostMode(true);
    }
    setMenuOpen(false);
    router.push("/host");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guestCount) params.set("guests", String(guestCount));
    if ((checkIn && !checkOut) || (!checkIn && checkOut) || (checkIn && checkOut <= checkIn)) return;
    setSearchPanel(null);
    window.location.href = `/${params.size ? `?${params.toString()}` : ""}`;
  }

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

  return (
    <header className="site-header sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between gap-5 px-5 md:px-10">
        <Link href="/" className="flex items-center gap-2 text-[#ff385c]" aria-label="Staybnb home">
          <House size={29} strokeWidth={2.7} /><span className="hidden text-[21px] font-bold tracking-[-1px] lg:block">staybnb</span>
        </Link>
        <form ref={searchFormRef} onSubmit={submitSearch} className="relative hidden h-12 items-center rounded-full border border-neutral-300 bg-white p-1 pl-2 text-sm shadow-sm transition hover:shadow-md md:flex">
          <div className="relative">
            <button type="button" aria-expanded={searchPanel === "location"} onClick={() => setSearchPanel(searchPanel === "location" ? null : "location")} className="rounded-full px-3 py-2 font-semibold hover:bg-neutral-100">{location || "Anywhere"}</button>
            {searchPanel === "location" && <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border bg-white p-4 shadow-xl"><label className="text-xs font-semibold">Search destinations<input autoFocus aria-label="Search destination" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or region" className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal outline-none focus:border-neutral-800" /></label></div>}
          </div>
          <div className="relative border-l border-neutral-200">
            <button type="button" aria-expanded={searchPanel === "dates"} onClick={() => setSearchPanel(searchPanel === "dates" ? null : "dates")} className="px-3 py-2 font-semibold hover:bg-neutral-100">{checkIn && checkOut ? `${checkIn} – ${checkOut}` : "Any week"}</button>
            {searchPanel === "dates" && <div className="absolute left-1/2 top-12 z-50 w-[340px] -translate-x-1/2 rounded-2xl border bg-white p-4 shadow-xl"><p className="mb-3 text-sm font-semibold">Choose your dates</p><div className="grid grid-cols-2 gap-3"><label className="text-xs text-neutral-600">Check-in<input aria-label="Search check-in date" type="date" min={today} value={checkIn} onChange={(event) => { setCheckIn(event.target.value); if (checkOut && event.target.value >= checkOut) setCheckOut(""); }} className="mt-1 w-full rounded-lg border p-2 text-sm text-neutral-900" /></label><label className="text-xs text-neutral-600">Check-out<input aria-label="Search check-out date" type="date" min={checkIn || today} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm text-neutral-900" /></label></div></div>}
          </div>
          <div className="relative border-l border-neutral-200">
            <button type="button" aria-expanded={searchPanel === "guests"} onClick={() => setSearchPanel(searchPanel === "guests" ? null : "guests")} className="px-3 py-2 text-neutral-600 hover:bg-neutral-100">{guestCount ? `${guestCount} ${guestCount === 1 ? "guest" : "guests"}` : "Add guests"}</button>
            {searchPanel === "guests" && <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border bg-white p-4 shadow-xl"><p className="text-sm font-semibold">Guests</p><div className="mt-3 flex items-center justify-between"><button type="button" aria-label="Remove one guest" disabled={guestCount <= 1} onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="grid h-9 w-9 place-items-center rounded-full border text-lg disabled:opacity-40">−</button><span className="text-sm">{guestCount || 1} {guestCount === 1 ? "guest" : "guests"}</span><button type="button" aria-label="Add one guest" onClick={() => setGuestCount(Math.min(16, guestCount + 1))} className="grid h-9 w-9 place-items-center rounded-full border text-lg">+</button></div></div>}
          </div>
          <button type="submit" aria-label="Search stays" className="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff385c] text-white transition hover:bg-[#e31c5f]"><Search size={16} /></button>
        </form>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/host" onClick={(event) => { if (!hostMode) { event.preventDefault(); openHostDashboard(); } }} className="hidden rounded-full px-4 py-3 text-sm font-semibold transition hover:bg-neutral-100 sm:block">{hostMode ? "Host dashboard" : "Become a host"}</Link>
          <button type="button" aria-label="Language options" className="hidden rounded-full p-3 transition hover:bg-neutral-100 sm:block"><Globe2 size={19} /></button>
          <div className="relative">
            <button type="button" aria-label="Open account menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="flex h-12 items-center gap-3 rounded-full border border-neutral-300 py-1.5 pl-3 pr-2 transition hover:shadow-md"><Menu size={17} /><span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-500 text-white"><UserRound size={19} /></span></button>
            {menuOpen && <>
              <button aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-14 z-50 w-60 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-2 shadow-xl">
                <Link href="/trips" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50"><House size={17} /> My trips</Link>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50"><Heart size={17} /> Wishlists</Link>
                <div className="my-1 border-t border-neutral-100" />
                <button onClick={switchMode} className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-neutral-50">{hostMode ? "Switch to guest" : "Switch to host"}</button>
                <Link href="/host" onClick={(event) => { event.preventDefault(); openHostDashboard(); }} className="block px-4 py-3 text-sm hover:bg-neutral-50">Host dashboard</Link>
              </div>
            </>}
          </div>
        </div>
      </div>
      {pathname !== "/" && <div className="flex justify-center border-t border-neutral-100 py-2.5 md:hidden"><Link className="flex items-center gap-3 rounded-full border border-neutral-200 px-4 py-2 text-xs shadow-sm" href="/"><Search size={15} /><span>Where to? · Any week · Add guests</span></Link></div>}
    </header>
  );
}
