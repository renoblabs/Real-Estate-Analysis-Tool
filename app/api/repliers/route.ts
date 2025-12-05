import { NextRequest, NextResponse } from 'next/server';

const REPLIERS_API_KEY = process.env.REPLIERS_API_KEY;
const REPLIERS_BASE_URL = 'https://api.repliers.io';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const listingId = searchParams.get('listingId');
        const mlsNumber = searchParams.get('mlsNumber');

        if (!listingId && !mlsNumber) {
            return NextResponse.json(
                { error: 'Either listingId or mlsNumber is required' },
                { status: 400 }
            );
        }

        if (!REPLIERS_API_KEY) {
            return NextResponse.json(
                { error: 'Repliers API key not configured' },
                { status: 500 }
            );
        }

        // Fetch listing from Repliers API
        const endpoint = listingId
            ? `${REPLIERS_BASE_URL}/listings/${listingId}`
            : `${REPLIERS_BASE_URL}/listings?mlsNumber=${mlsNumber}`;

        const response = await fetch(endpoint, {
            headers: {
                'REPLIERS-API-KEY': REPLIERS_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Repliers API error:', errorText);
            return NextResponse.json(
                { error: `Repliers API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // If searching by MLS number, the response might be an array
        const listing = Array.isArray(data) ? data[0] : data;

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        // Helper to map Repliers property type to our internal type
        const mapPropertyType = (type: string): string => {
            const t = type?.toLowerCase() || '';
            if (t.includes('duplex')) return 'duplex';
            if (t.includes('triplex')) return 'triplex';
            if (t.includes('fourplex')) return 'fourplex';
            if (t.includes('multi')) return 'multi_unit_5plus';
            return 'single_family'; // Default fallback
        };

        // Helper to parse price/numbers safely
        const parseNumber = (val: any): number => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const clean = val.replace(/[$,\s]/g, '');
                return parseFloat(clean) || 0;
            }
            return 0;
        };

        // Map Repliers data to our property format
        const mappedData = {
            address: listing.address?.streetAddress || '',
            city: listing.address?.city || '',
            province: listing.address?.state || listing.address?.province || 'ON', // Default to ON if missing
            postal_code: listing.address?.zip || listing.address?.postalCode || '',
            property_type: mapPropertyType(listing.property?.type),
            bedrooms: parseNumber(listing.property?.bedrooms),
            bathrooms: parseNumber(listing.property?.bathrooms),
            square_feet: parseNumber(listing.property?.area || listing.property?.livingArea),
            lot_size: parseNumber(listing.lot?.lotSizeArea),
            year_built: parseNumber(listing.property?.yearBuilt),
            purchase_price: parseNumber(listing.listPrice),
            monthly_rent: parseNumber(listing.estimatedRent), // If available
            property_tax_annual: parseNumber(listing.tax?.annualAmount),
            hoa_fees: parseNumber(listing.association?.fee),
            images: listing.photos?.map((photo: any) => photo.href) || [],
            description: listing.remarks || listing.publicRemarks || '',
            mls_number: listing.mlsId || listing.listingId || '',
            listing_url: listing.listingUrl || '',
        };

        return NextResponse.json({
            success: true,
            data: mappedData,
            raw: listing, // Include raw data for debugging
        });

    } catch (error) {
        console.error('Error fetching from Repliers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listing data' },
            { status: 500 }
        );
    }
}
