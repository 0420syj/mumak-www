import type { PublishedImage } from './published-image';

function createSnippet(result: PublishedImage, alt: string, decorative: boolean) {
  const escapedAlt = alt
    .trim()
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  const accessibility = decorative ? 'alt=""\n    role="presentation"\n    aria-hidden="true"' : `alt="${escapedAlt}"`;

  return `<picture>
  <source type="image/webp" srcSet="${result.urls.webp}" />
  <img
    src="${result.urls.jpeg}"
    ${accessibility}
    width="${result.width}"
    height="${result.height}"
    loading="lazy"
    decoding="async"
  />
</picture>`;
}

export { createSnippet };
