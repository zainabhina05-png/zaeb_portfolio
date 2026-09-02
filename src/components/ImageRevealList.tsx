import type { ReactNode } from "react";
import "./image-reveal-list.css";

export interface ImageRevealListItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  number: string;
  href?: string;
}

export interface ImageRevealListProps {
  items: ImageRevealListItem[];
  className?: string;
  renderIcon?: (item: ImageRevealListItem) => ReactNode;
}

export function ImageRevealList({ items, className = "", renderIcon }: ImageRevealListProps) {
  return (
    <div className={`image-reveal-list ${className}`}>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={item.href || "#"}>
              <img className="image-reveal-list-preview" src={item.image} alt="" aria-hidden="true" loading="lazy" />
              <span className="image-reveal-list-number">{item.number}</span>
              {renderIcon?.(item)}
              <span className="image-reveal-list-title">{item.title}</span>
              {item.subtitle && <span className="image-reveal-list-subtitle">{item.subtitle}</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ImageRevealList;
