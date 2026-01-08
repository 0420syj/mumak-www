import { themeColors } from './theme-config';

function themeMetaSync(colors: { light: string; dark: string }) {
  let currentColor: string | null = null;

  // Force Safari iOS to re-read theme-color by triggering focus change
  const triggerSafariUpdate = () => {
    // Method 1: Create temporary input for focus/blur trick
    const input = document.createElement('input');
    input.style.cssText = 'position:fixed;top:-100px;opacity:0;pointer-events:none;';
    document.body.appendChild(input);
    input.focus();
    input.blur();
    input.remove();

    // Method 2: Dispatch resize event as fallback
    window.dispatchEvent(new Event('resize'));
  };

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

    // Create and append new meta tag
    const newMeta = document.createElement('meta');
    newMeta.name = 'theme-color';
    newMeta.content = expectedColor;
    document.head.appendChild(newMeta);

    // Safari iOS needs UI interaction to re-read theme-color
    requestAnimationFrame(() => {
      triggerSafariUpdate();
    });
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
