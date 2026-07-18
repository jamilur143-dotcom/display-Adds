import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getStoredData, CATEGORIES, AD_SIZES } from '../data/mockData';
import { syncPortfolioData, savePortfolioData, uploadFileToStorage } from '../firebase';
import CampaignInfoCard from '../components/CampaignInfoCard';

const resolveMedia = (url) => {
  if (!url) return { type: 'unknown', url: '' };
  
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
      return { 
        type: 'gdrive', 
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        imageUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
        directUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
      };
    }
  }
  
  const urlWithoutQuery = url.split('?')[0];
  if (/\.(mp4|webm|ogg)$/i.test(urlWithoutQuery)) {
    return { type: 'video', url };
  }
  
  return { type: 'image', url };
};

// ── Category Meta Editor ──
const CategoryMetaEditor = ({ activeCategory, activeTabLabel, categoryMeta = {}, iconLibrary = [], onSave, onAddIcon, onDeleteIcon }) => {
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [year, setYear] = useState('2026');
  const [tools, setTools] = useState([]);

  const [projectName, setProjectName] = useState(categoryMeta.projectName || '');
  const [socialLinks, setSocialLinks] = useState(categoryMeta.socialLinks || {
    email: '', phone: '', facebook: '', linkedin: '', website: '', dribbble: '', behance: ''
  });

  useEffect(() => {
    setDescription(categoryMeta.description || '');
    setClient(categoryMeta.client || '');
    setYear(categoryMeta.year || '2026');
    setTools(categoryMeta.tools || []);
    setProjectName(categoryMeta.projectName || '');
    setSocialLinks(categoryMeta.socialLinks || { email: '', phone: '', facebook: '', linkedin: '', website: '', dribbble: '', behance: '' });
  }, [categoryMeta]);

  const toggleTool = (tool) => {
    setTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]);
  };

  const handleSocialChange = (field, value) => {
    setSocialLinks(prev => ({ ...prev, [field]: value }));
  };

  const handleIconDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const name = prompt("Enter a name for this tool (e.g., Illustrator):");
      if (!name) return;
      const reader = new FileReader();
      reader.onload = (e) => onAddIcon(e.target.result, name);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(activeCategory, { description, client, year, tools, projectName, socialLinks });
    alert(`Campaign details saved for topic "${activeCategory}"!`);
  };

  const availableTools = ['figma', 'photoshop', 'illustrator', 'aftereffects', 'gwd'];

  return (
    <div className="campaign-meta-editor" style={{
      background: 'var(--surface-color)', border: '1px solid var(--border-color)',
      padding: '1.5rem', borderRadius: 'var(--border-radius)', marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.2rem' }}>📄</span>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-color)' }}>
          Campaign Details ({activeCategory}) - {activeTabLabel}
        </h3>
      </div>
      
      <div className="form-row" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Project Name (Overrides Campaign Name)</label>
          <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder={`e.g., ${activeCategory} V2`} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Client Name</label>
          <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g., Timmerman Industries" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Campaign Year</label>
          <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g., 2026" />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label>Campaign Description</label>
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder={`Describe what the ${activeCategory} campaign/topic is about...`} 
          rows="3"
          style={{
            width: '100%', background: '#0b111a', border: '1px solid var(--border-color)',
            color: '#fff', padding: '0.6rem', borderRadius: '6px', fontSize: '0.85rem',
            fontFamily: 'inherit', resize: 'vertical'
          }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--accent-color)', fontWeight: '600' }}>Contact & Social Links</label>
        <div className="form-row" style={{ marginBottom: '0.75rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Gmail / Email</label>
            <input type="email" value={socialLinks.email || ''} onChange={e => handleSocialChange('email', e.target.value)} placeholder="e.g., hello@example.com" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Phone Number</label>
            <input type="text" value={socialLinks.phone || ''} onChange={e => handleSocialChange('phone', e.target.value)} placeholder="e.g., +1 234 567 890" />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: '0.75rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Facebook Link</label>
            <input type="url" value={socialLinks.facebook || ''} onChange={e => handleSocialChange('facebook', e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>LinkedIn Link</label>
            <input type="url" value={socialLinks.linkedin || ''} onChange={e => handleSocialChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Dribbble Link</label>
            <input type="url" value={socialLinks.dribbble || ''} onChange={e => handleSocialChange('dribbble', e.target.value)} placeholder="https://dribbble.com/..." />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Behance Link</label>
            <input type="url" value={socialLinks.behance || ''} onChange={e => handleSocialChange('behance', e.target.value)} placeholder="https://behance.net/..." />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Website URL</label>
            <input type="url" value={socialLinks.website || ''} onChange={e => handleSocialChange('website', e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tools Used (Upload & Select)</label>
        
        {/* Upload box for new icons */}
        <div 
          onDragOver={e => e.preventDefault()}
          onDrop={handleIconDrop}
          style={{
            border: '2px dashed var(--border-color)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                const name = prompt("Enter a name for this tool (e.g., Illustrator):");
                if (!name) return;
                const reader = new FileReader();
                reader.onload = (ev) => onAddIcon(ev.target.result, name);
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}
        >
          📥 Drag & Drop or Click to upload custom PNG icon for tools
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {availableTools.map(tool => (
            <label key={tool} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" 
                checked={tools.includes(tool)} 
                onChange={() => toggleTool(tool)}
                style={{ cursor: 'pointer' }}
              />
              {tool.toUpperCase()}
            </label>
          ))}

          {/* User uploaded icons */}
          {iconLibrary.map(icon => (
            <div key={icon.id} style={{ position: 'relative', display: 'inline-block' }}>
              <div 
                onClick={() => toggleTool(icon.id)}
                style={{
                  width: '40px', height: '40px',
                  borderRadius: '8px',
                  border: tools.includes(icon.id) ? '2px solid var(--accent-color)' : '2px solid transparent',
                  cursor: 'pointer',
                  backgroundImage: `url(${icon.url})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: tools.includes(icon.id) ? '0 0 10px rgba(0, 122, 255, 0.4)' : 'none',
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
                title={icon.name || "Custom Tool"}
              />
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteIcon && onDeleteIcon(icon.id); }}
                style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
                title="Delete custom icon"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} style={{ width: 'fit-content' }}>Save Campaign Info</button>
    </div>
  );
};

// ── Sortable Grid Card ────────────────────────────────
const SortableItem = ({ id, item, allCategories, onCategoryChange, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="dash-card">
      <div className="dash-card-header">
        <span {...attributes} {...listeners} className="drag-handle">⠿</span>
        <div>
          <button 
            className="edit-btn" 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(item); }} 
            title="Edit Asset" 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '0.5rem' }}
          >
            ✎
          </button>
          <button 
            className="delete-btn" 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(id); }} 
            title="Delete Asset"
          >
            ×
          </button>
        </div>
      </div>
      
      {(() => {
        const media = resolveMedia(item.url);
        if (!item.url) return <div className="dash-card-img-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', height: '120px', fontSize: '0.85rem' }}>Empty Slot</div>;
        
        if (media.type === 'youtube') {
          return (
            <div className="dash-card-img" style={{ position: 'relative', overflow: 'hidden' }}>
              <iframe 
                src={media.url} 
                title={item.title} 
                style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} 
              />
            </div>
          );
        }
        
        if (media.type === 'video') {
          return (
            <div className="dash-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <video src={media.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        }
        
        if (media.type === 'gdrive') {
          return (
            <div className="dash-card-img" style={{ position: 'relative', overflow: 'hidden' }}>
              <iframe 
                src={media.url} 
                title={item.title} 
                style={{ width: '100%', height: '100%', border: 'none' }} 
              />
            </div>
          );
        }
        
        // Default image type
        return (
          <div className="dash-card-img" style={{ backgroundImage: `url(${media.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        );
      })()}
      
      <div className="dash-card-body">
        <div className="dnd-item-title">{item.title}</div>
        <div className="dnd-item-sub">{item.adSize} • {item.weight} KB</div>
        
        <select
          className="category-select"
          value={item.category || ''}
          onChange={(e) => onCategoryChange(item.id, e.target.value)}
        >
          {allCategories.filter(c => c !== 'All').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value="NEW_CATEGORY">+ Add New Category</option>
        </select>
      </div>
    </div>
  );
};

// ── Upload Modal ──────────────────────────────────────
const UploadModal = ({ isOpen, onClose, onUpload, categories, defaultCategory, editingItem, activeTab }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [savedTitles, setSavedTitles] = useState([]);
  const [category, setCategory] = useState('');
  const [newCat, setNewCat] = useState('');
  const [adSize, setAdSize] = useState('300 × 250');
  const [isUploading, setIsUploading] = useState(false);
  
  const dropRef = useRef(null);

  const [adUrl, setAdUrl] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [fileError, setFileError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const activeCats = categories.filter(c => c !== 'All');
      const fallbackCat = activeCats.length > 0 ? activeCats[0] : 'NEW_CATEGORY';

      if (editingItem) {
        setTitle(editingItem.title || '');
        setCategory(editingItem.category || fallbackCat);
        setAdSize(editingItem.adSize || '300 × 250');
        setPreview(editingItem.url || null);
        setAdUrl(editingItem.url && typeof editingItem.url === 'string' && !editingItem.url.startsWith('data:') ? editingItem.url : '');
        setFile(null);
      } else {
        setTitle('');
        setCategory(defaultCategory !== 'All' ? defaultCategory : fallbackCat);
        setAdSize('300 × 250');
        setPreview(null);
        setAdUrl('');
        setFile(null);
      }
      
      try {
        const saved = JSON.parse(localStorage.getItem('savedAssetTitles') || '[]');
        setSavedTitles(saved);
      } catch (e) {
        setSavedTitles([]);
      }
      
      setTitleError(false);
      setFileError(false);

      // Foolproof drag and drop native binding
      const el = dropRef.current;
      if (el) {
        const preventDefaults = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };

        const handleDropVanilla = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const dropped = e.dataTransfer.files[0];
          if (dropped) {
            processFile(dropped);
          }
        };

        el.addEventListener('dragenter', preventDefaults);
        el.addEventListener('dragover', preventDefaults);
        el.addEventListener('dragleave', preventDefaults);
        el.addEventListener('drop', handleDropVanilla);

        return () => {
          el.removeEventListener('dragenter', preventDefaults);
          el.removeEventListener('dragover', preventDefaults);
          el.removeEventListener('dragleave', preventDefaults);
          el.removeEventListener('drop', handleDropVanilla);
        };
      }
    }
  }, [isOpen, editingItem, categories, defaultCategory]);

  if (!isOpen) return null;



  const handleFileChange = (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
  };

  const processFile = (f) => {
    if (f.name.endsWith('.zip')) {
      alert("For HTML5 Ads (ZIP), it's highly recommended to extract the folder into your project's 'public' directory and just paste the link (e.g., /damo/damo.html) in the 'Ad URL' field below. Browsers cannot easily play ZIP files directly without a backend.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      alert("Please upload files under 50MB.");
      return;
    }
    setFile(f);
    setAdUrl(''); // clear URL if file uploaded
    
    const isImage = f.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
    const isVideo = f.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(f.name);
    
    if (isImage || isVideo) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
      setFileError(false); // clear file error
    } else {
      alert("Please upload an image or video file.");
    }
  };

  const handleSubmit = async () => {
    let hasError = false;
    
    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    } else {
      setTitleError(false);
    }

    if (!file && !preview && !adUrl.trim()) {
      setFileError(true);
      hasError = true;
    } else {
      setFileError(false);
    }

    if (hasError) return;
    
    setIsUploading(true);
    try {
      let finalUrl = preview;
      let finalType = 'html5';
      
      if (adUrl) {
        finalUrl = adUrl;
        finalType = activeTab === 'staticAssets' ? 'static' : activeTab === 'motionGraphics' ? 'gif' : 'html5';
      } else if (file) {
        // Upload to Firebase Storage
        finalUrl = await uploadFileToStorage(file);
        finalType = file.type.includes('video') || file.type.includes('gif') || file.name.toLowerCase().endsWith('.gif') ? 'gif' : file.type.includes('image') ? 'static' : 'html5';
      } else if (editingItem) {
        finalType = editingItem.type || editingItem.sizeType || 'html5';
      }

      if (!editingItem && title.trim()) {
        try {
          const saved = JSON.parse(localStorage.getItem('savedAssetTitles') || '[]');
          if (!saved.includes(title.trim())) {
            saved.unshift(title.trim());
            if (saved.length > 30) saved.pop();
            localStorage.setItem('savedAssetTitles', JSON.stringify(saved));
          }
        } catch(e) {}
      }

      onUpload({
        fileData: finalUrl,
        title: title.trim(),
        category: category === 'NEW_CATEGORY' ? newCat : category,
        adSize,
        weight: Math.round((file?.size || 0) / 1024) || 150,
        type: finalType,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{editingItem ? 'Edit Asset' : 'Upload New Asset'}</h3>
        
        <div 
          className="drop-zone"
          ref={dropRef}
          onClick={() => !isUploading && document.getElementById('file-input').click()}
          style={{
            borderColor: fileError ? '#f87171' : 'var(--border-color)',
            boxShadow: fileError ? '0 0 0 1px #f87171' : 'none',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.7 : 1
          }}
        >
          {preview ? (
            preview.startsWith('data:video') || file?.type.startsWith('video') ? (
              <video src={preview} className="drop-preview" autoPlay loop muted playsInline style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <img src={preview} alt="preview" className="drop-preview" />
            )
          ) : (
            <span>Drag & Drop file here or Click to browse (Max 50MB)</span>
          )}
          <input type="file" id="file-input" hidden onChange={handleFileChange} accept="image/*,image/gif,video/mp4,.gif,.zip" disabled={isUploading} />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem', marginTop: '1rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', color: fileError ? '#f87171' : 'inherit' }}>
            <span>URL (Google Drive, YouTube, Web URL)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>e.g. YouTube video or Google Drive link</span>
          </label>
          <input 
            type="text" 
            value={adUrl} 
            onChange={e => { setAdUrl(e.target.value); setFileError(false); }} 
            placeholder="Paste link to Google Drive, YouTube, or web asset..." 
            disabled={isUploading}
            style={{ 
              borderColor: fileError ? '#f87171' : 'transparent',
              boxShadow: fileError ? '0 0 0 1px #f87171' : 'none'
            }}
          />
          {fileError && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>⚠️ Please upload a file or paste a URL link.</span>}
        </div>

        <div className="form-group">
          <label style={{ color: titleError ? '#f87171' : 'inherit' }}>Title</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={title} 
              list="saved-titles"
              onChange={e => { 
                setTitle(e.target.value); 
                setTitleError(false);
              }} 
              placeholder="e.g., Summer Sale Banner" 
              disabled={isUploading}
              style={{ 
                borderColor: titleError ? '#f87171' : 'transparent',
                boxShadow: titleError ? '0 0 0 1px #f87171' : 'none',
                paddingRight: '2.5rem',
                width: '100%'
              }}
            />
            <datalist id="saved-titles">
              {savedTitles.map(t => <option key={t} value={t} />)}
            </datalist>
            {title && !isUploading && (
              <span 
                onClick={() => setTitle('')}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                  userSelect: 'none'
                }}
                title="Clear Title"
              >
                ×
              </span>
            )}
          </div>
          {titleError && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>⚠️ Title is required. Please type a name.</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} disabled={isUploading}>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              <option value="NEW_CATEGORY">+ Create New</option>
            </select>
            {category === 'NEW_CATEGORY' && (
              <input type="text" placeholder="Type new category..." value={newCat} onChange={e => setNewCat(e.target.value)} style={{ marginTop: '0.5rem' }} disabled={isUploading} />
            )}
          </div>
          
          <div className="form-group">
            <label>Ad Size</label>
            <select value={adSize} onChange={e => setAdSize(e.target.value)} disabled={isUploading}>
              {AD_SIZES.map(sz => <option key={sz.id} value={sz.label}>{sz.label}</option>)}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={isUploading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? 'Uploading...' : editingItem ? 'Save Changes' : 'Upload Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Dashboard ───────────────────────────────────
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('staticAssets');
  const [activeCategory, setCategory] = useState('All');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const unsubscribe = syncPortfolioData((firestoreData) => {
      if (firestoreData) {
        setData(firestoreData);
      } else {
        const local = getStoredData();
        setData(local);
        savePortfolioData(local);
      }
    });
    return () => unsubscribe();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setData(prev => {
      const arr   = prev[activeTab];
      const from  = arr.findIndex(i => i.id === active.id);
      const to    = arr.findIndex(i => i.id === over.id);
      const next  = { ...prev, [activeTab]: arrayMove(arr, from, to) };
      savePortfolioData(next);
      return next;
    });
  };

  const handleCategoryChange = (id, newCat) => {
    if (newCat === 'NEW_CATEGORY') {
      const typed = prompt("Enter new category name:");
      if (!typed) return;
      newCat = typed;
      setData(prev => {
        const cats = prev.categories.includes(typed) ? prev.categories : [...prev.categories, typed];
        const next = { ...prev, categories: cats };
        savePortfolioData(next);
        return next;
      });
    }
    setData(prev => {
      const arr  = prev[activeTab].map(i => i.id === id ? { ...i, category: newCat } : i);
      const next = { ...prev, [activeTab]: arr };
      savePortfolioData(next);
      return next;
    });
  };

  const handleDelete = (id) => {
    setData(prev => {
      const next = { ...prev, [activeTab]: prev[activeTab].filter(i => i.id !== id) };
      savePortfolioData(next);
      return next;
    });
  };

  const handleAddIcon = (iconUrl, iconName) => {
    setData(prev => {
      const newIcon = { id: 'icon-' + Date.now(), url: iconUrl, name: iconName || 'Custom Tool' };
      const newLib = [...(prev.iconLibrary || []), newIcon];
      const next = { ...prev, iconLibrary: newLib };
      savePortfolioData(next);
      return next;
    });
  };

  const handleDeleteIcon = (iconId) => {
    setData(prev => {
      const newLib = (prev.iconLibrary || []).filter(icon => icon.id !== iconId);
      const newMeta = { ...prev.categoryMeta };
      Object.keys(newMeta).forEach(cat => {
        if (newMeta[cat] && newMeta[cat].tools) {
          newMeta[cat].tools = newMeta[cat].tools.filter(t => t !== iconId);
        }
      });
      const next = { ...prev, iconLibrary: newLib, categoryMeta: newMeta };
      savePortfolioData(next);
      return next;
    });
  };

  const handleSaveMeta = (cat, metaObj) => {
    setData(prev => {
      const currentCatMeta = prev.categoryMeta?.[cat] || {};
      const isLegacyFlat = !currentCatMeta.staticAssets && !currentCatMeta.motionGraphics && !currentCatMeta.html5Ads && Object.keys(currentCatMeta).length > 0;
      
      let newCatMeta = {};
      if (isLegacyFlat) {
        newCatMeta = {
          staticAssets: { ...currentCatMeta },
          motionGraphics: { ...currentCatMeta },
          html5Ads: { ...currentCatMeta },
          [activeTab]: metaObj
        };
      } else {
        newCatMeta = {
          ...currentCatMeta,
          [activeTab]: metaObj
        };
      }

      const next = {
        ...prev,
        categoryMeta: {
          ...prev.categoryMeta,
          [cat]: newCatMeta
        }
      };
      savePortfolioData(next);
      return next;
    });
  };

  const handleUpload = (assetData) => {
    const sizeInfo = AD_SIZES.find(s => s.label === assetData.adSize) || AD_SIZES[0];
    
    setData(prev => {
      let cats = prev.categories;
      if (!cats.includes(assetData.category)) cats = [...cats, assetData.category];

      let newList;
      if (editingItem) {
        newList = prev[activeTab].map(i => i.id === editingItem.id ? {
          ...i,
          title: assetData.title,
          category: assetData.category,
          adSize: assetData.adSize,
          width: sizeInfo.width,
          height: sizeInfo.height,
          sizeType: sizeInfo.type,
          url: assetData.fileData,
          weight: assetData.weight || i.weight // keep old weight if no new file
        } : i);
      } else {
        const newItem = {
          id: `uploaded-${Date.now()}`,
          title: assetData.title,
          category: assetData.category,
          adSize: assetData.adSize,
          width: sizeInfo.width,
          height: sizeInfo.height,
          sizeType: sizeInfo.type,
          weight: assetData.weight,
          url: assetData.fileData,
          tools: 'Uploaded',
        };
        newList = [newItem, ...prev[activeTab]];
      }

      const next = { ...prev, categories: cats, [activeTab]: newList };
      savePortfolioData(next);
      return next;
    });
  };

  const openUpload = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  if (!data) return null;

  const TAB_LABELS = { staticAssets: 'Static Assets', motionGraphics: 'Motion Graphics', html5Ads: 'HTML5 Ads' };
  const allCategories = data.categories || CATEGORIES;

  const filteredItems = data[activeTab].filter(item => 
    activeCategory === 'All' ? true : item.category === activeCategory
  );

  return (
    <div className="portfolio-layout">
      {/* Category Sidebar Workspace */}
      <aside className="sidebar">
        <div className="sidebar-title">Workspaces</div>
        {['All', ...allCategories.filter(c => c !== 'All')].map(cat => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            <span className="filter-dot" />
            {cat}
          </button>
        ))}
      </aside>

      {/* Main Workspace Area */}
      <div className="portfolio-main" style={{ padding: '2rem 3rem' }}>
        <div className="dashboard-header">
          <h2 className="section-title-lg">Backend Dashboard</h2>
          <button className="btn-primary" onClick={openUpload}>＋ Upload Asset</button>
        </div>
        <p className="subtitle">
          Manage your campaign workspaces. Select a category from the sidebar to view its clean workspace and edit campaign details.
        </p>

        <div className="dash-tabs" style={{ marginBottom: '1.5rem' }}>
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <button 
              key={key} 
              className={`dash-tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label} <span className="tab-count">({data[key].filter(i => activeCategory === 'All' || i.category === activeCategory).length})</span>
            </button>
          ))}
        </div>

        <CategoryMetaEditor 
          activeCategory={activeCategory} 
          activeTabLabel={TAB_LABELS[activeTab]}
          categoryMeta={
            data.categoryMeta?.[activeCategory]
              ? (data.categoryMeta[activeCategory].staticAssets || data.categoryMeta[activeCategory].motionGraphics || data.categoryMeta[activeCategory].html5Ads
                  ? data.categoryMeta[activeCategory]?.[activeTab] || {}
                  : data.categoryMeta[activeCategory])
              : {}
          }
          iconLibrary={data.iconLibrary || []}
          onSave={handleSaveMeta} 
          onAddIcon={handleAddIcon}
          onDeleteIcon={handleDeleteIcon}
        />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="dnd-grid">
              {filteredItems.map(item => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  allCategories={allCategories}
                  onCategoryChange={handleCategoryChange}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
              <CampaignInfoCard 
                meta={
                  data.categoryMeta?.[activeCategory]
                    ? (data.categoryMeta[activeCategory].staticAssets || data.categoryMeta[activeCategory].motionGraphics || data.categoryMeta[activeCategory].html5Ads
                        ? data.categoryMeta[activeCategory]?.[activeTab] || null
                        : data.categoryMeta[activeCategory])
                    : (activeCategory === 'All' ? {
                        description: "An overview of all my display ad campaigns, showcasing static designs, animated GIFs, and interactive HTML5 ads.",
                        client: "Various Clients",
                        year: "2026",
                        tools: []
                      } : null)
                } 
                topic={activeCategory} 
                iconLibrary={data.iconLibrary} 
              />
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onUpload={handleUpload} 
        categories={allCategories}
        defaultCategory={activeCategory}
        editingItem={editingItem}
        activeTab={activeTab}
      />
    </div>
  );
};

export default Dashboard;
