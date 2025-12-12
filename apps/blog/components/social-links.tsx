import { Button } from '@mumak/ui/components/button';
import { cn } from '@mumak/ui/lib/utils';

import { getIcon, socialLinks, type SocialLink } from '@/lib/social-links';

interface SocialLinksProps {
  variant?: 'default' | 'compact';
  className?: string;
}

function Icon({ slug, className }: { slug: string; className?: string }) {
  const icon = getIcon(slug);
  if (!icon) return null;

  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d={icon.path} />
    </svg>
  );
}

export function SocialLinks({ variant = 'default', className }: SocialLinksProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {socialLinks.map(({ name, url, iconSlug, ariaLabel }: SocialLink) => {
        const label = ariaLabel || `Visit ${name}`;

        if (isCompact) {
          return (
            <Button
              key={name}
              variant="ghost"
              size="icon-sm"
              asChild
              aria-label={label}
              className="text-muted-foreground hover:text-foreground"
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon slug={iconSlug} className="size-4" />
                <span className="sr-only">{label}</span>
              </a>
            </Button>
          );
        }

        return (
          <Button key={name} variant="outline" size="sm" asChild aria-label={label} className="gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Icon slug={iconSlug} className="size-4" />
              <span>{name}</span>
            </a>
          </Button>
        );
      })}
    </div>
  );
}
