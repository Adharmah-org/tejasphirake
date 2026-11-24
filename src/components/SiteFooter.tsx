import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#2B2823] bg-[#080706] text-[#9A9285]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-5">
            <Link
              to="/"
              className="font-literary text-xl font-semibold tracking-[0.14em] text-[#EFEAE0]"
            >
              BENIYAAZ ROOH
            </Link>
            <p className="mt-1 text-xs tracking-wide text-[#9A9285]">
              Tejas Purvesh Phirake
            </p>
            <p className="mt-4 max-w-sm font-literary text-lg italic text-[#C9A45C]">
              Some feelings leave. The words stay.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#9A9285]">
              Novels, Marathi theatre, poetry, and stories in Marathi, Hindi,
              and English.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <h3 className="text-xs font-medium tracking-wide text-[#EFEAE0]">
                Library &amp; Author
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/books" className="transition-colors hover:text-[#DEC07C]">
                    The Library
                  </Link>
                </li>
                <li>
                  <Link
                    to="/books?section=special-editions"
                    className="transition-colors hover:text-[#DEC07C]"
                  >
                    Special Editions
                  </Link>
                </li>
                <li>
                  <Link to="/author" className="transition-colors hover:text-[#DEC07C]">
                    Author&apos;s Archive
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="transition-colors hover:text-[#DEC07C]">
                    About the Author
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium tracking-wide text-[#EFEAE0]">
                Verse, Stage &amp; Stories
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/poetry" className="transition-colors hover:text-[#DEC07C]">
                    Poetry Room
                  </Link>
                </li>
                <li>
                  <Link to="/theatre" className="transition-colors hover:text-[#DEC07C]">
                    The Theatre
                  </Link>
                </li>
                <li>
                  <Link to="/stories" className="transition-colors hover:text-[#DEC07C]">
                    Story Archives
                  </Link>
                </li>
                <li>
                  <Link to="/midnight-page" className="transition-colors hover:text-[#DEC07C]">
                    Midnight Page
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium tracking-wide text-[#EFEAE0]">
                Reader&apos;s Corner
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/moods" className="transition-colors hover:text-[#DEC07C]">
                    Choose Your Mood
                  </Link>
                </li>
                <li>
                  <Link to="/journal" className="transition-colors hover:text-[#DEC07C]">
                    Unsaid Journal
                  </Link>
                </li>
                <li>
                  <Link to="/saved" className="transition-colors hover:text-[#DEC07C]">
                    My Bookshelf
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#2B2823] pt-6 text-xs text-[#9A9285] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Tejas Purvesh Phirake · TEJAS | BENIYAAZ ROOH</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/undefined" className="text-[#9A9285] transition-colors hover:text-[#ECE7DC]">
              UNDEFINED · Archive
            </Link>
            <span aria-hidden="true">·</span>
            <p>All works preserved for online reading.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
