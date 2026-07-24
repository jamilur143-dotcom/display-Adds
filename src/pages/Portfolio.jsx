import React, { useState, useEffect, Suspense } from 'react';
import { getStoredData, AD_SIZES } from '../data/mockData';
import { syncPortfolioData, logVisit, saveLead } from '../firebase';
import CampaignInfoCard from '../components/CampaignInfoCard';

const resolveMedia = (item) => {
  if (!item || !item.url) return { type: 'unknown', url: '' };
  const url = item.url;
  
  if (url.startsWith('data:video/')) return { type: 'video', url };
  if (url.startsWith('data:image/')) return { type: 'image', url };
  
  // YouTube
  const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = url.match(ytReg);
  if (ytMatch) {
    return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}` };
  }
  
  // Google Drive
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const gdReg = /\/file\/d\/([^\/&\?]+)|[?&]id=([^\/&\?]+)/;
    const gdMatch = url.match(gdReg);
    if (gdMatch) {
      const fileId = gdMatch[1] || gdMatch[2];
      const timeParam = item.updatedAt ? `&t=${item.updatedAt}` : '';
      let gdUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      if (item.updatedAt) gdUrl += `?t=${item.updatedAt}`;
      return { 
        type: 'gdrive', 
        url: gdUrl,
        imageUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000${timeParam}`,
        directUrl: `https://drive.google.com/uc?export=download&id=${fileId}${timeParam}`
      };
    }
  }
  
  const urlWithoutQuery = url.split('?')[0];
  if (/\.(mp4|webm|ogg)$/i.test(urlWithoutQuery)) {
    return { type: 'video', url };
  }
  
  return { type: 'image', url };
};

// ── Google Drive Asset Component ──
const GDriveAsset = ({ media, title, style, ...rest }) => {
  const [useIframe, setUseIframe] = useState(false);

  if (useIframe) {
    return (
      <iframe 
        src={media.url} 
        title={title} 
        style={{ 
          ...style, 
          border: 'none', 
          pointerEvents: 'none',
          width: style?.width || '100%',
          height: style?.height || '100%'
        }}
        allow="autoplay"
        loading="lazy"
        {...rest}
      />
    );
  }

  return (
    <img 
      src={media.imageUrl} 
      alt={title} 
      style={{ 
        ...style, 
        objectFit: style?.objectFit || 'contain'
      }}
      onError={() => setUseIframe(true)}
      {...rest}
    />
  );
};

