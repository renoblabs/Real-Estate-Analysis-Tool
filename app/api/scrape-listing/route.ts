import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL is from a supported site
        const supportedSites = ['realtor.ca', 'zillow.com', 'redfin.com'];
        const isSupported = supportedSites.some(site => url.includes(site));

        if (!isSupported) {
            return NextResponse.json(
                { error: 'URL must be from realtor.ca, zillow.com, or redfin.com' },
                { status: 400 }
            );
        }

        // Fetch the listing page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch listing' },
                { status: 500 }
            );
        }

        const html = await response.text();

        // Parse the HTML to extract property details
        const propertyData = parseListingHTML(html, url);

        return NextResponse.json(propertyData);
    } catch (error: any) {
        console.error('Scraping error:', error);
        return NextResponse.json(
            { error: 'Failed to scrape listing: ' + error.message },
            { status: 500 }
        );
    }
}

function parseListingHTML(html: string, url: string): any {
    // Simple regex-based parsing (works for most cases)
    // In production, you'd use cheerio or similar for more robust parsing

    const data: any = {
        address: '',
        city: '',
        province: '',
        postal_code: '',
        property_type: 'single_family',
        bedrooms: 0,
        bathrooms: 0,
        square_feet: 0,
        year_built: undefined,
        purchase_price: 0,
    };

    // Realtor.ca specific parsing
    if (url.includes('realtor.ca')) {
        // Extract price
        const priceMatch = html.match(/\$([0-9,]+)/);
        if (priceMatch) {
            data.purchase_price = parseInt(priceMatch[1].replace(/,/g, ''));
        }

        // Extract bedrooms
        const bedroomsMatch = html.match(/(\d+)\s*(?:bed|Bed|bedroom|Bedroom)/i);
        if (bedroomsMatch) {
            data.bedrooms = parseInt(bedroomsMatch[1]);
        }

        // Extract bathrooms
        const bathroomsMatch = html.match(/(\d+(?:\.\d+)?)\s*(?:bath|Bath|bathroom|Bathroom)/i);
        if (bathroomsMatch) {
            data.bathrooms = parseFloat(bathroomsMatch[1]);
        }

        // Extract square feet
        const sqftMatch = html.match(/([0-9,]+)\s*(?:sq\.?\s*ft|sqft|square feet)/i);
        if (sqftMatch) {
            data.square_feet = parseInt(sqftMatch[1].replace(/,/g, ''));
        }

        // Extract address (look for common patterns)
        const addressMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (addressMatch) {
            const fullAddress = addressMatch[1].trim();
            const parts = fullAddress.split(',').map(p => p.trim());

            if (parts.length >= 2) {
                data.address = parts[0];
                data.city = parts[1];

                // Try to extract province from the last part
                if (parts.length >= 3) {
                    const lastPart = parts[parts.length - 1];
                    const provinceMatch = lastPart.match(/\b([A-Z]{2})\b/);
                    if (provinceMatch) {
                        data.province = provinceMatch[1];
                    }
                }
            }
        }

        // Extract year built
        const yearMatch = html.match(/(?:built|Built|Year Built)[:\s]*(\d{4})/i);
        if (yearMatch) {
            data.year_built = parseInt(yearMatch[1]);
        }
    }

    return data;
}
