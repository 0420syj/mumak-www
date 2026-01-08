import { themeColors } from './theme-config';

function themeMetaSync(colors: { light: string; dark: string }) {
  let currentColor: string | null = null;

  const updateThemeColor = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const expectedColor = isDark ? colors.dark : colors.light;

    // Skip if color hasn't changed
    if (currentColor === expectedColor) return;
    currentColor = expectedColor;

    // Remove all existing theme-color meta tags
    const existingTags = document.querySelectorAll('meta[name="theme-color"]');
    for (const tag of existingTags) {
      tag.remove();
    }

    // Create and append new meta tag (Safari requires fresh tag for update)
    const newMeta = document.createElement('meta');
    newMeta.name = 'theme-color';
    newMeta.content = expectedColor;
    document.head.appendChild(newMeta);
  };

  const themeObserver = new MutationObserver(updateThemeColor);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

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
