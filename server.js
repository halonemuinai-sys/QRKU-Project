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
            dotsColor = '#6a11cb',
            dotsType = 'rounded',
            gradientType = 'linear',
            gradientColor2 = '#2575fc',
            logoUrl,
            hideBackgroundDots = true
        } = req.body;

        if (!firstName) return res.status(400).json({ error: 'First name is required' });

        const shortId = nanoid(6);

        // Save to Supabase
        const { data, error } = await supabase
            .from('dynamic_links')
            .insert([{
                short_id: shortId,
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
                logo_url: logoUrl
            }]);

        if (error) throw error;

        const dynamicUrl = `http://localhost:${port}/v/${shortId}`;

        const qrOptions = {
            width: 1000,
            height: 1000,
            data: dynamicUrl,
            margin: 20,
            dotsOptions: {
                color: dotsColor,
                type: dotsType,
                gradient: {
                    type: gradientType,
                    rotation: 0,
                    colorStops: [
                        { offset: 0, color: dotsColor },
                        { offset: 1, color: gradientColor2 }
                    ]
                }
            },
            backgroundOptions: { color: "#ffffff" },
            imageOptions: { 
                crossOrigin: "anonymous", 
                margin: 10, 
                imageSize: 0.4,
                hideBackgroundDots: hideBackgroundDots
            }
        };

        if (logoUrl) {
            // If it's a local URL, we can use the local path for better performance
            if (logoUrl.startsWith('http://localhost')) {
                const fileName = logoUrl.split('/').pop();
                qrOptions.image = path.join(__dirname, uploadDir, fileName);
            } else {
                qrOptions.image = logoUrl;
            }
        }

        const qrCode = new QRCodeCanvas(qrOptions);
        const buffer = await qrCode.toBuffer('png');

        res.type('png');
        res.send(buffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/v/:shortId', async (req, res) => {
    try {
        const { shortId } = req.params;
        const { data, error } = await supabase
            .from('dynamic_links')
            .select('*')
            .eq('short_id', shortId)
            .single();

        if (error || !data) return res.status(404).send('Contact not found');

        supabase.from('dynamic_links').update({ scan_count: data.scan_count + 1 }).eq('id', data.id).then();

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

app.listen(port, () => {
    console.log(`🚀 Project Barcode API (Dynamic + Uploads) running at http://localhost:${port}`);
});
