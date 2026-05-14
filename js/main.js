/* ========================================
   MINIMALIST PORTFOLIO - MAIN SCRIPT
   ======================================== */

let portfolioData = null;
let categoriesData = null;
let manifestData = null;

// Initialize portfolio data on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadManifestData();
  applyManifestContent();

  await loadPortfolioData();
  await loadCategoriesData();
  
  // Render portfolio on portfolio page
  if (document.getElementById('portfolio-gallery')) {
    renderPortfolio();
  }

  // Setup category browsing on browse page
  if (document.getElementById('category-grid')) {
    renderCategoryBrowse();
  }

  applyManifestContent();
});

/**
 * Load manifest text data
 */
async function loadManifestData() {
  try {
    const response = await fetch('./data/manifest.json');
    if (!response.ok) throw new Error('Failed to load manifest data');
    manifestData = await response.json();
  } catch (error) {
    console.error('Error loading manifest data:', error);
  }
}

/**
 * Apply manifest-driven text content to the current page
 */
function applyManifestContent() {
  if (!manifestData) return;

  const page = document.body.dataset.page;
  const site = manifestData.site;
  const pages = manifestData.pages;

  const navMap = {
    'index.html': site.nav.home,
    'portfolio.html': site.nav.portfolio,
    'browse.html': site.nav.browse,
    'contact.html': site.nav.contact,
  };

  Object.entries(navMap).forEach(([href, label]) => {
    const link = document.querySelector(`header nav a[href="${href}"]`);
    if (link && label) link.textContent = label;
  });

  document.querySelectorAll('#site-footer').forEach(footer => {
    footer.textContent = site.footer;
  });

  if (page === 'home') {
    document.title = `${site.name} | Portfolio`;
    setText('home-hero-title', pages.home.title);
    setText('home-hero-lead', pages.home.hero.lead);
    setText('home-about-heading', pages.home.about.heading);
    setText('home-background-heading', pages.home.about.backgroundHeading);
    setText('home-background-1', pages.home.about.background[0]);
    setText('home-background-2', pages.home.about.background[1]);
    setText('home-philosophy-heading', pages.home.about.philosophyHeading);
    setText('home-philosophy-1', pages.home.about.philosophy[0]);
    setText('home-philosophy-2', pages.home.about.philosophy[1]);
    setText('home-experience-heading', pages.home.about.experienceHeading);
    setText('home-experience', pages.home.about.experience);
    setText('home-explore-heading', pages.home.about.exploreHeading);
    setText('home-explore', pages.home.about.explore);
    setText('home-portfolio-link', pages.home.about.actions.portfolio);
    setText('home-browse-link', pages.home.about.actions.browse);
    setText('home-contact-link', pages.home.about.actions.contact);
  }

  if (page === 'about') {
    document.title = `About Me | ${site.name}`;
    setText('about-title', pages.about.title);
    setText('about-background-heading', pages.about.backgroundHeading);
    setText('about-background-1', pages.about.background[0]);
    setText('about-background-2', pages.about.background[1]);
    setText('about-philosophy-heading', pages.about.philosophyHeading);
    setText('about-philosophy-1', pages.about.philosophy[0]);
    setText('about-philosophy-2', pages.about.philosophy[1]);
    setText('about-experience-heading', pages.about.experienceHeading);
    setText('about-experience', pages.about.experience);
    setText('about-portfolio-link', pages.about.actions.portfolio);
    setText('about-browse-link', pages.about.actions.browse);
  }

  if (page === 'portfolio') {
    document.title = `Portfolio | ${site.name}`;
    setText('portfolio-title', pages.portfolio.title);
    setText('portfolio-description', pages.portfolio.description);
  }

  if (page === 'browse') {
    document.title = `Browse | ${site.name}`;
    setText('browse-title', pages.browse.title);
    setText('browse-description', pages.browse.description);
  }

  if (page === 'contact') {
    document.title = `Contact | ${site.name}`;
    setText('contact-title', pages.contact.title);
    setText('contact-description', pages.contact.description);
    setText('contact-name-label', pages.contact.form.name);
    setText('contact-email-label', pages.contact.form.email);
    setText('contact-message-label', pages.contact.form.message);
    setText('contact-submit', pages.contact.form.submit);
    setText('contact-direct-heading', pages.contact.direct.heading);
    setHTML('contact-email-line', `${pages.contact.direct.emailLabel} <a href="mailto:${pages.contact.direct.email}">${pages.contact.direct.email}</a>`);
    setText('contact-phone-line', `${pages.contact.direct.phoneLabel} ${pages.contact.direct.phone}`);
    setHTML('contact-instagram-line', `${pages.contact.direct.instagramLabel} <a href="https://instagram.com" target="_blank">${pages.contact.direct.instagram}</a>`);
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element && typeof value === 'string') {
    element.textContent = value;
  }
}

