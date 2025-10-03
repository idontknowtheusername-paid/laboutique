import { FeedbackProvider } from '@/components/ui/FeedbackProvider';
import HomePageContent from '@/components/home/HomePageContent';

export default function Home() {
  return (
    <FeedbackProvider>
      <HomePageContent />
    </FeedbackProvider>
  );
}