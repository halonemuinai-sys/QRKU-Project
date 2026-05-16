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
        
        const { data, error } = await supabase
            .from('dynamic_links')
            .insert([{
                short_id: shortId,
                type: 'vcard',
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

        // Save to DB for Gallery
        const { error } = await supabase
            .from('dynamic_links')
            .insert([{
                short_id: shortId,
                type: type,
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

        const buffer = await generateQrBuffer(qrData, req.body);
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

app.get('/v/:shortId', async (req, res) => {
    try {
        const { shortId } = req.params;
        const { data, error } = await supabase
            .from('dynamic_links')
            .select('*')
            .eq('short_id', shortId)
            .single();

        if (error || !data) return res.status(404).send('Contact not found');

        // Async logging
        supabase.from('dynamic_links').update({ scan_count: (data.scan_count || 0) + 1 }).eq('id', data.id).then();
        supabase.from('scan_logs').insert([{ 
            link_id: data.id, 
            user_agent: req.headers['user-agent'],
            ip_address: req.ip 
        }]).then();

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
        const { data: logs, error: logError } = await supabase
            .from('scan_logs')
            .select('scanned_at')
            .order('scanned_at', { ascending: true });

        if (logError) throw logError;

        const dailyData = logs.reduce((acc, log) => {
            const date = new Date(log.scanned_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.entries(dailyData).map(([name, scans]) => ({ name, scans }));

        const { data: topCards, error: cardError } = await supabase
            .from('dynamic_links')
            .select('first_name, last_name, scan_count')
            .order('scan_count', { ascending: false })
            .limit(5);

        if (cardError) throw cardError;

        res.json({ chartData, topCards, totalScans: logs.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @api {get} /gallery Get all saved QRs
 */

app.get('/gallery', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('dynamic_links')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @api {delete} /gallery/:id Delete a QR
 */
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


