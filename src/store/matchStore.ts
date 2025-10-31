import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Match {
  time: string;
  teams: string;
  channelId: string;
  isLive: boolean;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  event?: string;
}

interface Banner {
  id: number;
  imageUrl: string;
  link: string;
  hidden?: boolean;
}

interface Settings {
  streamDomain: string;
  videoPlayerUrl: string;
}

interface MatchStore {
  matches: Match[];
  banners: Banner[];
  sideBanners: Banner[];
  topBanner: Banner;
  settings: Settings;
  setMatches: (matches: Match[]) => void;
  updateMatch: (index: number, match: Match) => void;
  updateBanner: (index: number, imageUrl: string, link: string, hidden?: boolean) => void;
  updateSideBanner: (index: number, imageUrl: string, link: string, hidden?: boolean) => void;
  updateTopBanner: (imageUrl: string, link: string, hidden?: boolean) => void;
  updateSettings: (settings: Settings) => void;
}

export const useMatchStore = create<MatchStore>()(
  persist(
    (set) => ({
      matches: [
        { teams: 'Al Hilal - Al Shabab', time: '17:50', channelId: 'yayintrtspor', isLive: true, event: 'Suudi Arabistan Pro Lig' },
        { teams: 'Esenler Erokspor - Tofaş', time: '19:00', channelId: 'yayinb5', isLive: true, event: 'Basketbol Süper Ligi' },
        { teams: 'Rams Başakşehir - Kocaelispor', time: '20:00', channelId: 'yayinzirve', isLive: true, event: 'Trendyol Süper Lig' },
        { teams: 'Hatayspor - Erzurumspor', time: '20:00', channelId: 'yayintrtspor', isLive: true, event: 'Trendyol 1. Lig' },
        { teams: 'Monaco - Panathinaikos', time: '21:00', channelId: 'yayinss2', isLive: true, event: 'THY Euroleague' },
        { teams: 'PSV - Fortuna Sittard', time: '22:00', channelId: 'yayint2', isLive: true, event: 'Hollanda Eredivisie' },
        { teams: 'Augsburg - B. Dortmund', time: '22:30', channelId: 'yayint1', isLive: true, event: 'Almanya Bundesliga' },
        { teams: 'Baskonia - Anadolu Efes', time: '22:30', channelId: 'yayinss', isLive: true, event: 'THY Euroleague' },
        { teams: 'Getafe - Girona', time: '23:00', channelId: 'yayint3', isLive: true, event: 'İspanya La Liga' },
        { teams: 'Sporting Lisbon - Alverca', time: '23:15', channelId: 'yayint4', isLive: true, event: 'Portekiz Liga NOS' }
      ],
      settings: {
        streamDomain: "www.trvtv5.com",
        videoPlayerUrl: ""
      },
      topBanner: {
        id: 0,
        imageUrl: "/%C3%BCstbanner.jpg",
        link: ""
      },
      sideBanners: [
        { 
          id: 1, 
          imageUrl: "/SolBanner.jpg", 
          link: "" 
        },
        
      ],
      banners: [
        { 
          id: 1, 
          imageUrl: "https://cmsbetconstruct.com/storage/medias/avrupabet/content_1865543_6f09094523a7419ab08c650917338d45.webp", 
          link: "https://cenalt.com/guncelgiris" 
        },
        { 
          id: 2, 
          imageUrl: "https://cmsbetconstruct.com/storage/medias/avrupabet/content_1865543_3578ff867bcae865750d7cec5f19de2d.webp", 
          link: "https://cenalt.com/guncelgiris" 
        },
        { 
          id: 3, 
          imageUrl: "https://cmsbetconstruct.com/storage/medias/avrupabet/content_1865543_81ec7ca2bca04f400875e467b851445c.webp", 
          link: "https://cenalt.com/guncelgiris" 
        }
      ],
      setMatches: (matches) => set({ matches }),
      updateMatch: (index, match) => set((state) => ({
        matches: state.matches.map((m, i) => i === index ? match : m)
      })),
      updateBanner: (index, imageUrl, link, hidden) => set((state) => ({
        banners: state.banners.map((b) => 
          b.id === index ? { ...b, imageUrl, link, hidden } : b
        )
      })),
      updateSideBanner: (index, imageUrl, link, hidden) => set((state) => ({
        sideBanners: state.sideBanners.map((b) => 
          b.id === index ? { ...b, imageUrl, link, hidden } : b
        )
      })),
      updateTopBanner: (imageUrl, link, hidden) => set((state) => ({
        topBanner: { ...state.topBanner, imageUrl, link, hidden }
      })),
      updateSettings: (settings) => set({ settings })
    }),
    {
      name: 'match-storage',
    }
  )
);
