import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import {
  GlobalTranslateControl,
  GlobalTranslationBanner,
} from './GlobalTranslateControl';

interface SiteHeaderProps {
  onOpenSearch: () => void;
}

const PRIMARY_NAV = [
  { to: '/books', label: 'The Library' },
  { to: '/author', label: 'Author' },
  { to: '/poetry', label: 'Poetry' },
  { to: '/theatre', label: 'Theatre' },
  { to: '/stories', label: 'Story Archives' },
];

const ECOSYSTEM_LINKS = [
  { to: '/books', label: 'The Library', subtitle: 'Novels & preserved editions' },
  { to: '/author', label: 'About the Author', subtitle: 'Tejas Purvesh Phirake' },
  { to: '/poetry', label: 'The Poetry Room', subtitle: 'Marathi · Hindi · English' },
  { to: '/theatre', label: 'The Theatre', subtitle: 'तीन अंकी मराठी नाटक' },
  { to: '/stories', label: 'Story Archives', subtitle: 'Chapters & character dossiers' },
  { to: '/journal', label: 'Unsaid Journal', subtitle: 'Prefaces & author notes' },
  { to: '/midnight-page', label: 'Midnight Page', subtitle: 'Selected excerpts' },
  { to: '/moods', label: 'Choose Your Mood', subtitle: 'Browse by emotion' },
  { to: '/saved', label: 'My Bookshelf', subtitle: 'Favourites & progress' },
  { to: '/undefined', label: 'UNDEFINED', subtitle: 'An archive of unresolved moments' },
];

export function SiteHeader({ onOpenSearch }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [universeOpen, setUniverseOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setUniverseOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!universeOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUniverseOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUniverseOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [universeOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2B2823] bg-[#0C0B0A]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:gap-6 sm:px-6">
        {/* Zone 1: Single-line Wordmark */}
        <Link
          to="/"
          data-no-translate="true"
          className="min-w-0 truncate whitespace-nowrap font-literary text-base font-semibold tracking-[0.14em] text-[#EFEAE0] transition-colors hover:text-[#DEC07C] sm:text-xl sm:tracking-[0.16em]"
        >
          BENIYAAZ ROOH
        </Link>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          className="hidden items-center gap-5 lg:flex xl:gap-6"
          aria-label="Primary navigation"
        >
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 text-sm tracking-wide transition-colors duration-150 ${
                  isActive
                    ? 'text-[#DEC07C] underline decoration-[#C9A45C]/70 underline-offset-8'
                    : 'text-[#C4BDB0] hover:text-[#EFEAE0]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUniverseOpen((prev) => !prev)}
              aria-expanded={universeOpen}
              aria-haspopup="true"
              className="inline-flex whitespace-nowrap shrink-0 items-center gap-1 text-sm tracking-wide text-[#C4BDB0] transition-colors duration-150 hover:text-[#DEC07C]"
            >
              <span>Rooms</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  universeOpen ? 'rotate-180 text-[#DEC07C]' : ''
                }`}
              />
            </button>

            {universeOpen && (
              <div className="absolute right-0 top-full mt-3 w-[440px] rounded-md border border-[#2B2823] bg-[#141311] p-3 shadow-2xl">
                <p className="border-b border-[#2B2823] px-2 pb-2 text-xs font-medium text-[#C9A45C]">
                  Rooms &amp; Archives
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {ECOSYSTEM_LINKS.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `rounded px-2.5 py-2 transition-colors ${
                          isActive
                            ? 'bg-[#1C1A17] text-[#DEC07C]'
                            : 'text-[#EFEAE0] hover:bg-[#1C1A17] hover:text-[#DEC07C]'
                        }`
                      }
                    >
                      <span className="block text-xs font-medium">{link.label}</span>
                      <span className="block truncate text-[11px] text-[#9A9285]">
                        {link.subtitle}
                      </span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Global Translate + Search Action (+ Mobile Menu Button) */}
        <div className="flex shrink-0 items-center gap-2">
          <GlobalTranslateControl variant="header" />

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search books, poems, stories, and notes"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-[#2B2823] bg-[#141311] px-2.5 text-xs font-medium text-[#EFEAE0] transition-colors duration-150 hover:border-[#C9A45C]/60 hover:text-[#DEC07C] whitespace-nowrap sm:gap-2.5 sm:px-3.5"
          >
            <Search className="h-3.5 w-3.5 text-[#C9A45C]" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-[#2B2823] bg-[#0C0B0A] px-1.5 py-0.5 text-[10px] font-sans text-[#9A9285] lg:inline">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#2B2823] bg-[#141311] text-[#EFEAE0] lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <GlobalTranslationBanner />

      {mobileOpen && (
        <nav
          className="max-h-[75vh] overflow-y-auto border-t border-[#2B2823] bg-[#100F0D] px-4 py-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          <p className="px-3 pb-2 text-[11px] font-medium text-[#C9A45C]">
            BENIYAAZ ROOH · Rooms &amp; Archives
          </p>
          <div className="grid grid-cols-1 gap-1">
            {ECOSYSTEM_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[#1C1A17] text-[#DEC07C]'
                      : 'text-[#C4BDB0] hover:bg-[#141311] hover:text-[#EFEAE0]'
                  }`
                }
              >
                <span>{item.label}</span>
                <span className="text-[11px] text-[#9A9285]">{item.subtitle}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
