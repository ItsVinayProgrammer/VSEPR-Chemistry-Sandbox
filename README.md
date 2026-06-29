# VSEPR Chemistry Sandbox
Drop the boring 2D textbooks. We're building molecules in 3D.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)

Welcome to the VSEPR Chemistry Sandbox! I built this to turn learning molecular geometry from a headache into a hands-on, gamified experience. It features real-time 3D rendering, interactive electron cloud lobes, and a bilingual (English/Tamil) architecture designed to help students grasp steric numbers and molecular shapes instantly.

Everything runs fully client-side using vanilla web technologies, with local caching of core library assets to ensure performance without external network blockers.

<img width="1911" height="1001" alt="image" src="https://github.com/user-attachments/assets/25b07c49-bb02-4ebe-b729-7bc3dc17189e" />

---

## Core Features

* **3D Interactive Canvas**: Drag to rotate, scroll to zoom, and interact with high-fidelity molecule meshes.
* **Electron Cloud Overhaul**: Teardrop orbital lobes representing lone pairs, containing two spinning electrons, built accurately with WebGL.
* **Sandbox Builder Mode**: Add or remove single, double, or triple bonds and lone pairs to observe shape deformation in real time.
* **Real Molecules Library**: Explore reference configurations (CO₂, H₂O, NH₃, CH₄, PCl₅, SF₆) instantly.
* **Gamified Challenges**: Put your skills to the test with interactive building challenges, scorecards, progress tracking, and performance feedback.
* **Bilingual Toggle**: Seamless runtime i18n switching between English and Tamil.
* **Interactive reference table**: A lookup sheet with built-in 3D modal explorers for every geometry configuration.

---

## Production Deployment

https://akshaycancode-2.github.io/VSEPR-Chemistry-Sandbox/

Since this is a client-side static application, you don't need compilation steps, backend environments, or server-side setups.

### Deploying to Vercel (Recommended)
1. Push the repository to GitHub.
2. Sign in to your [Vercel Dashboard](https://vercel.com).
3. Select **Add New** and choose **Project**, then import your repository.
4. Set the **Framework Preset** to **Other** and leave build/output settings empty.
5. Click **Deploy**.

### Deploying to Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Go to **Sites**, select **Add new site**, and link your GitHub repository.
3. Leave the **Build command** blank and set the **Publish directory** to `.` (root).
4. Click **Deploy Site**.

### Deploying to GitHub Pages
1. Push your changes to the `main` branch.
2. Go to your repository's **Settings** tab.
3. Select **Pages** from the sidebar.
4. Under **Build and deployment**, set the source branch to `main` and root folder `/`.
5. Click **Save**.
