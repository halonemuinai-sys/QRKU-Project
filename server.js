require('dotenv').config();
const express = require('express');
const vCardsJS = require('vcards-js');
const { QRCodeCanvas } = require('@loskir/styled-qr-code-node');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { nanoid } = require('nanoid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const UAParser = require('ua-parser-js');

const app = express();
const port = process.env.PORT || 3001;

// 1. Multer Setup for Local Uploads
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Supabase Setup
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { db: { schema: 'barcode' } }
);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir)); // Serve uploaded logos

app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * @api {post} /upload Upload a Logo
 */

app.post('/upload', upload.single('logo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Return the local URL for the frontend to use
    const logoUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    res.json({ url: logoUrl });
});

/**
 * @api {post} /generate Generate a DYNAMIC vCard QR Code
 */
app.post('/generate', async (req, res) => {
    try {
        const { 
            firstName, lastName, organization, phone, email, title, url,
            dotsColor, dotsType, gradientColor2, cornersSquareType, cornersSquareColor,
            cornersDotType, cornersDotColor, backgroundColor, logoUrl, hideBackgroundDots
        } = req.body;

        const shortId = nanoid(6);

        console.log("Generating vCard QR for:", firstName, lastName);
        
        const userId = req.headers['x-user-id'];

        const { data, error } = await supabase
            .from('dynamic_links')
            .insert([{
                short_id: shortId,
                type: 'vcard',
                user_id: userId || null,
                first_name: firstName,
                last_name: lastName,
                organization: organization,
                position: title,
                phone: phone,
                email: email,
                website: url,
                dots_color: dotsColor,
                gradient_color: gradientColor2,
                dots_type: dotsType,
                corners_square_type: cornersSquareType,
                corners_square_color: cornersSquareColor,
                corners_dot_type: cornersDotType,
                corners_dot_color: cornersDotColor,
                background_color: backgroundColor,
                logo_url: logoUrl,
                hide_background_dots: hideBackgroundDots
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            throw error;
        }

        console.log("Record saved. Generating buffer...");
        const dynamicUrl = `http://localhost:${port}/v/${shortId}`;
        const buffer = await generateQrBuffer(dynamicUrl, req.body);
        
        console.log("Buffer generated. Sending response.");


        res.type('png');
        res.send(buffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/generate-basic', async (req, res) => {
    try {
        const { 
            data: qrData, type = 'link', rawData,
            dotsColor, dotsType, gradientColor2, cornersSquareType, cornersSquareColor,
            cornersDotType, cornersDotColor, backgroundColor, logoUrl, hideBackgroundDots
        } = req.body;

        const shortId = nanoid(6);

        const userId = req.headers['x-user-id'];

        // Save to DB for Gallery
        const { error } = await supabase
            .from('dynamic_links')
            .insert([{
                short_id: shortId,
                type: type,
                user_id: userId || null,
                raw_data: rawData || { content: qrData },
                dots_color: dotsColor,
                gradient_color: gradientColor2,
                dots_type: dotsType,
                corners_square_type: cornersSquareType,
                corners_square_color: cornersSquareColor,
                corners_dot_type: cornersDotType,
                corners_dot_color: cornersDotColor,
                background_color: backgroundColor,
                logo_url: logoUrl,
                hide_background_dots: hideBackgroundDots
            }]);

        if (error) throw error;

        // Dynamic link for tracking
        const dynamicUrl = `http://localhost:3001/v/${shortId}`;
        const buffer = await generateQrBuffer(dynamicUrl, req.body);
        
        res.type('png');
        res.send(buffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper to generate QR Buffer
async function generateQrBuffer(qrData, options) {
    const { 
        dotsColor = '#000000', dotsType = 'rounded', gradientColor2 = '#000000',
        cornersSquareType = 'extra-rounded', cornersSquareColor = '#000000',
        cornersDotType = 'dot', cornersDotColor = '#000000',
        backgroundColor = '#ffffff', logoUrl, hideBackgroundDots = true
    } = options;

    const qrOptions = {
        width: 1000, height: 1000, data: qrData, margin: 20,
        dotsOptions: {
            color: dotsColor, type: dotsType,
            gradient: {
                type: 'linear', rotation: 0,
                colorStops: [{ offset: 0, color: dotsColor }, { offset: 1, color: gradientColor2 }]
            }
        },
        cornersSquareOptions: { type: cornersSquareType, color: cornersSquareColor },
        cornersDotOptions: { type: cornersDotType, color: cornersDotColor },
        backgroundOptions: { color: backgroundColor },
        imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: 0.4, hideBackgroundDots: hideBackgroundDots }
    };

    if (logoUrl) {
        if (logoUrl.startsWith('http://localhost')) {
            const fileName = logoUrl.split('/').pop();
            qrOptions.image = path.join(__dirname, uploadDir, fileName);
        } else {
            qrOptions.image = logoUrl;
        }
    }

    const qrCode = new QRCodeCanvas(qrOptions);
    return await qrCode.toBuffer('png');
}

/**
 * @api {get} /v/:shortId Redirect to Digital Profile Landing Page
 */
app.get('/v/:shortId', async (req, res) => {
    const { shortId } = req.params;
    console.log(`[SCAN ATTEMPT] ShortID: ${shortId}`);

    try {
        const { data, error } = await supabase
            .from('dynamic_links')
            .select('*')
            .eq('short_id', shortId)
            .single();

        if (error || !data) {
            console.error(`[SCAN ERROR] Link not found: ${shortId}`);
            return res.status(404).send('Contact not found');
        }

        // Async logging with Geo and UA parsing
        const logScan = async () => {
            try {
                const userAgent = req.headers['user-agent'] || 'Unknown';
                const parser = new UAParser(userAgent);
                const ua = parser.getResult();
                
                // Get IP (Handle various environments)
                let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
                if (Array.isArray(ip)) ip = ip[0];
                if (ip === '::1' || ip === '127.0.0.1' || !ip) ip = '8.8.8.8'; 

                let geoData = { city: 'Unknown', country: 'Unknown', lat: 0, lon: 0 };
                try {
                    // Added timeout and better error handling
                    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 3000 });
                    if (geoRes.data && geoRes.data.status === 'success') {
                        geoData = {
                            city: geoRes.data.city,
                            country: geoRes.data.country,
                            lat: geoRes.data.lat,
                            lon: geoRes.data.lon
                        };
                    }
                } catch (e) { console.error("Geo API Error:", e.message); }

                const { error: logError } = await supabase.from('scan_logs').insert([{ 
                    link_id: data.id, 
                    user_agent: userAgent,
                    ip_address: ip,
                    city: geoData.city,
                    country: geoData.country,
                    lat: geoData.lat,
                    lon: geoData.lon,
                    os: ua.os.name || 'Unknown',
                    browser: ua.browser.name || 'Unknown'
                }]);
                
                if (logError) console.error("Supabase Scan Log Error:", logError);

                const { error: updError } = await supabase.from('dynamic_links')
                    .update({ scan_count: (data.scan_count || 0) + 1 })
                    .eq('id', data.id);
                
                if (updError) console.error("Update scan_count error:", updError);
                
                console.log(`[SCAN SUCCESS] Link: ${shortId}, IP: ${ip}, City: ${geoData.city}`);
            } catch (err) { console.error("Fatal logging error:", err); }
        };

        // Don't await logScan, so the user gets redirected immediately
        logScan();

        // Redirect Logic based on type
        if (data.type === 'vcard') {
            return res.redirect(`http://localhost:3000/v/${shortId}`);
        } else if (data.type === 'link' || data.type === 'whatsapp' || data.type === 'instagram' || data.type === 'tiktok') {
            const targetUrl = data.raw_data?.content || data.raw_data?.url || `https://wa.me/${data.raw_data?.waNumber}`;
            // If it's a social media/wa type, reconstruct the URL if content is missing
            let finalUrl = data.raw_data?.content || data.raw_data?.url;
            
            if (data.type === 'whatsapp') {
                const cleanNumber = data.raw_data?.waNumber?.replace(/[^0-9+]/g, '');
                const message = encodeURIComponent(data.raw_data?.waMessage || '');
                finalUrl = `https://wa.me/${cleanNumber}?text=${message}`;
            } else if (data.type === 'instagram') {
                finalUrl = `https://instagram.com/${data.raw_data?.igUsername?.replace('@', '')}`;
            } else if (data.type === 'tiktok') {
                finalUrl = `https://tiktok.com/@${data.raw_data?.ttUsername?.replace('@', '')}`;
            }

            return res.redirect(finalUrl || '/');
        } else if (data.type === 'maps') {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${data.raw_data?.lat},${data.raw_data?.lon}`;
            return res.redirect(mapsUrl);
        }

        // Fallback for unknown types
        return res.redirect(`http://localhost:3000/v/${shortId}`);
    } catch (error) {
        console.error("Critical redirect error:", error);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @api {get} /api/contact/:shortId Get contact data as JSON
 */
app.get('/api/contact/:shortId', async (req, res) => {
    try {
        const { shortId } = req.params;
        const { data, error } = await supabase
            .from('dynamic_links')
            .select('*')
            .eq('short_id', shortId)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Contact not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @api {get} /api/contact/:shortId/download Download vCard file
 */
app.get('/api/contact/:shortId/download', async (req, res) => {
    try {
        const { shortId } = req.params;
        const { data, error } = await supabase
            .from('dynamic_links')
            .select('*')
            .eq('short_id', shortId)
            .single();

        if (error || !data) return res.status(404).send('Contact not found');

        const vCard = vCardsJS();
        vCard.firstName = data.first_name;
        vCard.lastName = data.last_name;
        vCard.organization = data.organization;
        vCard.title = data.position;
        vCard.workPhone = data.phone;
        vCard.email = data.email;
        vCard.url = data.website;

        const vCardString = vCard.getFormattedString();
        const fileName = `${data.first_name}_${data.last_name || ''}.vcf`.replace(/\s+/g, '_');

        res.setHeader('Content-Type', 'text/vcard');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(vCardString);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/analytics', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];

        // Get user's link IDs first
        let linkIds = [];
        if (userId) {
            const { data: userLinks, error: uLinkErr } = await supabase
                .from('dynamic_links')
                .select('id')
                .eq('user_id', userId);
            
            if (uLinkErr) console.error("Error fetching user links:", uLinkErr);
            linkIds = (userLinks || []).map(l => l.id);
            console.log(`User ${userId} has ${linkIds.length} links.`);
        }

        let logsQuery = supabase
            .from('scan_logs')
            .select('scanned_at, os, city, country, lat, lon, link_id')
            .order('scanned_at', { ascending: true });

        // Filter logs only if user has links. If no links, return empty instead of all logs.
        if (userId) {
            if (linkIds.length > 0) {
                logsQuery = logsQuery.in('link_id', linkIds);
            } else {
                return res.json({ chartData: [], osDistribution: [], mapMarkers: [], topCards: [], totalScans: 0 });
            }
        }

        const { data: logs, error: logError } = await logsQuery;
        if (logError) throw logError;

        // Daily Scans
        const dailyData = logs.reduce((acc, log) => {
            const date = new Date(log.scanned_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const chartData = Object.entries(dailyData).map(([name, scans]) => ({ name, scans }));

        // OS Distribution
        const osData = logs.reduce((acc, log) => {
            const name = log.os || 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        const osDistribution = Object.entries(osData).map(([name, value]) => ({ name, value }));

        // Map Markers
        const mapMarkers = logs.filter(l => l.lat && l.lon).map(l => ({
            position: [l.lat, l.lon],
            city: l.city,
            country: l.country
        }));

        let topQuery = supabase
            .from('dynamic_links')
            .select('first_name, last_name, scan_count')
            .order('scan_count', { ascending: false })
            .limit(5);

        if (userId) topQuery = topQuery.eq('user_id', userId);

        const { data: topCards, error: cardError } = await topQuery;

        if (cardError) throw cardError;

        res.json({ 
            chartData, 
            osDistribution,
            mapMarkers,
            topCards, 
            totalScans: logs.length 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @api {get} /gallery Get all saved QRs
 */

app.get('/gallery', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        let query = supabase
            .from('dynamic_links')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) query = query.eq('user_id', userId);

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @api {delete} /gallery Delete all QRs
 */
app.delete('/gallery', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        let query = supabase.from('dynamic_links').delete();
        if (userId) {
            query = query.eq('user_id', userId);
        } else {
            query = query.not('id', 'is', null);
        }
        const { error } = await query;
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/gallery/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('dynamic_links').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(port, () => {
    console.log(`🚀 Project Barcode API (Dynamic + Uploads) running at http://localhost:${port}`);
});


