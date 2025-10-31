import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AnnouncementSlider: React.FC = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false,
    pauseOnHover: true
  };

  const announcements = [
    {
      text: (
        <>
          <strong>FutSmart</strong> güncel adres duyuruları bu sayfadan yapılır. Bir sonraki adresimiz <strong>xxx.com</strong> olacaktır.
        </>
      )
    },
    {
      text: (
        <>
          Duyurular ve iletişim için <a href="https://t.me/fsreklam" target="_blank" rel="noopener"><strong>Telegram</strong></a> kanalımızı takip edin.
        </>
      )
    }
  ];

  return (
    <div className="slick-list announcement-slider-container">
      <Slider {...settings}>
        {announcements.map((announcement, index) => (
          <div key={index} className="slick-slide">
            <div>
              <div className="tb--announcement-item tb--flex items-center justify-center" style={{ width: '100%', display: 'inline-flex' }}>
                <img src="/bildirim.png" alt="Bildirim" className="announcement-icon" />
                <span className="tb--announcement-item_text ml-2">{announcement.text}</span>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};



export default AnnouncementSlider; 