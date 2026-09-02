import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CERTIFICATION_PLACEHOLDERS } from "../data/certifications";
import { CONTACT_DETAILS, SOCIAL_LINKS } from "../data/contact";
import { EDUCATION_PLACEHOLDERS } from "../data/education";
import { EXPERIENCE_BOOK_ENTRIES } from "../data/experience";
import { PROJECT_PLACEHOLDERS } from "../data/projects";
import "./portfolio-bookstall.css";

type BookId = "education" | "experience" | "projects" | "certifications" | "contact";

interface PortfolioBookstallProps {
  open: boolean;
  onClose: () => void;
}

const BOOKS: Array<{ id: BookId; label: string; code: string }> = [
  { id: "education", label: "Education", code: "01" },
  { id: "experience", label: "Experience", code: "02" },
  { id: "projects", label: "Projects", code: "03" },
  { id: "certifications", label: "Certifications", code: "04" },
  { id: "contact", label: "Contact", code: "05" },
];

function PageCopy({ book, page }: { book: BookId; page: number }) {
  if (book === "education") {
    const entry = EDUCATION_PLACEHOLDERS[page];
    return <article><p className="portfolio-book-eyebrow">{entry.periodPlaceholder}</p><h3>{entry.degreePlaceholder}</h3><h4>{entry.institutionPlaceholder}</h4><p>{entry.descriptionPlaceholder}</p></article>;
  }
  if (book === "experience") {
    const entry = EXPERIENCE_BOOK_ENTRIES[page];
    if (entry.type === "leadership") {
      return <article><p className="portfolio-book-eyebrow">Leadership · {entry.entry.periodPlaceholder}</p><h3>{entry.entry.rolePlaceholder}</h3><h4>{entry.entry.organizationPlaceholder}</h4><p>{entry.entry.descriptionPlaceholder}</p></article>;
    }
    return <article><p className="portfolio-book-eyebrow">Experience · {entry.entry.periodPlaceholder}</p><h3>{entry.entry.rolePlaceholder}</h3><h4>{entry.entry.companyPlaceholder}</h4><p>{entry.entry.descriptionPlaceholder}</p><ul>{entry.entry.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></article>;
  }
  if (book === "projects") {
    const entry = PROJECT_PLACEHOLDERS[page];
    return <article><p className="portfolio-book-eyebrow">{entry.yearPlaceholder} · {entry.categoryPlaceholder}</p><h3>{entry.titlePlaceholder}</h3><h4>{entry.subtitlePlaceholder}</h4><p>{entry.longDescriptionPlaceholder}</p><ul>{entry.techStack.map((technology) => <li key={technology}>{technology}</li>)}</ul></article>;
  }
  if (book === "certifications") {
    const entry = CERTIFICATION_PLACEHOLDERS[page];
    return <article><p className="portfolio-book-eyebrow">{entry.date}</p><h3>{entry.title}</h3><h4>{entry.issuer}</h4><p>{entry.description}</p><p className="portfolio-book-credential">Credential: {entry.credentialId}</p></article>;
  }
  if (page === 0) {
    return <article><p className="portfolio-book-eyebrow">Transmission channel</p><h3>Contact ZAEB</h3><h4>{CONTACT_DETAILS.location}</h4><p>{CONTACT_DETAILS.email}</p><p>{CONTACT_DETAILS.copyright}</p></article>;
  }
  return <article><p className="portfolio-book-eyebrow">Networks</p><h3>Find the work</h3><ul className="portfolio-book-socials">{SOCIAL_LINKS.map((link) => <li key={link.platform}><a href={link.urlPlaceholder} target="_blank" rel="noreferrer">{link.platform}</a></li>)}</ul></article>;
}

function pageTotal(book: BookId) {
  if (book === "education") return EDUCATION_PLACEHOLDERS.length;
  if (book === "experience") return EXPERIENCE_BOOK_ENTRIES.length;
  if (book === "projects") return PROJECT_PLACEHOLDERS.length;
  if (book === "certifications") return CERTIFICATION_PLACEHOLDERS.length;
  return 2;
}

export default function PortfolioBookstall({ open, onClose }: PortfolioBookstallProps) {
  const [activeBook, setActiveBook] = useState<BookId>("education");
  const [page, setPage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const total = useMemo(() => pageTotal(activeBook), [activeBook]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setPage((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight") setPage((current) => Math.min(total - 1, current + 1));
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [onClose, open, total]);

  if (!open) return null;

  const chooseBook = (book: BookId) => {
    setActiveBook(book);
    setPage(0);
  };

  return (
    <section className={`portfolio-bookstall-overlay${reducedMotion ? " reduced-motion" : ""}`} role="dialog" aria-modal="true" aria-label="ZAEB portfolio bookstall">
      <div className="portfolio-bookstall-backdrop" onClick={onClose} />
      <div className="portfolio-bookstall-shell">
        <header className="portfolio-bookstall-header">
          <div><p>ZAEB / FIELD ARCHIVE</p><h2>Bookstall</h2></div>
          <button type="button" className="portfolio-bookstall-close" onClick={onClose}><X size={16} /> Close</button>
        </header>
        <div className="portfolio-bookstall-covers" aria-label="Choose a portfolio book">
          {BOOKS.map((book) => <button type="button" key={book.id} onClick={() => chooseBook(book.id)} className={`portfolio-book-cover${activeBook === book.id ? " active" : ""}`}><span>{book.code}</span><strong>{book.label}</strong><i>ZAEB</i></button>)}
        </div>
        <div className="portfolio-book-reading-area">
          <button type="button" className="portfolio-book-control" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} aria-label="Previous page"><ChevronLeft size={18} /></button>
          <div className="portfolio-book-pages">
            <div className="portfolio-book-page portfolio-book-page-left"><p>{BOOKS.find((book) => book.id === activeBook)?.label}</p><span>ZAEB / {String(page + 1).padStart(2, "0")}</span></div>
            <div className="portfolio-book-page portfolio-book-page-right"><PageCopy book={activeBook} page={page} /></div>
          </div>
          <button type="button" className="portfolio-book-control" onClick={() => setPage((current) => Math.min(total - 1, current + 1))} disabled={page === total - 1} aria-label="Next page"><ChevronRight size={18} /></button>
        </div>
        <footer className="portfolio-bookstall-footer"><span>{String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span><button type="button" onClick={onClose}>Return to world</button></footer>
      </div>
    </section>
  );
}
