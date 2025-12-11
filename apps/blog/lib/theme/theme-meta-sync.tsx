import { themeColors } from './theme-config';

function themeMetaSync(colors: { light: string; dark: string }) {
  const updateThemeColor = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const expectedColor = isDark ? colors.dark : colors.light;

    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    if (!metaTags.length) return;

    for (const metaTag of metaTags) {
      // Only update if different to avoid infinite loops
      if (metaTag.getAttribute('content') !== expectedColor) {
        metaTag.setAttribute('content', expectedColor);
      }
    }
  };

  const themeObserver = new MutationObserver(updateThemeColor);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  const headObserver = new MutationObserver(updateThemeColor);
  headObserver.observe(document.head, {
    childList: true,
    subtree: true,
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
