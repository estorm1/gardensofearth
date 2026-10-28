import Link from "next/link";
import styles from "./site-header.module.css";

const navigation = [
  { label: "Home", href: "/#home" },
  { label: "Research", href: "/research" },
  { label: "GES", href: "/ges" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
  { label: "Books", href: "/books" },
  { label: "Contact", href: "/contact" },
] as const;

export default function SiteHeader({
  currentPage,
  subtitle,
}: {
  currentPage?: "Research" | "GES" | "News" | "About" | "Contact" | "Books";
  subtitle: string;
}) {
  return (
    <header className={styles.masthead}>
      <Link href="/" className={styles.wordmark}>
        Gardens of Earth<span>{subtitle}</span>
      </Link>
      <nav className={styles.mainNav} aria-label="Main menu">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.label === currentPage ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
