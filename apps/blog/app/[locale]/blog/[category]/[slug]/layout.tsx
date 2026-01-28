import { ReadingProgress } from '@/src/widgets/reading-progress';

interface PostLayoutProps {
  children: React.ReactNode;
}

export default function PostLayout({ children }: PostLayoutProps) {
  return (
    <>
      <ReadingProgress />
      {children}
    </>
  );
}
