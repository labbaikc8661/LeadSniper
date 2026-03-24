import chalk from 'chalk';

/**
 * Google Places API - Text Search
 * Uses the Places API (New) for better results.
 * Automatically rotates between two API keys when quota is hit.
 */
export async function searchPlaces(query, config) {
  const keys = [config.google_places_api_key_1, config.google_places_api_key_2].filter(Boolean);

  if (keys.length === 0) {
    throw new Error('No Google Places API keys configured. Add them in Settings or .env.');
  }

  const maxResults = config.scraper_max_results;
  let allPlaces = [];
  let nextPageToken = null;

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const apiKey = keys[keyIndex];
    let page = 0;

    try {
      do {
        page++;
        const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
        url.searchParams.set('query', query);
        url.searchParams.set('key', apiKey);
        if (nextPageToken) {
          url.searchParams.set('pagetoken', nextPageToken);
          // Google requires a short delay before using pagetoken
          await sleep(2000);
        }

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
          console.log(chalk.yellow(`  Key ${keyIndex + 1} hit limit, switching to next key...`));
          nextPageToken = null;
          break;
        }

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          throw new Error(`Places API error: ${data.status} - ${data.error_message || ''}`);
        }

        const results = data.results || [];
        for (const place of results) {
          if (allPlaces.length >= maxResults) break;
          allPlaces.push(parsePlaceResult(place));
        }

        nextPageToken = data.next_page_token || null;

        if (allPlaces.length >= maxResults) {
          nextPageToken = null;
        }

      } while (nextPageToken);

      // If we got enough results, stop
      if (allPlaces.length >= maxResults) break;

    } catch (err) {
      if (keyIndex < keys.length - 1) {
        console.log(chalk.yellow(`  Key ${keyIndex + 1} failed: ${err.message}. Trying next key...`));
        continue;
      }
      throw err;
    }
  }

  // For each place, get details (website, phone) if not already present
  const enrichedPlaces = [];
  for (let i = 0; i < allPlaces.length; i++) {
    const place = allPlaces[i];
    if (!place.website_url || !place.phone) {
      const details = await getPlaceDetails(place.google_place_id, keys);
      if (details) {
        place.website_url = place.website_url || details.website || null;
        place.phone = place.phone || details.phone || null;
        place.address = place.address || details.address || null;
      }
    }
    place.has_website = !!place.website_url;
    place.whatsapp_link = place.phone ? `https://wa.me/${place.phone.replace(/[^0-9]/g, '')}` : null;
    enrichedPlaces.push(place);

    // Rate limiting
    if (i < allPlaces.length - 1) {
      const delay = randomDelay(200, 500);
      await sleep(delay);
    }
  }

  return enrichedPlaces;
}

async function getPlaceDetails(placeId, keys) {
  for (const apiKey of keys) {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('fields', 'website,formatted_phone_number,international_phone_number,formatted_address');
      url.searchParams.set('key', apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === 'OVER_QUERY_LIMIT') continue;
      if (data.status !== 'OK') return null;

      return {
        website: data.result?.website || null,
        phone: data.result?.international_phone_number || data.result?.formatted_phone_number || null,
        address: data.result?.formatted_address || null,
      };
    } catch {
      continue;
    }
  }
  return null;
}

function parsePlaceResult(place) {
  return {
    business_name: place.name,
    google_place_id: place.place_id,
    google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    rating: place.rating || null,
    review_count: place.user_ratings_total || 0,
    address: place.formatted_address || null,
    website_url: null, // Filled by details call
    phone: null, // Filled by details call
    has_website: false,
    whatsapp_link: null,
    emails: [],
    social_links: {},
    has_mobile_app: false,
    app_store_url: null,
    play_store_url: null,
    tech_stack: [],
    page_speed_score: null,
    mobile_friendly: null,
    load_time_ms: null,
    pitch_angles: [],
    pitch_summary: null,
    ai_email_draft: null,
    status: 'new',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