// ── Zoom Modal ─────────────────────────────────────────────────────────────
const ZoomModal = ({ item, onClose }) => {
  const [scale, setScale] = useState(1.2);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const media = resolveMedia(item);

  useEffect(() => {
    if (item) {
      setScale(1.2); // Start slightly larger
      setPosition({ x: 0, y: 0 });
      setIframeLoaded(false);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [item]);

  // Global mousemove and mouseup listeners for robust dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!item) return null;

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const newScale = Math.min(Math.max(scale + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed), 0.5), 6);
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  return (
    <div 
      className="zoom-modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }} 
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', overflow: 'hidden'
      }}
    >
      {/* Close button */}
      <button onClick={onClose} style={{
        position: 'absolute', top: '24px', right: '32px', color: '#fff', fontSize: '2.5rem',
        background: 'none', border: 'none', cursor: 'pointer', zIndex: 10000, opacity: 0.8,
        transition: 'opacity 0.2s', fontFamily: 'inherit'
      }}>
        ×
      </button>

      {/* Helper instructions */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        color: '#94a3b8', fontSize: '0.82rem', background: 'rgba(17,24,39,0.85)',
        padding: '8px 16px', borderRadius: '20px', pointerEvents: 'none', zIndex: 10000,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        🖱️ Scroll to Zoom | 🖐️ Drag to Pan | Double-Click to Reset
      </div>

      <div 
        style={{
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100vw', height: '100vh'
        }}
        onWheel={handleWheel}
      >
        {item && item.type === 'html5' ? (
          <>
            {!iframeLoaded && (
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#60a5fa', gap: '12px', zIndex: 10001 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin-anim">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                <div style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.5px' }}>Loading Interactive Ad</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Please wait a few seconds...</div>
                <style>{`
                  @keyframes spin { 100% { transform: rotate(360deg); } }
                  .spin-anim { animation: spin 1s linear infinite; }
                `}</style>
              </div>
            )}
            <iframe
              src={item.url}
              title={item.adSize}
              onLoad={() => setTimeout(() => setIframeLoaded(true), 1200)}
              style={{
                width: item.width, height: item.height,
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                border: 'none', background: 'white',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7)', borderRadius: '4px',
                opacity: iframeLoaded ? 1 : 0
              }}
            />
            {/* Always show a small hint at the bottom for HTML5 ads */}
            <div style={{
              position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
              color: '#64748b', fontSize: '0.75rem', zIndex: 10000, pointerEvents: 'none'
            }}>
              Interactive HTML5 Ad - Please hold on a few seconds if it feels slow
            </div>
          </>
        ) : media.type === 'youtube' ? (
          <iframe 
            src={media.url} 
            title={item.title} 
            style={{
              width: item.width || 640, height: item.height || 360,
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              border: 'none', background: 'transparent',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)', borderRadius: '4px',
            }}
          />
        ) : media.type === 'gdrive' ? (
          <GDriveAsset 
            media={media} 
            title="Zoomed Asset"
            onMouseDown={handleMouseDown}
            style={{
              width: item.width || 800, height: item.height || 600,
              maxWidth: '90vw', maxHeight: '90vh',
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)', borderRadius: '4px',
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
          />
        ) : media.type === 'video' ? (
          <video 
            src={media.url} 
            autoPlay loop muted playsInline
            onMouseDown={handleMouseDown}
            style={{
              maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)', borderRadius: '4px',
              userSelect: 'none', WebkitUserDrag: 'none'
            }}
          />
        ) : item && item.url ? (
          <img 
            src={item.url} 
            alt="Zoomed Asset" 
            draggable="false"
            onMouseDown={handleMouseDown}
            onDoubleClick={() => { setScale(1.2); setPosition({ x: 0, y: 0 }); }}
            style={{
              maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)', borderRadius: '4px',
              userSelect: 'none', WebkitUserDrag: 'none'
            }} 
          />
        ) : null}
      </div>
    </div>
  );
};

const LazyMedia = React.lazy(() => import('../components/MediaAsset'));

// CampaignInfoCard moved to src/components/CampaignInfoCard.jsx

// ── Helpers ────────────────────────────────────────────────────────────────
// Scale ad dimensions to fit inside the parent container based on Bento spans
function scaleSize(w, h, sizeType) {
  let maxW = 280; // Standard 1-column span
  let maxH = 170; // Standard 1-row span

  if (sizeType === 'horizontal' || sizeType === 'leaderboard' || sizeType === 'billboard') {
    maxW = 560; // 2-column span
    maxH = 170;
  } else if (sizeType === 'vertical' || sizeType === 'skyscraper') {
    maxW = 280;
    maxH = 430; // 2-row span
  }

  let sw = w, sh = h;
  if (sw > maxW) { sh = Math.round(sh * maxW / sw); sw = maxW; }
  if (sh > maxH) { sw = Math.round(sw * maxH / sh); sh = maxH; }

  const MIN_W = 90;
  if (sw < MIN_W) { sh = Math.round(sh * MIN_W / sw); sw = MIN_W; }
  
  return { sw, sh };
}

