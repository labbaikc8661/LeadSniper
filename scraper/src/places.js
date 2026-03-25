import chalk from 'chalk';

/**
 * Google Places API (New) - Text Search
 * Uses the modern Places API endpoint with field masks.
 * The new API returns website, phone, and address in the search response,
 * eliminating the need for separate Place Details calls.
 * Automatically rotates between two API keys when quota is hit.
 */

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.rating',
  'places.userRatingCount',
  'places.formattedAddress',
  'places.websiteUri',
  'places.internationalPhoneNumber',
  'places.googleMapsUri',
].join(',');

export async function searchPlaces(query, config) {
  const keys = [config.google_places_api_key_1, config.google_places_api_key_2].filter(Boolean);

  if (keys.length === 0) {
    throw new Error('No Google Places API keys configured. Add them in Settings or .env.');
  }

  const maxResults = config.scraper_max_results;
  let allPlaces = [];

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const apiKey = keys[keyIndex];

    try {
      // New API supports up to 20 results per request
      // Use pageToken for pagination
      let pageToken = null;

      do {
        const body = {
          textQuery: query,
          maxResultCount: Math.min(20, maxResults - allPlaces.length),
        };
        if (pageToken) {
          body.pageToken = pageToken;
        }

        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': pageToken ? FIELD_MASK + ',nextPageToken' : FIELD_MASK + ',nextPageToken',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000),
        });

        if (response.status === 429 || response.status === 403) {
          console.log(chalk.yellow(`  Key ${keyIndex + 1} hit limit, switching to next key...`));
          pageToken = null;
          break;
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(`Places API error: ${data.error.message}`);
        }

        const results = data.places || [];
        for (const place of results) {
          if (allPlaces.length >= maxResults) break;
          allPlaces.push(parsePlaceResult(place));
        }

        pageToken = data.nextPageToken || null;

        if (allPlaces.length >= maxResults) {
          pageToken = null;
        }

        // Short delay before using page token
        if (pageToken) await sleep(1500);

      } while (pageToken);

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

  // Enrich with computed fields (no extra API calls needed with new API)
  for (const place of allPlaces) {
    place.has_website = !!place.website_url;
    place.whatsapp_link = place.phone ? `https://wa.me/${place.phone.replace(/[^0-9]/g, '')}` : null;
  }

  return allPlaces;
}

function parsePlaceResult(place) {
  return {
    business_name: place.displayName?.text || 'Unknown',
    google_place_id: place.id,
    google_maps_url: place.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${place.id}`,
    rating: place.rating || null,
    review_count: place.userRatingCount || 0,
    address: place.formattedAddress || null,
    website_url: place.websiteUri || null,
    phone: place.internationalPhoneNumber || null,
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
