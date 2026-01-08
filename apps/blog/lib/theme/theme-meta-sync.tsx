import { themeColors } from './theme-config';

// Initial theme-color sync on page load (before React hydration)
function themeMetaSync(colors: { light: string; dark: string }) {
  const updateThemeColor = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const expectedColor = isDark ? colors.dark : colors.light;

    // Remove existing theme-color meta tags (including those with media queries)
    const existingTags = document.querySelectorAll('meta[name="theme-color"]');
    for (const tag of existingTags) {
      tag.remove();
    }

    // Create new meta tag without media query
    const newMeta = document.createElement('meta');
    newMeta.name = 'theme-color';
    newMeta.content = expectedColor;
    document.head.appendChild(newMeta);
  };

  // Run once on initial load
  updateThemeColor();
}

export function ThemeMetaSyncScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(${themeMetaSync.toString()})(${JSON.stringify(themeColors)})`,
      }}
    />
  );
}