// ── Ad size badge colours ──────────────────────────────────────────────────
const TYPE_COLORS = {
  square:      '#007AFF',
  vertical:    '#6c63ff',
  skyscraper:  '#9333ea',
  horizontal:  '#0ea5e9',
  leaderboard: '#f59e0b',
  billboard:   '#ef4444',
};

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ categories, active, onSelect }) => (
  <aside className="sidebar">
    <div className="sidebar-title">Category</div>
    {['All', ...categories.filter(c => c !== 'All')].map(cat => (
      <button
        key={cat}
        className={`filter-btn ${active === cat ? 'active' : ''}`}
        onClick={() => onSelect(cat)}
      >
        <span className="filter-dot" />
        {cat}
      </button>
    ))}
    <div className="sidebar-title" style={{ marginTop: '2rem' }}>Jump to</div>
    {[
      { id: 'static-assets',    label: '01 Static' },
      { id: 'gif-banners',      label: '02 GIF Banners' },
      { id: 'html5-ads',        label: '03 HTML5 Ads' },
    ].map(({ id, label }) => (
      <button
        key={id}
        className="filter-btn"
        onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
      >
        {label}
      </button>
    ))}
  </aside>
);

// ── Section header ─────────────────────────────────────────────────────────
const SectionHeader = ({ number, title, count, activeCategory }) => (
  <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
    {/* Left Side: Campaign / Topic Info (Big, highlighted) */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-color)', letterSpacing: '1px' }}>
        {number}
      </span>
      <div style={{ fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Topic:</span>
        <span style={{ 
          background: 'linear-gradient(135deg, #00d2ff, #007AFF)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(0,122,255,0.2)'
        }}>
          {activeCategory === 'All' ? 'All Campaigns' : activeCategory}
        </span>
      </div>
    </div>

    {/* Center Divider line */}
    <div className="section-divider" style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-color), transparent)', margin: '0 2rem' }} />

    {/* Right Side: Section Title and Size Count (Muted, professional) */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.0rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
        {title}
      </h2>
      <span className="section-count" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>{count} sizes</span>
    </div>
  </div>
);

// ── Ad size label tag ──────────────────────────────────────────────────────
const SizeTag = ({ item }) => {
  const color = TYPE_COLORS[item.sizeType] || '#007AFF';
  return (
    <span className="size-tag" style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
      {item.adSize}
    </span>
  );
};

// ── Static Banner Card ─────────────────────────────────────────────────────
const StaticBannerCard = ({ item, onZoom }) => {
  const { sw, sh } = scaleSize(item.width, item.height, item.sizeType);
  const color = TYPE_COLORS[item.sizeType] || '#007AFF';
  const media = resolveMedia(item);

  return (
    <div className={`banner-card span-${item.sizeType}`}>
      {/* scaled banner preview */}
      <div className="banner-preview-area" style={{ position: 'relative' }}>
        <div
          className="banner-box static-banner-box"
          style={{ width: sw, height: sh, borderColor: item.url ? 'transparent' : color + '55',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}
          onClick={() => item.url && onZoom(item)}
        >
          {item.url && media.type === 'youtube' && (
            <iframe src={media.url} title={item.title} style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
          )}
          {item.url && media.type === 'video' && (
            <video src={media.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {item.url && media.type === 'image' && (
            <img src={media.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {item.url && media.type === 'gdrive' && (
            <GDriveAsset media={media} title={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} isMotion={false} />
          )}
          {!item.url && (
            <>
              <span className="banner-size-text" style={{ color }}>{item.adSize}</span>
              <span className="banner-type-text">{item.sizeType}</span>
            </>
          )}
        </div>
        {item.url && (
          <div 
            className="zoom-icon-btn" 
            onClick={(e) => { e.stopPropagation(); onZoom(item); }}
            title="Zoom Image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        )}
      </div>
      {/* info row */}
      <div className="banner-info">
        <SizeTag item={item} />
        <span className="banner-cat">{item.category}</span>
        <span className="banner-weight">{item.weight} KB</span>
      </div>
      {/* hover overlay */}
      <div className="tech-overlay">
        <div className="tech-row"><span className="tech-label">Tools</span><span className="tech-value">{item.tools}</span></div>
        <div className="tech-row"><span className="tech-label">Dimensions</span><span className="tech-value">{item.width} × {item.height} px</span></div>
        <div className="tech-row"><span className="tech-label">Weight</span><span className="tech-value accent">{item.weight} KB</span></div>
      </div>
    </div>
  );
};

// ── GIF Banner Card ────────────────────────────────────────────────────────
const GifBannerCard = ({ item, onZoom }) => {
  const { sw, sh } = scaleSize(item.width, item.height, item.sizeType);
  const color = TYPE_COLORS[item.sizeType] || '#6c63ff';
  const media = resolveMedia(item);

  return (
    <div className={`banner-card span-${item.sizeType}`}>
      <div className="banner-preview-area" style={{ position: 'relative' }}>
        <div
          className="banner-box gif-banner-box"
          style={{ width: sw, height: sh, borderColor: item.url ? 'transparent' : color + '77',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}
          onClick={() => item.url && onZoom(item)}
        >
          {item.url && media.type === 'youtube' && (
            <iframe src={media.url} title={item.title} style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
          )}
          {item.url && media.type === 'video' && (
            <video src={media.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {item.url && media.type === 'image' && (
            <img src={media.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {item.url && media.type === 'gdrive' && (
            <GDriveAsset media={media} title={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} isMotion={true} />
          )}
          {!item.url && <div className="gif-shimmer" />}
          {!item.url && <span className="banner-size-text" style={{ color, position: 'relative', zIndex: 1 }}>{item.adSize}</span>}
          {!item.url && <span className="banner-type-text" style={{ position: 'relative', zIndex: 1 }}>GIF Animated</span>}
        </div>
        {item.url && (
          <div 
            className="zoom-icon-btn" 
            onClick={(e) => { e.stopPropagation(); onZoom(item); }}
            title="Zoom Image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        )}
      </div>
      <div className="banner-info">
        <SizeTag item={item} />
        <span className="banner-cat">{item.category}</span>
        <span className="banner-weight">{item.weight} KB</span>
      </div>
      <div className="tech-overlay">
        <div className="tech-row"><span className="tech-label">Tools</span><span className="tech-value">{item.tools}</span></div>
        <div className="tech-row"><span className="tech-label">Dimensions</span><span className="tech-value">{item.width} × {item.height} px</span></div>
        <div className="tech-row"><span className="tech-label">File Weight</span><span className="tech-value accent">{item.weight} KB</span></div>
      </div>
    </div>
  );
};

// ── HTML5 Ad Card ──────────────────────────────────────────────────────────
const Html5AdCard = ({ item, onZoom }) => {
  const { sw, sh } = scaleSize(item.width, item.height, item.sizeType);
  const color = TYPE_COLORS[item.sizeType] || '#ef4444';
  const [isInView, setIsInView] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    // Restart animation by changing key on hover
    setReloadKey(prev => prev + 1);
  };

  return (
    <div className={`banner-card span-${item.sizeType}`} onMouseEnter={handleMouseEnter} ref={containerRef}>
      <div className="banner-preview-area">
        <div
          className="banner-box html5-banner-box"
          style={{ width: sw, height: sh, borderColor: color + '77', cursor: item.url ? 'pointer' : 'default' }}
          onClick={() => item.url && onZoom(item)}
        >
          {isInView && item.url ? (
            <iframe
              key={reloadKey}
              className="ad-iframe"
              src={item.url && item.url.length > 3 ? item.url : "about:blank"}
              title={item.adSize}
              style={{ width: item.width, height: item.height, transform: `scale(${sw / item.width})`, transformOrigin: 'top left', border: 'none' }}
            />
          ) : (
            <div className="gif-shimmer" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="banner-size-text" style={{ color: 'var(--text-secondary)' }}>Loading Ad...</span>
            </div>
          )}
          <div className="html5-label-overlay" style={{ display: item.url ? 'none' : 'flex' }}>
            <span style={{ color }}>HTML5</span>
            <span className="banner-size-text" style={{ color }}>{item.adSize}</span>
          </div>
        </div>
        {item.url && (
          <div 
            className="zoom-icon-btn" 
            onClick={(e) => { e.stopPropagation(); onZoom(item); }}
            title="View Full Ad"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        )}
      </div>
      <div className="banner-info">
        <SizeTag item={item} />
        <span className="banner-cat">{item.category}</span>
        <span className="banner-weight">{item.weight} KB</span>
      </div>
      <div className="tech-overlay">
        <div className="tech-row"><span className="tech-label">Tools</span><span className="tech-value">{item.tools}</span></div>
        <div className="tech-row"><span className="tech-label">Dimensions</span><span className="tech-value">{item.width} × {item.height} px</span></div>
        <div className="tech-row"><span className="tech-label">File Weight</span><span className="tech-value accent">{item.weight} KB</span></div>
      </div>
    </div>
  );
};

// ── Banners grid ───────────────────────────────────────────────────────────
const BannersGrid = ({ items, CardComponent, categoryMeta, activeCategory, iconLibrary = [], extraProps = {} }) => {
  const sortedSizes = [...AD_SIZES].sort((a, b) => {
    const order = {
      'vertical': 1,
      'skyscraper': 1,
      'billboard': 2,
      'leaderboard': 2,
      'horizontal': 2,
      'square': 3
    };
    return (order[a.type] || 99) - (order[b.type] || 99);
  });

  return (
    <div className="banners-grid">
      {sortedSizes.map(sizeDef => {
        // Find if user uploaded an item for this specific size
        const matchedItems = items.filter(i => i.adSize === sizeDef.label);
        // Prefer an item that has a valid url (in case "All" view merges multiple categories)
        const matchedItem = matchedItems.find(i => i.url) || matchedItems[0];
        
        // If matched, use it. Otherwise, create a placeholder using the size definition
        const displayItem = matchedItem || {
          id: `placeholder-${sizeDef.id}`,
          title: 'Empty Slot',
          category: 'No Category',
          adSize: sizeDef.label,
          width: sizeDef.width,
          height: sizeDef.height,
          sizeType: sizeDef.type,
          weight: 0,
          url: null,
          tools: 'N/A'
        };

        return <CardComponent key={sizeDef.id} item={displayItem} {...extraProps} />;
      })}
      {/* Render CampaignInfoCard back at the bottom right of the grid */}
      <CampaignInfoCard 
        meta={categoryMeta || (activeCategory === 'All' ? {
          description: "An overview of all my display ad campaigns, showcasing static designs, animated GIFs, and interactive HTML5 ads.",
          client: "Various Clients",
          year: "2026",
          tools: []
        } : null)} 
        topic={activeCategory} 
        iconLibrary={iconLibrary} 
      />
    </div>
  );
};

// ── Portfolio page ─────────────────────────────────────────────────────────
const Portfolio = () => {
  const [data, setData]               = useState(null);
  const [activeCategory, setCategory] = useState('All');
  const [zoomedItem, setZoomedItem] = useState(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setContactStatus('sending');

    // 1. Save lead to Firebase for Dashboard Overview
    const success = await saveLead(contactForm);

    // 2. Send direct email notification to dotzmatrix5@gmail.com
    try {
      await fetch("https://formsubmit.co/ajax/dotzmatrix5@gmail.com", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `New Portfolio Lead: ${contactForm.name}`,
          Name: contactForm.name,
          Email: contactForm.email,
          Message: contactForm.message || "No message provided",
          _captcha: "false"
        })
      });
    } catch (emailErr) {
      console.error("Email notification error:", emailErr);
    }

    if (success) {
      setContactStatus('sent');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactStatus(''), 4000);
    } else {
      setContactStatus('error');
    }
  };

  useEffect(() => {
    const unsubscribe = syncPortfolioData((firestoreData) => {
      if (firestoreData) {
        setData(firestoreData);
      } else {
        setData(getStoredData());
      }
    });

    // Log visitor analytics
    logVisit();

    return () => unsubscribe();
  }, []);

  // Sync all GIF animations to play at the exact same time
  useEffect(() => {
    const syncGifs = () => {
      const gifElements = document.querySelectorAll('.gif-banner-box img');
      gifElements.forEach(img => {
        const src = img.src;
        if (src && !src.startsWith('data:')) {
          img.src = '';
          img.src = src;
        }
      });
    };

    // Run sync after a short delay to allow images to load and mount
    const timeoutId = setTimeout(syncGifs, 600);

    // Periodically re-sync every 15 seconds to prevent browser render drift
    const intervalId = setInterval(syncGifs, 15000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [activeCategory, data]);
  
  if (!data) return null;

  const filter = arr =>
    activeCategory === 'All' ? arr : arr.filter(i => i.category === activeCategory);

  const staticItems = filter(data.staticAssets).map(i => ({ ...i, type: i.type || 'static' }));
  const gifItems    = filter(data.motionGraphics).map(i => ({ ...i, type: i.type || 'gif' }));
  const html5Items  = filter(data.html5Ads).map(i => ({ ...i, type: i.type || 'html5' }));

  const customCats = (data.categories || []).filter(c => c !== 'All');
  const resolvedCategory = activeCategory === 'All'
    ? (customCats.length === 1 ? customCats[0] : 'All')
    : activeCategory;

  const getMeta = (catData, tab) => {
    if (!catData) return null;
    return (catData.staticAssets || catData.motionGraphics || catData.html5Ads)
      ? catData[tab]
      : catData;
  };

  return (
    <div className="portfolio-layout">
      <Sidebar
        categories={data.categories || []}
        active={activeCategory}
        onSelect={setCategory}
      />

      <div className="portfolio-main">
        <ZoomModal item={zoomedItem} onClose={() => setZoomedItem(null)} />
        
        {/* ─── 01 Static Design Assets ─── */}
        <section className="portfolio-section" id="static-assets">
          <SectionHeader number="01" title="Static Design Assets" count={staticItems.length} activeCategory={resolvedCategory} />
          <BannersGrid items={staticItems} CardComponent={StaticBannerCard} categoryMeta={getMeta(data.categoryMeta?.[resolvedCategory], 'staticAssets')} activeCategory={resolvedCategory} iconLibrary={data.iconLibrary} extraProps={{ onZoom: setZoomedItem }} />
        </section>

        {/* ─── 02 GIF / Animated Banners ─── */}
        <section className="portfolio-section" id="gif-banners">
          <SectionHeader number="02" title="GIF / Animated Banners" count={gifItems.length} activeCategory={resolvedCategory} />
          <BannersGrid items={gifItems} CardComponent={GifBannerCard} categoryMeta={getMeta(data.categoryMeta?.[resolvedCategory], 'motionGraphics')} activeCategory={resolvedCategory} iconLibrary={data.iconLibrary} extraProps={{ onZoom: setZoomedItem }} />
        </section>

        {/* ─── 03 HTML5 Interactive Ads ─── */}
        <section className="portfolio-section" id="html5-ads">
          <SectionHeader number="03" title="HTML5 Interactive Ads" count={html5Items.length} activeCategory={resolvedCategory} />
          <BannersGrid items={html5Items} CardComponent={Html5AdCard} categoryMeta={getMeta(data.categoryMeta?.[resolvedCategory], 'html5Ads')} activeCategory={resolvedCategory} iconLibrary={data.iconLibrary} extraProps={{ onZoom: setZoomedItem }} />
        </section>

        {/* ─── Contact Form for Lead Capture ─── */}
        <section className="portfolio-section contact-section" id="contact" style={{ marginTop: '4rem', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
          
          {/* Left Column: Form */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Get in Touch</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Interested in working together? Drop your email and we will get back to you.</p>
            
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input type="text" placeholder="Your Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input type="email" placeholder="Your Email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} required style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <textarea placeholder="Message (Optional)" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} rows="4" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', resize: 'vertical', boxSizing: 'border-box' }} />
              
              <button type="submit" className="btn-primary" disabled={contactStatus === 'sending'} style={{ padding: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {contactStatus === 'sending' ? 'Sending...' : contactStatus === 'sent' ? 'Sent Successfully!' : 'Send Message'}
                {contactStatus !== 'sending' && contactStatus !== 'sent' && (
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                )}
              </button>
              {contactStatus === 'error' && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Error sending message. Try again.</span>}
            </form>
          </div>

          {/* Right Column: Image */}
          <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '300px' }}>
            <img src="/contact_illustration.jpg" alt="Creative Display Ads Agency" style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Portfolio;
