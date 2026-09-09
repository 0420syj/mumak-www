import { createSnippet } from '../create-snippet';

const result = {
  assetId: 'a'.repeat(64),
  width: 1600,
  height: 1067,
  urls: {
    jpeg: `https://img.wannysim.com/blog/${'a'.repeat(64)}/content-v1/image.jpg`,
    webp: `https://img.wannysim.com/blog/${'a'.repeat(64)}/content-v1/image.webp`,
  },
};

describe('createSnippet', () => {
  it('creates one immutable WebP/JPEG picture pair with real dimensions', () => {
    expect(createSnippet(result, ' 산 위로 떠오르는 해 ', false)).toContain(`srcSet="${result.urls.webp}"`);
    expect(createSnippet(result, ' 산 위로 떠오르는 해 ', false)).toContain(`src="${result.urls.jpeg}"`);
    expect(createSnippet(result, ' 산 위로 떠오르는 해 ', false)).toContain('alt="산 위로 떠오르는 해"');
    expect(createSnippet(result, ' 산 위로 떠오르는 해 ', false)).toContain('width="1600"');
  });

  it('marks decorative images with the complete accessibility contract', () => {
    const snippet = createSnippet(result, '', true);
    expect(snippet).toContain('alt=""');
    expect(snippet).toContain('role="presentation"');
    expect(snippet).toContain('aria-hidden="true"');
  });

  it('escapes user-authored alt text inside the MDX attribute', () => {
    expect(createSnippet(result, 'A < B & "quoted"', false)).toContain('alt="A &lt; B &amp; &quot;quoted&quot;"');
  });
});
