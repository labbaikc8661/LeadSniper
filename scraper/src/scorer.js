/**
 * Opportunity Scorer - 20+ factor scoring system (0-100)
 * Higher score = better opportunity for the freelancer
 * Every point is granular - a 1% difference is meaningful
 */

// Score factor max points (must sum to ~100)
const FACTORS = {
  website_existence: 8,
  desktop_speed: 6,
  mobile_speed: 7,
  fcp: 4,
  lcp: 4,
  cls: 3,
  tti: 4,
  tech_freshness: 5,
  ssl: 2,
  mobile_responsive: 5,
  accessibility: 4,
  seo_basics: 5,
  image_optimization: 3,
  no_app: 4,
  no_web_app: 4,
  social_gaps: 4,
  business_health: 5,
  review_volume: 4,
  contact_reachability: 5,
  online_booking: 3,
  content_freshness: 3,
  structured_data: 2,
  pwa: 2,
};
// Total: 97 — leaves 3 pts flex room for rounding

const OUTDATED_TECH = new Set(['WordPress', 'Joomla', 'Drupal', 'Wix', 'Squarespace', 'jQuery', 'PHP', 'Magento', 'PrestaShop']);
const MODERN_TECH = new Set(['React', 'Next.js', 'Vue.js', 'Angular', 'Tailwind', 'Webflow']);

// Niches that benefit from mobile apps
const APP_NICHES = new Set([
  'restaurant', 'dental', 'clinic', 'gym', 'fitness', 'salon', 'spa', 'hotel',
  'real estate', 'immobilier', 'delivery', 'taxi', 'transport', 'school', 'education',
]);

// Niches that benefit from web apps / portals / booking
const WEBAPP_NICHES = new Set([
  'avocat', 'lawyer', 'cabinet', 'dental', 'clinic', 'doctor', 'médecin',
  'restaurant', 'hotel', 'salon', 'spa', 'gym', 'fitness', 'school', 'education',
  'accountant', 'comptable', 'consultant', 'agency', 'agence', 'call center',
]);

/**
 * Calculate opportunity score for a lead
 * @param {Object} lead - Lead data with all enrichment fields
 * @param {string} niche - The search niche (e.g., "Avocat", "Dental Clinic")
 * @returns {{ score: number, breakdown: Object, services: string[] }}
 */
