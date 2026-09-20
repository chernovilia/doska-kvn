import AdsView from '@/components/AdsView';
import { DEFAULT_REGION_ID } from '@/data/regions';

export default function HomePage() {
  return <AdsView place={DEFAULT_REGION_ID} />;
}
