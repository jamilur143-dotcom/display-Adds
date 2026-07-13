import React from 'react';

const CampaignInfoCard = ({ meta, topic, iconLibrary = [] }) => {
  if (!meta) return null;

  const toolIcons = {
    figma: (
      <span className="tool-tag" key="figma" title="Figma">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8.5 12a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0-6A3.5 3.5 0 0 1 12 9.5V12H8.5A3.5 3.5 0 0 1 8.5 6zM15.5 12a3.5 3.5 0 1 1 3.5 3.5H15.5V12zm0-6a3.5 3.5 0 0 1 3.5 3.5V12h-3.5V6zM12 12h3.5v3.5A3.5 3.5 0 0 1 12 12.5V12z" fill="#F24E1E"/></svg>
        Figma
      </span>
    ),
    photoshop: (
      <span className="tool-tag" key="photoshop" title="Adobe Photoshop">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#001d3d" style={{ borderRadius: '3px' }}><rect width="24" height="24" fill="#001d3d"/><text x="12" y="16" fill="#31a8ff" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Ps</text></svg>
        Photoshop
      </span>
    ),
    aftereffects: (
      <span className="tool-tag" key="aftereffects" title="Adobe After Effects">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1b122c" style={{ borderRadius: '3px' }}><rect width="24" height="24" fill="#1b122c"/><text x="12" y="16" fill="#d19aff" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Ae</text></svg>
        After Effects
      </span>
    ),
    gwd: (
      <span className="tool-tag" key="gwd" title="Google Web Designer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1e293b" style={{ borderRadius: '3px' }}><rect width="24" height="24" fill="#1e293b"/><text x="12" y="15" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">GWD</text></svg>
        Web Designer
      </span>
    )
  };

  const renderedTools = (meta.tools || []).map(t => {
    if (toolIcons[t.toLowerCase()]) return toolIcons[t.toLowerCase()];
    const customIcon = iconLibrary.find(i => i.id === t);
    if (customIcon) {
      return (
        <span className="tool-tag custom-icon-tag" key={t} title={customIcon.name || "Custom Tool"} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <img src={customIcon.url} alt={customIcon.name || "Tool"} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          {customIcon.name}
        </span>
      );
    }
    return <span className="tool-tag" key={t}>{t}</span>;
  });

  return (
    <div className="banner-card campaign-info-card" style={{
      gridColumn: 'span 2', gridRow: 'span 1',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(8, 12, 20, 0.98))',
      border: '2px dashed var(--border-color)', borderRadius: 'var(--border-radius)',
      padding: '1.5rem 2rem', minHeight: '240px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        opacity: 0.5, pointerEvents: 'none'
      }} />

      {/* TOP SECTION: Topic Title & Tools Used */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, paddingRight: '1rem' }}>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Campaign</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#fff' }}>{topic}</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxWidth: '240px', justifyContent: 'flex-end' }}>
          {renderedTools}
        </div>
      </div>

      {/* MIDDLE SECTION: Description */}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {meta.description || 'No description provided for this campaign.'}
      </p>

      {/* BOTTOM SECTION: Client Name & Campaign Year */}
      {(meta.client || meta.year) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: 0.6, marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          {meta.client && (
            <div>
              <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', color: '#fff' }}>Client</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{meta.client}</span>
            </div>
          )}
          {meta.year && (
            <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', color: '#fff' }}>Year</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{meta.year}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignInfoCard;
