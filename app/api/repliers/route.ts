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

        // Map Repliers data to our property format
        const mappedData = {
            address: listing.address?.streetAddress || '',
            city: listing.address?.city || '',
            province: listing.address?.state || listing.address?.province || '',
            postal_code: listing.address?.zip || listing.address?.postalCode || '',
            property_type: listing.property?.type || '',
            bedrooms: listing.property?.bedrooms || 0,
            bathrooms: listing.property?.bathrooms || 0,
            square_feet: listing.property?.area || listing.property?.livingArea || 0,
            lot_size: listing.lot?.lotSizeArea || 0,
            year_built: listing.property?.yearBuilt || null,
            purchase_price: listing.listPrice || 0,
            monthly_rent: listing.estimatedRent || 0, // If available
            property_tax: listing.tax?.annualAmount || 0,
            hoa_fees: listing.association?.fee || 0,
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
