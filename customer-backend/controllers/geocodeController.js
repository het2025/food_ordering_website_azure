import axios from 'axios';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

// Fallback pincode lookup (used ONLY when Nominatim returns no postcode)
const AREA_PINCODES = {
  'alkapuri': '390007', 'sayajigunj': '390005', 'gotri': '390021',
  'akota': '390020', 'manjalpur': '390011', 'tandalja': '390012',
  'subhanpura': '390023', 'makarpura': '390014', 'vasna': '390015',
  'fatehgunj': '390002', 'race course': '390007', 'ellora park': '390023',
  'waghodia': '391760', 'halol': '389350', 'padra': '391440',
  'kareli baug': '390018', 'harni': '390022', 'sama': '390024'
};

const getPincodeFromArea = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [area, pin] of Object.entries(AREA_PINCODES)) {
    if (lower.includes(area)) return pin;
  }
  return null;
};

// Build a meaningful street string from Nominatim address object
const buildStreet = (addr, displayName) => {
  const parts = [];

  // House/building identifiers
  if (addr.house_number) parts.push(addr.house_number);
  if (addr.building)     parts.push(addr.building);

  // Road / lane / path
  if (addr.road)         parts.push(addr.road);
  else if (addr.pedestrian) parts.push(addr.pedestrian);
  else if (addr.footway)    parts.push(addr.footway);

  // Sub-locality / neighbourhood
  if (addr.neighbourhood)  parts.push(addr.neighbourhood);
  else if (addr.quarter)   parts.push(addr.quarter);

  // Suburb / village / city district
  if (addr.suburb)         parts.push(addr.suburb);
  else if (addr.village)   parts.push(addr.village);
  else if (addr.city_district) parts.push(addr.city_district);

  if (parts.length > 0) return parts.join(', ');

  // Last resort: first two comma-segments from display_name
  const segments = (displayName || '').split(',').map(s => s.trim()).filter(Boolean);
  return segments.slice(0, 2).join(', ') || '';
};

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Lat/lng required'
      });
    }

    console.log(`🌍 Geocoding: ${lat}, ${lng}`);

    const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
      params: {
        format: 'json',
        lat: lat,
        lon: lng,
        addressdetails: 1,
        zoom: 18
      },
      headers: { 'User-Agent': 'QuickBite' },
      timeout: 10000
    });

    if (response.data && response.data.address) {
      const data = response.data;
      const addr = data.address;

      // Build street from available Nominatim fields
      const street = buildStreet(addr, data.display_name);

      // ✅ Use Nominatim's postcode FIRST — it is the most accurate source.
      // Only fall back to the area-name lookup if postcode is truly absent.
      const pincode = addr.postcode || getPincodeFromArea(data.display_name) || '';

      // Resolve city: prefer city > town > municipality > county
      const city = addr.city || addr.town || addr.municipality ||
                   addr.county || addr.state_district || '';

      const result = {
        street:      street,
        city:        city,
        state:       addr.state || '',
        pincode:     pincode,
        landmark:    addr.amenity || addr.tourism || addr.shop || '',
        fullAddress: data.display_name
      };

      console.log('✅ Resolved address:', result);
      return res.json({ success: true, data: result });
    }

    res.status(404).json({ success: false, message: 'Address not found' });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, message: 'Geocoding failed' });
  }
};

export const searchAddress = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 3) {
      return res.json({ success: true, data: [] });
    }

    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        format: 'json',
        q: `${query}, Vadodara, Gujarat`,
        limit: 10,
        addressdetails: 1
      },
      headers: { 'User-Agent': 'QuickBite' }
    });

    const results = (response.data || []).map(item => {
      const addr = item.address || {};
      return {
        placeName:    item.name || item.display_name.split(',')[0],
        placeAddress: item.display_name,
        street:       buildStreet(addr, item.display_name),
        city:         addr.city || addr.town || addr.municipality || 'Vadodara',
        state:        addr.state || 'Gujarat',
        pincode:      addr.postcode || getPincodeFromArea(item.display_name) || ''
      };
    });

    res.json({ success: true, data: results });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};
