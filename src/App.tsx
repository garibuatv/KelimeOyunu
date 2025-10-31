import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Tv2, Calendar, Twitter, Layers } from 'lucide-react';
import { useMatchStore } from './store/matchStore';
import { listenBannerConfig } from './services/bannerService';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function MainContent() {
  const [currentChannel, setCurrentChannel] = useState('yayinzirve');
  const [activeChannels, setActiveChannels] = useState<string[]>([]);
  const [isMultiScreen, setIsMultiScreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { matches, banners, sideBanners, topBanner, settings, updateTopBanner, updateSideBanner, updateBanner } = useMatchStore();


  // Fullscreen değişikliklerini izleme
  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);

    // Fullscreen API hook
    const originalRequestFullscreen = Element.prototype.requestFullscreen;
    const originalWebkitRequestFullscreen = (Element.prototype as any).webkitRequestFullscreen;
    const originalMozRequestFullScreen = (Element.prototype as any).mozRequestFullScreen;
    const originalMsRequestFullscreen = (Element.prototype as any).msRequestFullscreen;

    if (originalRequestFullscreen) {
      Element.prototype.requestFullscreen = function(this: Element) {
        setIsFullscreen(true);
        return originalRequestFullscreen.apply(this, arguments as any);
      } as any;
    }

    if (originalWebkitRequestFullscreen) {
      (Element.prototype as any).webkitRequestFullscreen = function(this: Element) {
        setIsFullscreen(true);
        return originalWebkitRequestFullscreen.apply(this, arguments as any);
      };
    }

    if (originalMozRequestFullScreen) {
      (Element.prototype as any).mozRequestFullScreen = function(this: Element) {
        setIsFullscreen(true);
        return originalMozRequestFullScreen.apply(this, arguments as any);
      };
    }

    if (originalMsRequestFullscreen) {
      (Element.prototype as any).msRequestFullscreen = function(this: Element) {
        setIsFullscreen(true);
        return originalMsRequestFullscreen.apply(this, arguments as any);
      };
    }

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler);

      // Restore original methods
      if (originalRequestFullscreen) {
        Element.prototype.requestFullscreen = originalRequestFullscreen;
      }
      if (originalWebkitRequestFullscreen) {
        (Element.prototype as any).webkitRequestFullscreen = originalWebkitRequestFullscreen;
      }
      if (originalMozRequestFullScreen) {
        (Element.prototype as any).mozRequestFullScreen = originalMozRequestFullScreen;
      }
      if (originalMsRequestFullscreen) {
        (Element.prototype as any).msRequestFullscreen = originalMsRequestFullscreen;
      }
    };
  }, []);

  // Global banner konfigürasyonunu dinle
  useEffect(() => {
    const unsub = listenBannerConfig((cfg) => {
      setRemoteBanners({ topBanner: cfg.topBanner, leftBanner: cfg.leftBanner, banners: cfg.banners });
      if (cfg.topBanner) {
        updateTopBanner(cfg.topBanner.imageUrl, cfg.topBanner.link, cfg.topBanner.hidden);
      }
      if (cfg.leftBanner) {
        updateSideBanner(cfg.leftBanner.id, cfg.leftBanner.imageUrl, cfg.leftBanner.link, cfg.leftBanner.hidden);
      }
      if (cfg.banners) {
        cfg.banners.forEach(banner => {
          updateBanner(banner.id, banner.imageUrl, banner.link, banner.hidden);
        });
      }
    });
    return () => unsub();
  }, [updateTopBanner, updateSideBanner, updateBanner]);

  const loadMobileChannel = (channelId: string) => {
    // Sorun tespit için logging ekle
    console.log("Maç kanalı tıklandı:", channelId);
    
    // Boş channel ID kontrolü
    if (!channelId || channelId.trim() === '') {
      console.warn('Geçersiz kanal ID:', channelId);
      return;
    }
    
    // Özel durum - channelId'nin 'yayinzirve' olduğu durum için özel kontrol
    // Bu, Eyüpspor - Adana Demirspor maçının kanal ID'si
    if (channelId === 'yayinzirve' && isMultiScreen && !activeChannels.includes(channelId)) {
      console.log("yayinzirve kanalı eklenecek");
      
      // Maksimum 3 kanal kontrolü
      if (activeChannels.length >= 3) {
        const updatedChannels = [...activeChannels];
        updatedChannels.pop();
        setActiveChannels([channelId, ...updatedChannels]);
      } else {
        setActiveChannels([channelId, ...activeChannels]);
      }
      return;
    }
    
    if (isMultiScreen) {
      if (activeChannels.includes(channelId)) {
        // Kanal zaten aktifse, listeden çıkar
        setActiveChannels(activeChannels.filter(ch => ch !== channelId));
      } else {
        // Maksimum 3 kanal kontrolü
        if (activeChannels.length >= 3) {
          // Eğer 3 kanal zaten seçiliyse, son eklenen kanalı çıkar ve yeni kanalı ekle
          const updatedChannels = [...activeChannels];
          updatedChannels.pop(); // Son eklenen kanalı çıkar
          setActiveChannels([channelId, ...updatedChannels]);
        } else {
          // 3'ten az kanal varsa, yeni kanalı ekle
          setActiveChannels([channelId, ...activeChannels]);
        }
      }
    } else {
      setCurrentChannel(channelId);
    }
    
    // Konsola log ekle
    console.log('Aktif kanallar:', isMultiScreen ? [...activeChannels, channelId] : [channelId]);
  };

  const toggleMultiScreen = () => {
    if (!isMultiScreen) {
      setActiveChannels([currentChannel]);
      setIsMultiScreen(true);
    } else {
      if (activeChannels.length > 0) {
        setCurrentChannel(activeChannels[0]);
      }
      setActiveChannels([]);
      setIsMultiScreen(false);
    }
  };

  const toggleCustomFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    setIsCustomFullscreen(!isCustomFullscreen);
    
    if (!isCustomFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const getPlayerUrl = (channelId: string) => {
    // Eğer tam URL verildiyse (domain + id), doğrudan kullan
    if (channelId.startsWith('http://') || channelId.startsWith('https://')) {
      return channelId;
    }
    if (settings.videoPlayerUrl) {
      return `${settings.videoPlayerUrl}?id=${channelId}`;
    }
    return `https://${settings.streamDomain}/channel?id=${channelId}`;
  };

  return (
    <div className="min-h-screen" style={{
      backgroundImage: 'url("/background.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      {/* Alert Banner */}
      <div className="w-full py-2 text-center" style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333'
      }}>
        <span className="text-white text-sm">
          Bir sonraki adresimiz <strong>xxx.com</strong> olacaktır.
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 header-container" style={{
        backgroundColor: 'rgba(13, 15, 29, 0.5)',
        backdropFilter: 'blur(5px)'
      }}>
        <div className="container mx-auto px-4 py-3">
          {/* Üst Sıra: Logo, Sosyal/İletişim ve Slider (Desktop) */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Sol Taraf: Logo */}
            <div className="flex items-center flex-shrink-0" style={{ overflow: 'hidden' }}>
              {/* Logo */}
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img 
                  src="/fsfslogo.png" 
                  alt="Logo" 
                  className="header-logo" 
                  style={{ height: "102px", width: "auto" }} 
                />
              </div>
            </div>

            {/* Sağ Taraf: Social and Contact Buttons */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://x.com/futsmart_tvv"
                  target="_blank"
                  rel="noopener noreferrer" 
                className="text-gray-400 hover:text-green-600 transition-all transform hover:scale-110"
                >
                  <div style={{ width: '45px', height: '45px' }}>
                    <img src="/x.png" alt="X (Twitter) Logo" className="h-full w-full" />
                  </div>
                </a>
                <a 
                  href="https://t.me/+ySMyeFiBSAQwNmE8"
                  target="_blank"
                  rel="noopener noreferrer" 
                className="text-gray-400 hover:text-green-600 transition-all transform hover:scale-110"
                >
                  <div style={{ width: '45px', height: '45px' }}>
                    <img src="/telegramm.png" alt="Telegram Logo" className="h-full w-full" />
                  </div>
                </a>
                <a 
                  href="https://t.me/fsreklam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent hover:bg-black/20 px-5 md:px-6 py-2.5 rounded-full text-base font-medium transition-all border border-gray-500 whitespace-nowrap"
                >
                  <span className="blink-text">Reklam ve İletişim</span>
                </a>
              </div>
            </div>

          {/* Mobil Görünüm: Logo Sol, Butonlar Sağ */}
          <div className="md:hidden flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-1 cursor-pointer" style={{ overflow: 'hidden' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img 
                src="/fsfslogo.png" 
                alt="Logo" 
                className="header-logo" 
                style={{ height: "102px", width: "auto" }} 
              />
            </div>
            {/* Social and Contact Buttons */}
            <div className="flex items-center gap-4">
              <a 
                href="https://x.com//futsmart_tvv"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-green-600 transition-all transform hover:scale-110"
              >
                <div style={{ width: '45px', height: '45px' }}>
                  <img src="/x.png" alt="X (Twitter) Logo" className="h-full w-full" />
                </div>
              </a>
              {/* Telegram ikonu eklendi (Mobil) */}
              <a 
                href="https://t.me/+ySMyeFiBSAQwNmE8"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-green-600 transition-all transform hover:scale-110"
              >
                <div style={{ width: '45px', height: '45px' }}>
                  <img src="/telegramm.png" alt="Telegram Logo" className="h-full w-full" />
                </div>
              </a>
              <a 
                href="https://t.me/fsreklam"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent hover:bg-black/20 px-5 py-2.5 rounded-full text-base font-medium transition-all border border-gray-500 whitespace-nowrap"
              >
                <span className="blink-text">Reklam ve İletişim</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative">
        {/* Top Banner */}
        <div className="mb-6 text-center">
          {(() => {
            const tb = topBanner;
            const img = tb?.imageUrl || '/%C3%BCstbanner.jpg';
            const link = tb?.link;
            if (tb?.hidden) return null;
            return link ? (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <img className="w-full md:w-1/2 mx-auto" src={img} alt="Top Banner" />
              </a>
            ) : (
              <img className="w-full md:w-1/2 mx-auto" src={img} alt="Top Banner" />
            );
          })()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Banner - Hidden on Mobile */}
          <div className="hidden md:block md:col-span-3">
            {(() => {
              const lb = sideBanners && sideBanners[0];
              const img = lb?.imageUrl || '/SolBanner.jpg';
              const link = lb?.link;
              if (lb?.hidden) return null;
              return link ? (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <img src={img} alt="Sol Banner" className="w-full" />
                </a>
              ) : (
                <img src={img} alt="Sol Banner" className="w-full" />
              );
            })()}
          </div>

          {/* Video Player Container */}
          <div className={`md:col-span-6 video-player-section ${isCustomFullscreen ? 'custom-fullscreen-active' : ''}`}
               ref={playerContainerRef}>
            
            <div className="grid grid-cols-1 gap-4">
              {/* First Player - always visible */}
              {!isMultiScreen && (
                <div className="w-full bg-black rounded-xl overflow-hidden border border-green-900/20 shadow-2xl shadow-green-900/10 relative">
                <div className="mobile-player">
                  <iframe 
                    src={getPlayerUrl(currentChannel)}
                    className="absolute top-0 left-0 w-full h-full"
                    allowFullScreen
                  ></iframe>
                  </div>
                </div>
              )}
              
              {/* Multiple Players in grid layout */}
              {isMultiScreen && (
                <div className="flex flex-col gap-3">
                  {/* Kanal Seçim Bilgisi */}
                  <div className="inline-flex bg-gray-900/70 backdrop-blur-sm rounded-lg border border-green-700/30 px-2 py-1 w-fit">
                    <div className="text-sm text-white whitespace-nowrap">
                      <span className="font-bold text-green-500">{activeChannels.length}</span> / <span className="font-bold">3</span> kanal seçildi
                    </div>
                  </div>
                  
                  {/* Kanallar */}
                  {activeChannels.map((channelId, index) => (
                    <div key={index} className="w-full bg-black rounded-xl overflow-hidden border border-green-900/20 shadow-2xl shadow-green-900/10 relative">
                  <div className="mobile-player">
                    <iframe 
                          src={getPlayerUrl(channelId)}
                      className="absolute top-0 left-0 w-full h-full"
                      allowFullScreen
                    ></iframe>
                      </div>
                      <button 
                        onClick={() => setActiveChannels(activeChannels.filter(ch => ch !== channelId))}
                        className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-lg border border-white/30 transition-all transform hover:scale-110"
                      >
                        ×
                      </button>
                  </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile View - Matches Section AFTER Video */}
            <div className="block md:hidden mt-4 mb-4">
              <div className="matches-container p-3" style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333'
              }}>
                <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: '1px solid #333' }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#888' }} />
                    <h2 className="text-sm font-semibold" style={{ color: '#ddd' }}>Günün Maçları</h2>
                  </div>
                  <button 
                    onClick={toggleMultiScreen}
                    className="px-3 py-1 text-xs font-medium flex items-center gap-1 transition-colors"
                    style={{ 
                      backgroundColor: isMultiScreen ? '#333' : '#333',
                      color: '#fff',
                      border: '1px solid #444'
                    }}
                  >
                    <Layers className="h-3 w-3" />
                    {isMultiScreen ? 'Tek Ekran' : 'Çoklu Ekran'}
                  </button>
                </div>

                <div className="max-h-[110px] overflow-y-auto pr-1" id="mobile-matches-bottom">
                  {matches.map((match, index) => (
                    <div 
                      key={index} 
                      onClick={() => loadMobileChannel(match.channelId)}
                      className="px-2.5 py-2.5 mb-1.5 cursor-pointer transition-all"
                      style={{
                        backgroundColor: (isMultiScreen && activeChannels.includes(match.channelId)) || (!isMultiScreen && match.channelId === currentChannel)
                          ? '#333' 
                          : '#252525',
                        borderLeft: (isMultiScreen && activeChannels.includes(match.channelId)) || (!isMultiScreen && match.channelId === currentChannel)
                          ? '3px solid #666'
                          : '3px solid transparent',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        borderRadius: '4px',
                        border: '1px solid #333'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>{match.teams}</span>
                        <span style={{ color: '#777', fontSize: '12px', marginLeft: '12px' }}>{match.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile View - Left Banner */}
            <div className="block md:hidden mt-4 mb-4">
              <img src="/SolBanner.jpg" alt="Sol Banner" className="w-full" />
            </div>

            {/* Bottom Banners - Flex on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6 banners-section banners-grid">
              {banners.filter((b: any) => !b?.hidden).map((banner) => {
                const commonClass = "w-full h-[140px] md:h-[193px] rounded-xl overflow-hidden shadow-lg transform hover:scale-[1.02] transition-transform";
                const content = (
                  <img 
                    src={banner.imageUrl}
                    alt={`Advertisement ${banner.id}`}
                    className="w-full h-full object-contain"
                  />
                );
                return banner.link ? (
                  <a 
                    key={banner.id}
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={commonClass}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={banner.id} className={commonClass}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matches Section - Hidden on Mobile */}
          <div className="hidden md:block md:col-span-3 matches-section">
            <div className="matches-container p-4" style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333'
            }}>
              <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid #333' }}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" style={{ color: '#888' }} />
                  <h2 className="text-base font-semibold" style={{ color: '#ddd' }}>Günün Maçları</h2>
                </div>
                <button 
                  onClick={toggleMultiScreen}
                  className="px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors"
                  style={{ 
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #444'
                  }}
                >
                  <Layers className="h-3 w-3" />
                  {isMultiScreen ? 'Tek Ekran' : 'Çoklu Ekran'}
                </button>
              </div>

              <div className="max-h-[40vh] overflow-y-auto pr-2" id="desktop-matches">
                {matches.map((match, index) => (
                  <div 
                    key={index} 
                    onClick={() => loadMobileChannel(match.channelId)}
                    className="px-3 py-2.5 mb-2 cursor-pointer transition-all"
                    style={{
                      backgroundColor: (isMultiScreen && activeChannels.includes(match.channelId)) || (!isMultiScreen && match.channelId === currentChannel)
                        ? '#333' 
                        : '#252525',
                      borderLeft: (isMultiScreen && activeChannels.includes(match.channelId)) || (!isMultiScreen && match.channelId === currentChannel)
                        ? '3px solid #666'
                        : '3px solid transparent',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      borderRadius: '4px',
                      border: '1px solid #333'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{match.teams}</span>
                      <span style={{ color: '#777', fontSize: '14px', marginLeft: '16px' }}>{match.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Minimal Footer */}
      <footer className="w-full py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm" style={{ color: '#ffffff' }}>2025 @ FutSmart</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            (sessionStorage.getItem('adminAuth') === 'true')
              ? <AdminDashboard />
              : <Navigate to="/admin" replace />
          }
        />
        <Route
          path="/dashboard"
          element={
            (sessionStorage.getItem('adminAuth') === 'true')
              ? <AdminDashboard />
              : <Navigate to="/admin" replace />
          }
        />
        {/* Backward compatibility for old typo routes */}
        <Route path="/amdin" element={<Navigate to="/admin" replace />} />
        <Route path="/amdin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/" element={<MainContent />} />
      </Routes>
    </Router>
  );
}

export default App;
