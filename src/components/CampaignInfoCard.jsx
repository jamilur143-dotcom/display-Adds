import React from 'react';

const CampaignInfoCard = ({ meta, topic, iconLibrary = [] }) => {
  if (!meta) return null;

  const toolIcons = {
    figma: (
      <span className="tool-tag" key="figma" title="Figma">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8.5 12a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0-6A3.5 3.5 0 0 1 12 9.5V12H8.5A3.5 3.5 0 0 1 8.5 6zM15.5 12a3.5 3.5 0 1 1 3.5 3.5H15.5V12zm0-6a3.5 3.5 0 0 1 3.5 3.5V12h-3.5V6zM12 12h3.5v3.5A3.5 3.5 0 0 1 12 12.5V12z" fill="#F24E1E"/></svg>
        Figma
      </span>
    ),
    photoshop: (
      <span className="tool-tag" key="photoshop" title="Adobe Photoshop">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#001d3d" style={{ borderRadius: '3px' }}><rect width="24" height="24" fill="#001d3d"/><text x="12" y="16" fill="#31a8ff" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Ps</text></svg>
        Photoshop
      </span>
    ),
    illustrator: (
      <span className="tool-tag" key="illustrator" title="Adobe Illustrator">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#330000" style={{ borderRadius: '3px' }}><rect width="24" height="24" fill="#330000"/><text x="12" y="16" fill="#ff9a00" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Ai</text></svg>
        Illustrator
      </span>
    ),
    aftereffects: (
      <span className="tool-tag" key="aftereffects" title="Adobe After Effects">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1b122c" style={{ borderRadius: '3px' }}><rect width="24" height="24" fill="#1b122c"/><text x="12" y="16" fill="#d19aff" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Ae</text></svg>
        After Effects
      </span>
    ),
    dribbble: (
      <span className="tool-tag" key="dribbble" title="Dribbble">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ea4c89" style={{ borderRadius: '3px' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm8.44 9.1c-.6-1.55-2.07-2.67-3.8-2.9-1.3-.17-2.61.12-3.77.72-1.3.67-2.3 1.74-2.84 3.03l-1.07 2.45c-.4 1.05-1.2 1.9-2.2 2.38-1.5.72-3.23.47-4.48-.65-.67-.6-1.16-1.4-1.37-2.27-.15-.65-.13-1.32.06-1.95.23-.74.67-1.4 1.24-1.9.83-.75 1.95-1.12 3.08-1.02.94.08 1.83.47 2.5 1.1.58.55 1.03 1.25 1.3 2.02l.74-1.74c-.45-1.15-1.2-2.12-2.15-2.77-1.06-.72-2.37-1.03-3.66-.86-1.5.2-2.82 1.1-3.62 2.44C3.25 8.1 4.14 6 6.06 4.67 7.74 3.5 9.8 3.1 11.75 3.5c1.4.3 2.65 1.05 3.55 2.15.77.92 1.28 2.05 1.45 3.25.1.8-.02 1.63-.32 2.38l-1.06-2.4c-.43-1.08-1.16-2.03-2.12-2.73-1.2-.87-2.68-1.28-4.14-1.15-1.63.15-3.1 1.04-4.05 2.4-.73 1.03-1.1 2.3-.98 3.58.13 1.3.77 2.5 1.77 3.3 1.26 1 2.92 1.3 4.5.8 1.3-.43 2.38-1.43 2.95-2.68l.84-1.95c.34-.84.95-1.52 1.73-1.93 1.1-.6 2.38-.68 3.55-.24 1.08.4 2 1.15 2.62 2.1.33.5.58 1.05.7 1.65.13.7.12 1.4-.04 2.1-.2.83-.63 1.58-1.23 2.18-.9.9-2.12 1.44-3.4 1.53-1.1.07-2.17-.24-3.05-.86-.68-.48-1.23-1.13-1.58-1.9l-.66 1.53c.4 1.03 1.14 1.88 2.08 2.42 1.2.68 2.63.88 3.98.54 1.6-.4 2.97-1.5 3.73-3 .6-1.18.84-2.54.67-3.88-.12-1-.53-1.94-1.16-2.7z" fill="#fff"/></svg>
        Dribbble
      </span>
    ),
    behance: (
      <span className="tool-tag" key="behance" title="Behance">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#0057ff" style={{ borderRadius: '3px' }}><path d="M22 7h-7v2h7V7zm1.72 10.85c.14-.54.2-1.23.2-2.07h-5.63c.02.73.23 1.3.62 1.7.4.4.92.6 1.55.6.53 0 .97-.13 1.3-.39.35-.26.6-.63.75-1.1h2.1c-.26 1-1.02 1.85-2.28 2.55-1.1.6-2.4.9-3.92.9-1.8 0-3.23-.53-4.28-1.6-1.06-1.07-1.58-2.53-1.58-4.4 0-1.93.53-3.46 1.6-4.6 1.07-1.13 2.54-1.7 4.4-1.7 1.75 0 3.12.52 4.12 1.57.98 1.05 1.48 2.56 1.48 4.54zm-3.15-4.13c-.04-.55-.24-1-.6-1.34-.35-.35-.8-.52-1.34-.52-.52 0-.96.17-1.33.52-.36.35-.58.8-.65 1.34h3.92zM8.9 14.5c1 0 1.7-.25 2.13-.77.43-.52.65-1.22.65-2.12 0-.8-.2-1.42-.6-1.86-.4-.44-1-.66-1.83-.66H4.2v5.4h4.7zm-.62-7.23c.8 0 1.4.2 1.83.6.43.4.65.98.65 1.74 0 .76-.23 1.34-.68 1.74-.46.4-1.07.6-1.85.6H4.2V7.27h4.08zM14 11.4c0-.98-.24-1.8-.73-2.45-.48-.65-1.2-1.12-2.12-1.4.74-.3 1.32-.73 1.7-1.3.4-.55.58-1.23.58-2 0-1.15-.44-2.02-1.3-2.6C11.23 1.05 10 .76 8.5.76H1v18.4h7.72c1.7 0 3.1-.38 4.1-1.14 1-.76 1.5-1.87 1.5-3.32 0-1.1-.34-2-.98-2.7-.63-.7-1.5-1.16-2.58-1.4.83-.16 1.5-.54 2-1.12.52-.6.76-1.3.76-2.08z" fill="#fff"/></svg>
        Behance
      </span>
    ),
    gwd: (
      <span className="tool-tag" key="gwd" title="Google Web Designer">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1e293b" style={{ borderRadius: '3px' }}><rect width="24" height="24" fill="#1e293b"/><text x="12" y="15" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">GWD</text></svg>
        Google Web Designer
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#fff' }}>{meta.projectName || topic}</h3>
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

      {/* SOCIAL LINKS SECTION */}
      {meta.socialLinks && Object.values(meta.socialLinks).some(val => !!val) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          {meta.socialLinks.email && (
            <a href={`mailto:${meta.socialLinks.email}`} className="social-link-btn" title="Email" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Email
            </a>
          )}
          {meta.socialLinks.phone && (
            <a href={`tel:${meta.socialLinks.phone}`} className="social-link-btn" title="Phone" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Phone
            </a>
          )}
          {meta.socialLinks.facebook && (
            <a href={meta.socialLinks.facebook.startsWith('http') ? meta.socialLinks.facebook : `https://${meta.socialLinks.facebook}`} className="social-link-btn" title="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              Facebook
            </a>
          )}
          {meta.socialLinks.linkedin && (
            <a href={meta.socialLinks.linkedin.startsWith('http') ? meta.socialLinks.linkedin : `https://${meta.socialLinks.linkedin}`} className="social-link-btn" title="LinkedIn" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              LinkedIn
            </a>
          )}
          {meta.socialLinks.website && (
            <a href={meta.socialLinks.website.startsWith('http') ? meta.socialLinks.website : `https://${meta.socialLinks.website}`} className="social-link-btn" title="Website" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              Website
            </a>
          )}
          {meta.socialLinks.dribbble && (
            <a href={meta.socialLinks.dribbble.startsWith('http') ? meta.socialLinks.dribbble : `https://${meta.socialLinks.dribbble}`} className="social-link-btn" title="Dribbble" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path></svg>
              Dribbble
            </a>
          )}
          {meta.socialLinks.behance && (
            <a href={meta.socialLinks.behance.startsWith('http') ? meta.socialLinks.behance : `https://${meta.socialLinks.behance}`} className="social-link-btn" title="Behance" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v2h7V7zm1.72 10.85c.14-.54.2-1.23.2-2.07h-5.63c.02.73.23 1.3.62 1.7.4.4.92.6 1.55.6.53 0 .97-.13 1.3-.39.35-.26.6-.63.75-1.1h2.1c-.26 1-1.02 1.85-2.28 2.55-1.1.6-2.4.9-3.92.9-1.8 0-3.23-.53-4.28-1.6-1.06-1.07-1.58-2.53-1.58-4.4 0-1.93.53-3.46 1.6-4.6 1.07-1.13 2.54-1.7 4.4-1.7 1.75 0 3.12.52 4.12 1.57.98 1.05 1.48 2.56 1.48 4.54zm-3.15-4.13c-.04-.55-.24-1-.6-1.34-.35-.35-.8-.52-1.34-.52-.52 0-.96.17-1.33.52-.36.35-.58.8-.65 1.34h3.92zM8.9 14.5c1 0 1.7-.25 2.13-.77.43-.52.65-1.22.65-2.12 0-.8-.2-1.42-.6-1.86-.4-.44-1-.66-1.83-.66H4.2v5.4h4.7zm-.62-7.23c.8 0 1.4.2 1.83.6.43.4.65.98.65 1.74 0 .76-.23 1.34-.68 1.74-.46.4-1.07.6-1.85.6H4.2V7.27h4.08zM14 11.4c0-.98-.24-1.8-.73-2.45-.48-.65-1.2-1.12-2.12-1.4.74-.3 1.32-.73 1.7-1.3.4-.55.58-1.23.58-2 0-1.15-.44-2.02-1.3-2.6C11.23 1.05 10 .76 8.5.76H1v18.4h7.72c1.7 0 3.1-.38 4.1-1.14 1-.76 1.5-1.87 1.5-3.32 0-1.1-.34-2-.98-2.7-.63-.7-1.5-1.16-2.58-1.4.83-.16 1.5-.54 2-1.12.52-.6.76-1.3.76-2.08z"/></svg>
              Behance
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignInfoCard;
