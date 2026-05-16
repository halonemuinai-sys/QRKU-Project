# Research: BikinQR (Business Card Generator)

## 1. Overview
The goal is to build a fun, Node.js-based application that generates barcodes and QR codes for business cards. This project uses a **Neo-Brutalism** art style (Modern Cartoon) to make the process of creating professional vCards more engaging, playful, and visually striking.

---

## 2. Design Theme: Neo-Brutalism
The application follows the **Neo-Brutalism** (or *Neo-Brutalist*) design philosophy, popularized by modern platforms like Gumroad and Figma.

### Key Characteristics:
*   **High-Contrast Borders**: Thick black strokes (3px+) on all containers and interactive elements.
*   **Hard Shadows**: Non-blurred, offset shadows (`box-shadow: 6px 6px 0px 0px #000`) that give a 2D "pop" effect.
*   **Vibrant Palette**: Use of primary, high-saturation colors (Yellow, Blue, Red) against warm neutral backgrounds.
*   **Micro-Interactions**: Elements that physically "sink" or "press" when clicked, mimicking real-world buttons.
*   **Playful Typography**: Bold, heavy fonts with tight tracking to maintain a strong visual hierarchy.

---

## 3. Recommended Technology Stack

### Backend
*   **Node.js**: Core runtime.
*   **Express.js**: For building the API.
*   **Sharp**: For high-performance image processing.

### Core Libraries
| Library | Purpose | Why it's chosen |
| :--- | :--- | :--- |
| **@loskir/styled-qr-code-node** | Premium QR Styling | Supports gradients, custom shapes, and logo embedding. |
| **vcards-js** | vCard Formatting | Easiest way to format data for phone contact syncing. |
| **Next.js + TailwindCSS** | Frontend UI | For a premium, interactive user dashboard. |
| **Framer Motion** | Animations | Smooth transitions and Neo-brutalist interactions. |

---

## 4. Implementation Details: vCard QR Code
A vCard (Virtual Contact File) allows a user to scan the QR code and immediately see a "Save Contact" prompt on their phone.

### Data Format Example (vCard 3.0)
```text
BEGIN:VCARD
VERSION:3.0
N:Doe;Jane;;;
FN:Jane Doe
ORG:Ares Tech
TITLE:Senior Developer
TEL;TYPE=CELL:+628123456789
EMAIL:jane.doe@example.com
URL:https://project-ares.com
END:VCARD
```

---

## 5. Key Features for "Premium" Experience
1.  **High-Resolution SVG/PDF Export**: Essential for physical printing.
2.  **Custom Branding (Logo Embedding)**: Ability to embed a logo in the center of the QR code with automatic data area clearing.
3.  **Gradients & Custom Shapes**: Support for linear/radial gradients and custom "dot" and "eye" shapes.
4.  **Interactive Real-time Preview**: A sleek UI built with Next.js to see changes instantly.
5.  **Bulk Generation**: Upload a CSV file and generate multiple codes in one go.

---

## 6. Roadmap
- [x] Research & Library selection.
- [x] Initial project setup (Node + Express).
- [x] Development of Styled QR API.
- [x] Frontend Development (Next.js + Neo-Brutalism).
- [x] Framing & Animation (Framer Motion).
- [ ] Bulk Upload (CSV/Excel) integration.
- [ ] Multi-template support.
