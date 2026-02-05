import rehypeShiki from '@shikijs/rehype';
import remarkGfm from 'remark-gfm';
import type { EvaluateOptions } from 'next-mdx-remote-client/rsc';

export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypeShiki,
        {
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
        },
      ],
    ],
  },
} satisfies EvaluateOptions;
