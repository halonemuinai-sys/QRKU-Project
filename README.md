# 🚀 BikinQR - Neo-Brutalism Edition

Professional vCard & Barcode Generator built with **Node.js**, **Next.js**, and **Neo-Brutalism** art style.

![Theme: Neo-Brutalism](https://img.shields.io/badge/Theme-Neo--Brutalism-ffeb3b?style=for-the-badge&logo=playstation&logoColor=black)
![React: Modern](https://img.shields.io/badge/React-Modern-2196f3?style=for-the-badge&logo=react&logoColor=white)

---

## 🎨 The Theme: Neo-Brutalism
This project uses a **Neo-Brutalism** (Modern Cartoon) aesthetic. It features:
*   **Thick Strokes**: Bold 3px+ black borders.
*   **Hard Shadows**: Offset shadows with 0% blur.
*   **Pop Colors**: High-contrast yellow, blue, and pink.
*   **Interactive UX**: Buttons and inputs that physically "press" when clicked.

---

## ✨ Features
-   **Premium QR Generation**: High-resolution (1000px) vCard QR codes.
-   **Custom Styling**: Change dot patterns, gradients, and background colors.
-   **Logo Support**: Embed your brand logo in the center of the QR.
-   **Real-time Preview**: See your changes instantly as you type.
-   **Print Ready**: Optimized for business card printing (Error Correction H).

---

## 🛠️ Technology Stack
*   **Frontend**: Next.js 15 (App Router), TailwindCSS, Framer Motion.
*   **Backend**: Node.js, Express, @loskir/styled-qr-code-node.
*   **Data Format**: vCard 3.0 via `vcards-js`.

---

## 🚀 Getting Started

### 1. Installation
Install dependencies for both root and client:
```bash
npm install
cd client && npm install
```

### 2. Run Development Server
Run both Backend and Frontend concurrently:
```bash
npm run dev
```
*   **Frontend**: `http://localhost:3000`
*   **Backend API**: `http://localhost:3001`

### 3. API Usage
Generate QR via POST request:
`POST http://localhost:3001/generate`
```json
{
  "firstName": "Aris",
  "lastName": "Setyawan",
  "dotsColor": "#ffeb3b",
  "gradientColor2": "#2196f3"
}
```

---

## 📁 Project Structure
*   `/client`: Next.js frontend application.
*   `server.js`: Node.js Express API.
*   `generate_vcard.js`: Sample standalone script.
*   `RESEARCH_AND_PLAN.md`: Detailed research documentation.

---
Created with ❤️ by Antigravity