function setHTML(id, value) {
  const element = document.getElementById(id);
  if (element && typeof value === 'string') {
    element.innerHTML = value;
  }
}

/**
 * Load portfolio data (favorites only)
 */
async function loadPortfolioData() {
  try {
    const response = await fetch('./data/portfolio/portfolio.json');
    if (!response.ok) throw new Error('Failed to load portfolio data');
    portfolioData = await response.json();
  } catch (error) {
    console.error('Error loading portfolio data:', error);
  }
}

/**
 * Load categories and all images data
 */
async function loadCategoriesData() {
  try {
    const response = await fetch('./data/categories/categories.json');
    if (!response.ok) throw new Error('Failed to load categories data');
    categoriesData = await response.json();
  } catch (error) {
    console.error('Error loading categories data:', error);
  }
}

/**
 * Render portfolio gallery (favorites)
 */
function renderPortfolio() {
  if (!portfolioData) return;

  const gallery = document.getElementById('portfolio-gallery');
  gallery.innerHTML = '';

  // Sort by order
  const favorites = [...portfolioData.favorites].sort((a, b) => a.order - b.order);

  favorites.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="./images/${item.filename}" alt="artwork" data-id="${item.id}">
    `;
    div.addEventListener('click', () => openDetailView(item.filename, getArtworkDescription(item.id)));
    gallery.appendChild(div);
  });
}

/**
 * Render category browse interface
 */
function renderCategoryBrowse() {
  if (!categoriesData) return;

  const categoryGrid = document.getElementById('category-grid');
  const imageGallery = document.getElementById('browse-gallery');

  categoryGrid.innerHTML = '';
  imageGallery.hidden = true;
  imageGallery.innerHTML = '';
  
  // Sort categories by displayOrder
  const sortedCategories = [...categoriesData.categories].sort((a, b) => a.displayOrder - b.displayOrder);

  // Create category cards
  sortedCategories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-card-image">
        <img src="./images/${category.thumbnail}" alt="${category.name}">
      </div>
      <div class="category-card-title">${category.name}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.category-card').forEach(btn => btn.classList.remove('active'));
      card.classList.add('active');
      displayImagesByCategory(category.id);
      categoryGrid.innerHTML = '';
      categoryGrid.style.display = 'none';
      imageGallery.hidden = false;
    });
    categoryGrid.appendChild(card);
  });
}

/**
 * Display images filtered by category
 */
function displayImagesByCategory(categoryId) {
  if (!categoriesData) return;

  const gallery = document.getElementById('browse-gallery');
  gallery.innerHTML = '';

  let images = categoriesData.images;
  if (categoryId) {
    images = images.filter(img => img.category === categoryId);
  }

  images.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="./images/${item.filename}" alt="artwork" data-id="${item.id}">
    `;
    div.addEventListener('click', () => openDetailView(item.filename, getArtworkDescription(item.id)));
    gallery.appendChild(div);
  });
}

/**
 * Get artwork description from manifest data
 */
function getArtworkDescription(imageId) {
  const portfolioMatch = portfolioData?.favorites?.find(item => item.id === imageId);
  if (portfolioMatch?.description) {
    return portfolioMatch.description;
  }

  const categoryMatch = categoriesData?.images?.find(item => item.id === imageId);
  if (categoryMatch?.description) {
    return categoryMatch.description;
  }

  return '';
}

/**
 * Extract title from description (first phrase)
 */
function getTitleFromDescription(description) {
  // Extract first part before comma or period
  const match = description.match(/^([^,.]+)/);
  return match ? match[1].trim() : 'Untitled';
}

/**
 * Open detail view with image and description
 */
function openDetailView(filename, description) {
  const title = getTitleFromDescription(description);
  const overlay = document.createElement('div');
  overlay.className = 'detail-overlay';
  overlay.innerHTML = `
    <div class="detail-content">
      <button class="detail-close" aria-label="Close">&times;</button>
      <div class="detail-image-wrapper">
        <img src="./images/${filename}" alt="${title}">
      </div>
      <div class="detail-text">
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.detail-close');
  closeBtn.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Close on ESC key
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

/**
 * Handle contact form submission
 */
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      // Compose mailto link
      const subject = encodeURIComponent('New Portfolio Inquiry');
      const body = encodeURIComponent(`From: ${name} (${email})\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:contact@example.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
    });
  }
});
