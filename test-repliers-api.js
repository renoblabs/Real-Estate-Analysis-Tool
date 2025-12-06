#!/usr/bin/env node

/**
 * Repliers API Test Script
 *
 * This script tests the Repliers.io API connection and data retrieval.
 * Usage: node test-repliers-api.js [MLS_NUMBER]
 *
 * Example: node test-repliers-api.js X12531322
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ Error: .env.local file not found');
        console.log('Please create .env.local with your REPLIERS_API_KEY');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
        }
    });
}

loadEnvFile();

const REPLIERS_API_KEY = process.env.REPLIERS_API_KEY;
const REPLIERS_BASE_URL = 'https://api.repliers.io';

// Get MLS number from command line or use default test property
const mlsNumber = process.argv[2] || 'X12531322';

console.log('🏠 REI OPS - Repliers API Test');
console.log('================================\n');

if (!REPLIERS_API_KEY || REPLIERS_API_KEY.includes('your_repliers_api_key')) {
    console.error('❌ Error: REPLIERS_API_KEY not configured in .env.local');
    console.log('\nPlease update .env.local with your actual Repliers API key.');
    console.log('Get your API key from: https://repliers.io\n');
    process.exit(1);
}

console.log(`✓ API Key found: ${REPLIERS_API_KEY.substring(0, 8)}...`);
console.log(`✓ Testing with MLS Number: ${mlsNumber}\n`);

async function testRepliersAPI() {
    try {
        const endpoint = `${REPLIERS_BASE_URL}/listings?mlsNumber=${mlsNumber}`;

        console.log(`🔍 Fetching from: ${endpoint}\n`);

        const response = await fetch(endpoint, {
            headers: {
                'REPLIERS-API-KEY': REPLIERS_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:');
            console.error(errorText);
            return;
        }

        const data = await response.json();
        const listing = Array.isArray(data) ? data[0] : data;

        if (!listing) {
            console.error('❌ No listing found for MLS number:', mlsNumber);
            return;
        }

        console.log('✅ Success! Listing data retrieved:\n');
        console.log('Raw Response Structure:');
        console.log('=======================');
        console.log(JSON.stringify(listing, null, 2));
        console.log('\n');

        // Test the data mapping
        console.log('Mapped Data for REI OPS:');
        console.log('========================');

        const formatAddress = (addr) => {
            if (!addr) return '';
            if (addr.streetAddress) return addr.streetAddress;
            if (addr.streetNumber && addr.streetName) {
                return `${addr.streetNumber} ${addr.streetName} ${addr.streetSuffix || ''}`.trim();
            }
            if (addr.address) return addr.address;
            return '';
        };

        const parseNumber = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const clean = val.replace(/[$,\s]/g, '');
                return parseFloat(clean) || 0;
            }
            return 0;
        };

        const mapped = {
            address: formatAddress(listing.address),
            city: listing.address?.city || '',
            province: listing.address?.state || listing.address?.province || 'ON',
            postal_code: listing.address?.zip || listing.address?.postalCode || '',
            purchase_price: parseNumber(listing.listPrice),
            bedrooms: parseNumber(listing.property?.bedrooms),
            bathrooms: parseNumber(listing.property?.bathrooms),
            square_feet: parseNumber(listing.property?.area || listing.property?.livingArea),
            year_built: parseNumber(listing.property?.yearBuilt),
            property_tax_annual: parseNumber(listing.tax?.annualAmount),
        };

        console.log(JSON.stringify(mapped, null, 2));
        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:');
        console.error(error);
    }
}

testRepliersAPI();
