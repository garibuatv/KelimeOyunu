import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import getFirebase from './firebase';

export type Banner = { id: number; imageUrl: string; link: string; hidden?: boolean };
export type TopBanner = { id: number; imageUrl: string; link: string; hidden?: boolean };

export type BannerConfig = {
  topBanner: TopBanner;
  leftBanner: Banner; // Sol banner (tek)
  banners: Banner[]; // Alt bannerlar
};

const COLLECTION = 'config';
const DOC_ID = 'banners';

export function listenBannerConfig(
  handler: (config: BannerConfig) => void
) {
  const { db } = getFirebase();
  const ref = doc(db, COLLECTION, DOC_ID);
  return onSnapshot(ref, (snap) => {
    const data = snap.data() as BannerConfig | undefined;
    if (data) handler(data);
  });
}

export async function saveBannerConfig(config: BannerConfig) {
  const { db } = getFirebase();
  const ref = doc(db, COLLECTION, DOC_ID);
  await setDoc(ref, config, { merge: true });
}


