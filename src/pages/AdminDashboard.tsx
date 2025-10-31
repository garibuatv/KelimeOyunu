import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchStore } from '../store/matchStore';
import { saveBannerConfig, listenBannerConfig } from '../services/bannerService';
import { Save, LogOut, Image, Link as LinkIcon, Layout, Calendar, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { matches, banners, sideBanners, topBanner, settings, setMatches, updateMatch, updateBanner, updateSideBanner, updateTopBanner, updateSettings } = useMatchStore();
  const [editedMatches, setEditedMatches] = useState(matches);
  const [editedBanners, setEditedBanners] = useState(banners);
  const [editedLeftBanner, setEditedLeftBanner] = useState(sideBanners[0] || { id: 1, imageUrl: '', link: '' });
  const [editedTopBanner, setEditedTopBanner] = useState(topBanner);
  const [editedSettings, setEditedSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    setEditedMatches(matches);
  }, [matches]);

  useEffect(() => {
    setEditedBanners(banners);
  }, [banners]);

  useEffect(() => {
    setEditedLeftBanner(sideBanners[0] || { id: 1, imageUrl: '', link: '' });
  }, [sideBanners]);

  useEffect(() => {
    setEditedTopBanner(topBanner);
  }, [topBanner]);

  useEffect(() => {
    setEditedSettings(settings);
  }, [settings]);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  // Firestore'daki mevcut konfigürasyonu çek ve forma doldur
  useEffect(() => {
    const unsub = listenBannerConfig((cfg) => {
      if (cfg.topBanner) setEditedTopBanner(cfg.topBanner);
      if (cfg.leftBanner) setEditedLeftBanner(cfg.leftBanner);
      if (cfg.banners) setEditedBanners(cfg.banners);
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleChange = (index: number, field: keyof typeof matches[0], value: string | boolean) => {
    const newMatches = [...editedMatches];
    newMatches[index] = { ...newMatches[index], [field]: value };
    setEditedMatches(newMatches);
  };

  const handleBannerChange = (id: number, field: 'imageUrl' | 'link' | 'hidden', value: any) => {
    setEditedBanners(editedBanners.map(banner => 
      banner.id === id ? { ...banner, [field]: value } : banner
    ));
  };


  const handleTopBannerChange = (field: 'imageUrl' | 'link', value: string) => {
    setEditedTopBanner({ ...editedTopBanner, [field]: value });
  };

  const handleSettingsChange = (field: keyof typeof settings, value: string) => {
    setEditedSettings({ ...editedSettings, [field]: value });
  };

  const showNotification = (message: string, elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const notification = document.createElement('div');
      notification.className = 'text-green-400 text-sm mt-2 animate-fade-in-out';
      notification.textContent = message;
      element.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  const handleSave = (index: number) => {
    updateMatch(index, editedMatches[index]);
    showNotification('Maç bilgileri kaydedildi!', `match-notification-${index}`);
  };

  const handleAddMatch = () => {
    const newMatch = {
      time: '20:00',
      teams: 'Ev Sahibi - Deplasman',
      channelId: '',
      isLive: false,
      event: 'Futbol'
    } as typeof matches[number];
    const next = [...editedMatches, newMatch];
    setEditedMatches(next);
    setMatches(next);
  };

  const handleDeleteMatch = (index: number) => {
    const next = editedMatches.filter((_, i) => i !== index);
    setEditedMatches(next);
    setMatches(next);
    showNotification('Maç silindi!', `match-notification-${index}`);
  };

  const persistBannerConfig = async () => {
    await saveBannerConfig({
      topBanner: editedTopBanner,
      leftBanner: editedLeftBanner,
      banners: editedBanners,
    });
  };

  const handleBannerSave = (id: number) => {
    const banner = editedBanners.find(b => b.id === id);
    if (banner) {
      updateBanner(id, banner.imageUrl, banner.link, banner.hidden);
      persistBannerConfig();
      showNotification('Banner güncellendi!', `banner-notification-${id}`);
    }
  };

  const handleLeftBannerSave = () => {
    updateSideBanner(editedLeftBanner.id, editedLeftBanner.imageUrl, editedLeftBanner.link, editedLeftBanner.hidden);
    persistBannerConfig();
    showNotification('Sol banner güncellendi!', `left-banner-notification`);
  };

  const handleTopBannerSave = () => {
    updateTopBanner(editedTopBanner.imageUrl, editedTopBanner.link, editedTopBanner.hidden);
    persistBannerConfig();
    showNotification('Üst banner güncellendi!', 'top-banner-notification');
  };

  const handleSettingsSave = () => {
    updateSettings(editedSettings);
    showNotification('Ayarlar güncellendi!', 'settings-notification');
  };

  return (
    <div className="min-h-screen bg-[#0d0f1d]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Yönetim Paneli</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'matches'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Maç Yönetimi
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'banners'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Layout className="h-4 w-4" />
            Banner Yönetimi
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Settings className="h-4 w-4" />
            Ayarlar
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === 'matches' && (
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleAddMatch}
                className="flex items-center gap-2 bg-green-600/30 hover:bg-green-600/40 text-green-300 px-4 py-2 rounded-lg transition-all"
              >
                + Maç Ekle
              </button>
              <div className="text-xs text-gray-400">Toplam: {editedMatches.length}</div>
            </div>
            {editedMatches.map((match, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6 border border-purple-500/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-1">Maç Saati</label>
                      <input
                        type="text"
                        value={match.time}
                        onChange={(e) => handleChange(index, 'time', e.target.value)}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                        placeholder="23:30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-1">Takımlar</label>
                      <input
                        type="text"
                        value={match.teams}
                        onChange={(e) => handleChange(index, 'teams', e.target.value)}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                        placeholder="Örn: Real Madrid - Barcelona"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-1">Kanal ID</label>
                      <input
                        type="text"
                        value={match.channelId}
                        onChange={(e) => handleChange(index, 'channelId', e.target.value)}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                      />
                    </div>
                    {/* Canlı yayın tiki kaldırıldı */}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteMatch(index)}
                      className="mr-2 flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all"
                    >
                      Sil
                    </button>
                    <button
                      onClick={() => handleSave(index)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Kaydet
                    </button>
                  </div>
                  <div id={`match-notification-${index}`}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="grid gap-6">
            {/* Top Banner Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Üst Banner</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Image className="h-6 w-6 text-purple-400" />
                  <input
                    type="text"
                    value={editedTopBanner.imageUrl}
                    onChange={(e) => handleTopBannerChange('imageUrl', e.target.value)}
                    className="flex-1 bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                    placeholder="Banner görsel URL'si"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <LinkIcon className="h-6 w-6 text-purple-400" />
                  <input
                    type="text"
                    value={editedTopBanner.link}
                    onChange={(e) => handleTopBannerChange('link', e.target.value)}
                    className="flex-1 bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                    placeholder="Banner link URL'si"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!editedTopBanner.hidden}
                      onChange={(e) => setEditedTopBanner({ ...editedTopBanner, hidden: e.target.checked })}
                    />
                    Gizle
                  </label>
                  {editedTopBanner.hidden && <span className="text-xs text-yellow-300">Gizlendi</span>}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleTopBannerSave}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    <Save className="h-4 w-4" />
                    Kaydet
                  </button>
                </div>
                <div id="top-banner-notification"></div>
                <img
                  src={editedTopBanner.imageUrl || '/%C3%BCstbanner.jpg'}
                  alt="Top Banner Preview"
                  className="w-full h-32 object-contain rounded-lg mt-4"
                />
              </div>
            </div>

            {/* Left Banner Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Sol Banner</h2>
              <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image className="h-6 w-6 text-purple-400" />
                  <input
                    type="text"
                    value={editedLeftBanner.imageUrl}
                    onChange={(e) => setEditedLeftBanner({ ...editedLeftBanner, imageUrl: e.target.value })}
                    className="flex-1 bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                    placeholder="Sol banner görsel URL'si (örn: http://localhost:5173/SolBanner.jpg)"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <LinkIcon className="h-6 w-6 text-purple-400" />
                  <input
                    type="text"
                    value={editedLeftBanner.link}
                    onChange={(e) => setEditedLeftBanner({ ...editedLeftBanner, link: e.target.value })}
                    className="flex-1 bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                    placeholder="Sol banner link URL'si"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!editedLeftBanner.hidden}
                      onChange={(e) => setEditedLeftBanner({ ...editedLeftBanner, hidden: e.target.checked })}
                    />
                    Gizle
                  </label>
                  {editedLeftBanner.hidden && <span className="text-xs text-yellow-300">Gizlendi</span>}
                </div>
                <button
                  onClick={handleLeftBannerSave}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </button>
                <img src={editedLeftBanner.imageUrl} alt={`Sol Banner`} className="w-full h-32 object-contain rounded-lg" />
                <div id={`left-banner-notification`}></div>
              </div>
            </div>

            {/* Bottom Banners Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Alt Bannerlar</h2>
              <div className="grid gap-6">
                {editedBanners.map((banner) => (
                  <div key={banner.id} className="space-y-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Image className="h-6 w-6 text-purple-400" />
                      <input
                        type="text"
                        value={banner.imageUrl}
                        onChange={(e) => handleBannerChange(banner.id, 'imageUrl', e.target.value)}
                        className="flex-1 bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                        placeholder="Banner görsel URL'si"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <LinkIcon className="h-6 w-6 text-purple-400" />
                      <input
                        type="text"
                        value={banner.link}
                        onChange={(e) => handleBannerChange(banner.id, 'link', e.target.value)}
                        className="flex-1 bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                        placeholder="Banner link URL'si"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-300 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!banner.hidden}
                          onChange={(e) => handleBannerChange(banner.id, 'hidden', e.target.checked)}
                        />
                        Gizle
                      </label>
                      {banner.hidden && <span className="text-xs text-yellow-300">Gizlendi</span>}
                    </div>
                    <button
                      onClick={() => handleBannerSave(banner.id)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Kaydet
                    </button>
                    <img src={banner.imageUrl} alt={`Banner ${banner.id}`} className="w-full h-32 object-contain rounded-lg" />
                    <div id={`banner-notification-${banner.id}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/5 rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-6">Sistem Ayarları</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Yayın Domain Adresi</label>
                <input
                  type="text"
                  value={editedSettings.streamDomain}
                  onChange={(e) => handleSettingsChange('streamDomain', e.target.value)}
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white mb-4"
                  placeholder="Örn: cenatv12.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Video Player URL (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={editedSettings.videoPlayerUrl}
                  onChange={(e) => handleSettingsChange('videoPlayerUrl', e.target.value)}
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-2 px-3 text-white"
                  placeholder="Örn: https://example.com/player"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Not: Video Player URL girilirse, yayınlar bu URL üzerinden gösterilecektir. Boş bırakılırsa varsayılan domain kullanılır.
                </p>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSettingsSave}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </button>
              </div>
              <div id="settings-notification"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}