export function calculateOpportunityScore(lead, niche = '') {
  const breakdown = {};
  const services = [];
  const nicheLower = niche.toLowerCase();

  // ── No website = max points for ALL web-related factors ──
  // They need everything: site, speed, mobile, SEO, SSL, etc.
  const noSite = !lead.has_website;

  // 1. Website existence (0-8)
  if (noSite) {
    breakdown.website_existence = 8;
    services.push('website');
  } else {
    const hasMinimalSite = (lead.tech_stack || []).some(t => ['Wix', 'Squarespace'].includes(t));
    breakdown.website_existence = hasMinimalSite ? 4 : 0;
  }

  // 2. Desktop speed (0-6)
  if (noSite) {
    breakdown.desktop_speed = 6;
  } else if (lead.page_speed_score !== null && lead.page_speed_score !== undefined) {
    if (lead.page_speed_score < 30) breakdown.desktop_speed = 6;
    else if (lead.page_speed_score < 50) breakdown.desktop_speed = 5;
    else if (lead.page_speed_score < 70) breakdown.desktop_speed = 3;
    else if (lead.page_speed_score < 90) breakdown.desktop_speed = 1;
    else breakdown.desktop_speed = 0;
  } else {
    breakdown.desktop_speed = 3; // has website but unknown = assume mediocre
  }

  // 3. Mobile speed (0-7)
  if (noSite) {
    breakdown.mobile_speed = 7;
  } else if (lead.mobile_friendly === false) {
    breakdown.mobile_speed = 7;
  } else if (lead.page_speed_score !== null) {
    const mobileEstimate = Math.max(0, (lead.page_speed_score || 0) - 15);
    if (mobileEstimate < 30) breakdown.mobile_speed = 7;
    else if (mobileEstimate < 50) breakdown.mobile_speed = 5;
    else if (mobileEstimate < 70) breakdown.mobile_speed = 3;
    else breakdown.mobile_speed = 1;
  } else {
    breakdown.mobile_speed = 3;
  }

  // 4. FCP (0-4)
  if (noSite) {
    breakdown.fcp = 4;
  } else if (lead.fcp_ms !== null && lead.fcp_ms !== undefined) {
    if (lead.fcp_ms > 4000) breakdown.fcp = 4;
    else if (lead.fcp_ms > 2500) breakdown.fcp = 3;
    else if (lead.fcp_ms > 1800) breakdown.fcp = 2;
    else if (lead.fcp_ms > 1000) breakdown.fcp = 1;
    else breakdown.fcp = 0;
  } else {
    breakdown.fcp = 2;
  }

  // 5. LCP (0-4)
  if (noSite) {
    breakdown.lcp = 4;
  } else if (lead.lcp_ms !== null && lead.lcp_ms !== undefined) {
    if (lead.lcp_ms > 6000) breakdown.lcp = 4;
    else if (lead.lcp_ms > 4000) breakdown.lcp = 3;
    else if (lead.lcp_ms > 2500) breakdown.lcp = 2;
    else if (lead.lcp_ms > 1500) breakdown.lcp = 1;
    else breakdown.lcp = 0;
  } else {
    breakdown.lcp = 2;
  }

  // 6. CLS (0-3)
  if (noSite) {
    breakdown.cls = 3;
  } else if (lead.cls_score !== null && lead.cls_score !== undefined) {
    if (lead.cls_score > 0.25) breakdown.cls = 3;
    else if (lead.cls_score > 0.1) breakdown.cls = 2;
    else if (lead.cls_score > 0.05) breakdown.cls = 1;
    else breakdown.cls = 0;
  } else {
    breakdown.cls = 1;
  }

  // 7. TTI (0-4)
  if (noSite) {
    breakdown.tti = 4;
  } else if (lead.tti_ms !== null && lead.tti_ms !== undefined) {
    if (lead.tti_ms > 7000) breakdown.tti = 4;
    else if (lead.tti_ms > 5000) breakdown.tti = 3;
    else if (lead.tti_ms > 3500) breakdown.tti = 2;
    else if (lead.tti_ms > 2000) breakdown.tti = 1;
    else breakdown.tti = 0;
  } else {
    breakdown.tti = 2;
  }

  // 8. Tech stack freshness (0-5)
  const techStack = lead.tech_stack || [];
  const hasOutdated = techStack.some(t => OUTDATED_TECH.has(t));
  const hasModern = techStack.some(t => MODERN_TECH.has(t));
  if (noSite) {
    breakdown.tech_freshness = 5;
  } else if (hasOutdated && !hasModern) {
    breakdown.tech_freshness = 5;
  } else if (hasOutdated && hasModern) {
    breakdown.tech_freshness = 3;
  } else if (!hasModern) {
    breakdown.tech_freshness = 2;
  } else {
    breakdown.tech_freshness = 0;
  }
  if (hasOutdated) services.push('website');

  // 9. SSL (0-2)
  if (noSite) {
    breakdown.ssl = 2;
  } else if (lead.has_ssl === false) {
    breakdown.ssl = 2;
  } else if (lead.has_ssl === null) {
    breakdown.ssl = 1;
  } else {
    breakdown.ssl = 0;
  }

  // 10. Mobile responsive (0-5)
  if (noSite) {
    breakdown.mobile_responsive = 5;
    services.push('website');
  } else if (lead.has_viewport_meta === false || lead.mobile_friendly === false) {
    breakdown.mobile_responsive = 5;
    services.push('website');
  } else if (lead.mobile_friendly === null) {
    breakdown.mobile_responsive = 2;
  } else {
    breakdown.mobile_responsive = 0;
  }

  // 11. Accessibility (0-4)
  if (noSite) {
    breakdown.accessibility = 4;
  } else if (lead.has_alt_tags === false) {
    breakdown.accessibility = 3;
  } else if (lead.has_alt_tags === null) {
    breakdown.accessibility = 2;
  } else {
    breakdown.accessibility = 1;
  }

  // 12. SEO basics (0-5)
  if (noSite) {
    breakdown.seo_basics = 5;
  } else {
    let seoScore = 0;
    if (lead.has_meta_description === false) seoScore += 2;
    else if (lead.has_meta_description === null) seoScore += 1;
    if (lead.has_og_tags === false) seoScore += 2;
    else if (lead.has_og_tags === null) seoScore += 1;
    breakdown.seo_basics = Math.min(seoScore, 5);
  }

  // 13. Image optimization (0-3)
  if (noSite) {
    breakdown.image_optimization = 3;
  } else if (lead.image_optimization_score !== null && lead.image_optimization_score !== undefined) {
    if (lead.image_optimization_score < 30) breakdown.image_optimization = 3;
    else if (lead.image_optimization_score < 60) breakdown.image_optimization = 2;
    else if (lead.image_optimization_score < 85) breakdown.image_optimization = 1;
    else breakdown.image_optimization = 0;
  } else {
    breakdown.image_optimization = 1;
  }

  // 14. No mobile app (0-4)
  const needsApp = APP_NICHES.has(nicheLower) || [...APP_NICHES].some(n => nicheLower.includes(n));
  if (!lead.has_mobile_app && needsApp && lead.rating && lead.rating >= 3.5) {
    breakdown.no_app = 4;
    services.push('mobile_app');
  } else if (!lead.has_mobile_app && needsApp) {
    breakdown.no_app = 2;
    services.push('mobile_app');
  } else {
    breakdown.no_app = 0;
  }

  // 15. No web app / portal (0-4)
  const needsWebApp = WEBAPP_NICHES.has(nicheLower) || [...WEBAPP_NICHES].some(n => nicheLower.includes(n));
  if (lead.has_online_booking === false && needsWebApp) {
    breakdown.no_web_app = 4;
    services.push('booking_system');
    services.push('web_app');
  } else if (needsWebApp && !lead.has_online_booking) {
    breakdown.no_web_app = 2;
    services.push('web_app');
  } else {
    breakdown.no_web_app = 0;
  }

  // 16. Social media gaps (0-4)
  const socials = lead.social_links || {};
  let socialGaps = 0;
  if (!socials.facebook) socialGaps++;
  if (!socials.instagram) socialGaps++;
  if (!socials.linkedin) socialGaps++;
  breakdown.social_gaps = Math.min(socialGaps + (socialGaps >= 3 ? 1 : 0), 4);

  // 17. Business health (0-5) - High rating + bad site = GOLD
  if (lead.rating && lead.rating >= 4.5 && lead.review_count > 20) {
    if (noSite || (lead.page_speed_score !== null && lead.page_speed_score < 50)) {
      breakdown.business_health = 5; // Jackpot
    } else if (lead.page_speed_score !== null && lead.page_speed_score < 80) {
      breakdown.business_health = 3;
    } else {
      breakdown.business_health = 1;
    }
  } else if (lead.rating && lead.rating >= 4.0) {
    breakdown.business_health = noSite ? 4 : 2;
  } else if (lead.rating && lead.rating >= 3.5) {
    breakdown.business_health = noSite ? 3 : 1;
  } else {
    breakdown.business_health = 0;
  }

  // 18. Review volume (0-4) - More reviews = established = has budget
  if (lead.review_count >= 100) breakdown.review_volume = 4;
  else if (lead.review_count >= 50) breakdown.review_volume = 3;
  else if (lead.review_count >= 20) breakdown.review_volume = 2;
  else if (lead.review_count >= 5) breakdown.review_volume = 1;
  else breakdown.review_volume = 0;

  // 19. Contact reachability (0-5)
  let contactScore = 0;
  if ((lead.emails || []).length > 0) contactScore += 3;
  if (lead.phone) contactScore += 2;
  breakdown.contact_reachability = Math.min(contactScore, 5);

  // 20. Online booking (0-3)
  if (lead.has_online_booking === false && needsWebApp) {
    breakdown.online_booking = 3;
    if (!services.includes('booking_system')) services.push('booking_system');
  } else if (lead.has_online_booking === null && needsWebApp) {
    breakdown.online_booking = 1;
  } else {
    breakdown.online_booking = 0;
  }

  // 21. Content freshness (0-3)
  if (noSite) {
    breakdown.content_freshness = 3;
  } else if (lead.content_freshness_year !== null && lead.content_freshness_year !== undefined) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - lead.content_freshness_year;
    if (age >= 4) breakdown.content_freshness = 3;
    else if (age >= 2) breakdown.content_freshness = 2;
    else if (age >= 1) breakdown.content_freshness = 1;
    else breakdown.content_freshness = 0;
  } else {
    breakdown.content_freshness = 1;
  }

  // 22. Structured data (0-2)
  if (noSite) {
    breakdown.structured_data = 2;
  } else if (lead.has_structured_data === false) {
    breakdown.structured_data = 2;
  } else if (lead.has_structured_data === null) {
    breakdown.structured_data = 1;
  } else {
    breakdown.structured_data = 0;
  }

  // 23. PWA capability (0-2)
  if (noSite) {
    breakdown.pwa = 2;
  } else if (lead.has_pwa === false) {
    breakdown.pwa = 2;
  } else if (lead.has_pwa === null) {
    breakdown.pwa = 1;
  } else {
    breakdown.pwa = 0;
  }

  // Calculate total
  const score = Math.min(100, Object.values(breakdown).reduce((sum, v) => sum + v, 0));

  // Deduplicate services
  const uniqueServices = [...new Set(services)];

  // Auto-suggest additional services based on data
  if (!lead.has_website && !uniqueServices.includes('website')) uniqueServices.push('website');
  if (hasOutdated && !uniqueServices.includes('website')) uniqueServices.push('website');

  return {
    score: Math.round(score),
    breakdown,
    services: uniqueServices,
  };
}
