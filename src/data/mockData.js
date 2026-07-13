// ── 12 Standard Display Ad Sizes ──────────────────────────────────────────
// (Red-marked from user's Google Web Designer screenshots)
export const AD_SIZES = [
  { id: 'sz-1',  label: '300 × 250',  width: 300,  height: 250,  ratio: 300/250,  type: 'square'     },
  { id: 'sz-2',  label: '160 × 600',  width: 160,  height: 600,  ratio: 160/600,  type: 'vertical'   },
  { id: 'sz-3',  label: '250 × 250',  width: 250,  height: 250,  ratio: 250/250,  type: 'square'     },
  { id: 'sz-4',  label: '300 × 600',  width: 300,  height: 600,  ratio: 300/600,  type: 'vertical'   },
  { id: 'sz-5',  label: '320 × 480',  width: 320,  height: 480,  ratio: 320/480,  type: 'vertical'   },
  { id: 'sz-6',  label: '360 × 640',  width: 360,  height: 640,  ratio: 360/640,  type: 'vertical'   },
  { id: 'sz-7',  label: '728 × 90',   width: 728,  height: 90,   ratio: 728/90,   type: 'leaderboard'},
  { id: 'sz-8',  label: '120 × 600',  width: 120,  height: 600,  ratio: 120/600,  type: 'skyscraper' },
  { id: 'sz-9',  label: '300 × 100',  width: 300,  height: 100,  ratio: 300/100,  type: 'horizontal' },
  { id: 'sz-10', label: '320 × 320',  width: 320,  height: 320,  ratio: 320/320,  type: 'square'     },
  { id: 'sz-11', label: '970 × 90',   width: 970,  height: 90,   ratio: 970/90,   type: 'billboard'  },
  { id: 'sz-12', label: '970 × 250',  width: 970,  height: 250,  ratio: 970/250,  type: 'billboard'  },
];

export const CATEGORIES = ['All'];

// ── Mock data: one entry per ad size, for each section ────────────────────
const makeSets = (prefix, category) =>
  AD_SIZES.map((sz, i) => ({
    id:       `${prefix}-${sz.id}`,
    adSizeId: sz.id,
    title:    `${category} · ${sz.label}`,
    adSize:   sz.label,
    width:    sz.width,
    height:   sz.height,
    sizeType: sz.type,
    category,
    tools:    prefix === 'static' ? 'Photoshop / Figma'
            : prefix === 'gif'    ? 'After Effects'
            :                       'Google Web Designer',
    weight:   String(Math.round(sz.width * sz.height * (prefix === 'gif' ? 0.03 : prefix === 'static' ? 0.008 : 0.015))),
    url:      prefix === 'gif' ? 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' : null,
  }));

export const initialCategoryMeta = {
  "Food": {
    staticAssets: {
      description: "A mouth-watering display ad set designed for digital campaigns, focusing on vibrant colors, fresh ingredients, and bold typography to drive click-through rates.",
      client: "FreshByte Kitchens",
      year: "2026",
      tools: ["figma", "photoshop"]
    },
    motionGraphics: {
      description: "Animated Food banner designs focusing on smooth transitions and mouth-watering effects.",
      client: "FreshByte Kitchens",
      year: "2026",
      tools: ["aftereffects"]
    },
    html5Ads: {
      description: "Interactive HTML5 banners for the Food campaign.",
      client: "FreshByte Kitchens",
      year: "2026",
      tools: ["gwd"]
    }
  },
  "AI Tools & Services": {
    staticAssets: {
      description: "Futuristic banner design system for an AI automation platform. Used clean dark interfaces with cyber blue glow effects to appeal to tech-savvy professionals.",
      client: "Timmerman Industries",
      year: "2026",
      tools: ["figma", "photoshop"]
    },
    motionGraphics: {
      description: "Motion graphics for AI Tools highlighting features and workflow.",
      client: "Timmerman Industries",
      year: "2026",
      tools: ["aftereffects"]
    },
    html5Ads: {
      description: "HTML5 Interactive Ads for AI platform with interactive tooltips.",
      client: "Timmerman Industries",
      year: "2026",
      tools: ["gwd"]
    }
  }
};

export const initialData = {
  categories: CATEGORIES,
  categoryMeta: {},
  iconLibrary: [],
  staticAssets:   [],
  motionGraphics: [],
  html5Ads:       [],
};

export const getStoredData = () => {
  try {
    const stored = localStorage.getItem('portfolioData_v3');
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Default categories to strip out
      const defaults = ['Food', 'Interior', 'Fashion', 'Tech', 'Automotive'];
      
      // Filter list of categories
      if (parsed.categories) {
        parsed.categories = parsed.categories.filter(c => !defaults.includes(c));
      }
      
      // Ensure 'All' is present
      if (!parsed.categories || parsed.categories.length === 0 || !parsed.categories.includes('All')) {
        parsed.categories = ['All', ...(parsed.categories || [])];
      }
      
      // Filter mock assets belonging to these categories
      if (parsed.staticAssets) {
        parsed.staticAssets = parsed.staticAssets.filter(a => !defaults.includes(a.category));
      }
      if (parsed.motionGraphics) {
        parsed.motionGraphics = parsed.motionGraphics.filter(a => !defaults.includes(a.category));
      }
      if (parsed.html5Ads) {
        parsed.html5Ads = parsed.html5Ads.filter(a => !defaults.includes(a.category));
      }
      
      // Save sanitized data back to localStorage to complete the migration
      localStorage.setItem('portfolioData_v3', JSON.stringify(parsed));
      return parsed;
    }
  } catch (_) {}
  localStorage.setItem('portfolioData_v3', JSON.stringify(initialData));
  return initialData;
};

export const updateStoredData = (newData) => {
  localStorage.setItem('portfolioData_v3', JSON.stringify(newData));
};
