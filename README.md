# Janos Abel O. Rawat — Personal Portfolio Website
### BSIT 2A | Camarines Norte State College

---

## Project Overview

A personal portfolio website built with HTML, CSS, JavaScript, PHP, and MySQL. The site showcases academic background, technical skills, project experience, and integrates multiple external APIs with a real database backend via XAMPP.

Structured as a single-page application with smooth scroll navigation:

**Home → Skills → Credentials → Experience → GitHub → Blog → Testimonials → About**

---

## How to Run

### Option 1 — Live Hosted Version (Recommended if XAMPP is unavailable)

Access the portfolio directly online — no setup required:

🌐 **[https://amasonaj.infinityfreeapp.com/?i=1](https://amasonaj.infinityfreeapp.com/?i=1)**

> Use this if you cannot run XAMPP locally or just want a quick preview.

---

### Option 2 — Local Setup via XAMPP

1. Install [XAMPP](https://www.apachefriends.org/)
2. Place the entire project folder inside `C:/xampp/htdocs/`
3. Open XAMPP Control Panel — start **Apache** and **MySQL**
4. Import the database:
   - Go to `http://localhost/phpmyadmin`
   - Click **Import** → select `rawat_portfolio.sql` → click **Go**
5. Open your browser and go to:

```
http://localhost/rawat/index.html
```

> ⚠️ Do NOT open with Live Server or by double-clicking `index.html` — PHP requires XAMPP Apache to run.

---

## File Structure

```
rawat/
│
├── index.html                  ← Main website (all sections)
├── rawat_portfolio.sql                ← Database schema + seed data
├── README.md                   ← Documentation
│
├── css/
│   ├── style.css               ← Core styles, dark/light theme
│   └── additions.css           ← Blog and Testimonials styles
│
├── js/
│   ├── script.js               ← Scroll animations, flip cards, theme toggle
│   └── additions.js            ← API fetches and form transactions
│
├── api/
│   ├── db_config.php           ← MySQL connection (PDO)
│   ├── submit_contact.php      ← Handles contact form POST
│   ├── submit_testimonial.php  ← Handles testimonial form POST
│   └── get_testimonials.php    ← Returns testimonials as JSON
│
└── assets/
    ├── me.jpg                  ← Profile photo (alternate)
    ├── me2.png                 ← Profile photo (main, used in home section)
    ├── me_dark.png             ← Profile photo (dark mode)
    ├── me_light.png            ← Profile photo (light mode)
    └── projects/
        ├── images
```

---

## API Integrations (4 APIs)

### API #1 — GitHub REST API
- **Endpoint:** `https://api.github.com/users/amasonaj`
- **Purpose:** Fetches live public repositories and profile statistics
- **Displays:** Repo cards (name, description, language, stars, forks) and profile stats (repos, followers, following)
- **Location:** Inline `<script>` in `index.html` → `#github` section

### API #2 — OpenWeatherMap API
- **Endpoint:** `https://api.openweathermap.org/data/2.5/weather?q=Daet,PH`
- **Purpose:** Shows real-time weather for Daet, Camarines Norte in the Home section
- **Displays:** Temperature, weather condition, feels-like, and weather icon
- **Location:** Inline `<script>` in `index.html` → `#home` weather widget

### API #3 — EmailJS
- **Purpose:** Sends an email notification to the portfolio owner when the contact form is submitted
- **How it works:** After contact data is saved to MySQL, EmailJS sends a notification to `rawatjanos@gmail.com`
- **Location:** `js/additions.js` → Contact form transaction

### API #4 — Dev.to API
- **Endpoint:** `https://dev.to/api/articles?tag=webdev`
- **Purpose:** Fetches and displays tech blog articles in the Blog section
- **Displays:** Article cards with title, description, tags, reading time, and reactions
- **Location:** `js/additions.js` → `#blog` section

---

## Transaction Features (2 Transactions)

### Transaction #1 — Contact Form → MySQL
- **Location:** About section → "Send a Message"
- **Fields:** Name, Email, Subject, Message
- **Client-side Validation:**
  - All fields required
  - Valid email format (regex)
  - Message at least 10 characters
- **Server-side:** `api/submit_contact.php` validates, sanitizes, and inserts into `contact_messages` table
- **After success:** EmailJS sends email notification, form resets, success message shown
- **Database Table:** `contact_messages`

### Transaction #2 — Testimonial Form → MySQL
- **Location:** Testimonials section → "Leave a Testimonial"
- **Fields:** Full Name, Role/Relation, Message, Star Rating (1–5)
- **Client-side Validation:**
  - Name and role required
  - Message at least 15 characters
  - Star rating must be selected
- **Server-side:** `api/submit_testimonial.php` validates and inserts into `testimonials` table
- **After success:** Testimonial wall refreshes from database instantly, new entry appears with avatar initials and stars
- **Database Table:** `testimonials`

---

## Database

- **Name:** `rawat_portfolio`

| Table | Columns | Purpose |
|---|---|---|
| `contact_messages` | id, from_name, from_email, subject, message, submitted_at, is_read | Stores contact form submissions |
| `testimonials` | id, name, role, message, rating, submitted_at, is_approved | Stores peer testimonials |

---

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 | Styling, animations, responsive layout, dark/light theme |
| JavaScript ES6+ | DOM interaction, fetch API, form validation |
| PHP 8 | Server-side validation and database operations |
| MySQL | Relational database for persistent data storage |
| XAMPP | Local development server (Apache + MySQL) |
| GitHub API | Live repository and profile data |
| OpenWeatherMap API | Real-time local weather |
| EmailJS | Contact form email notification |
| Dev.to API | Tech blog article feed |

---

## Portfolio Sections

| Section | Content |
|---|---|
| Home | Introduction, weather widget, typing animation, social links (Facebook, LinkedIn, Email, Phone) |
| Skills | 12 technologies as interactive 3D flip cards |
| Credentials | Elementary, High School, and College education cards |
| Experience | 9 academic and personal projects in a card grid with modal previews |
| GitHub | Live repos and profile stats via GitHub API |
| Blog | Tech articles via Dev.to API |
| Testimonials | Public testimonial wall + submission form (Transaction #2) |
| About | Personal background, contact info, contact form (Transaction #1) |

---

## Projects (Experience Section)

| # | Project | Course | Year | Stack |
|---|---|---|---|---|
| 1 | SmarChair 3D Prototype | Intro to HCI | 2025 | Blender |
| 2 | Teacher Dashboard Prototype | Intro to HCI | 2025 | Figma |
| 3 | MuseoLink – Museum Mobile App | Application Development | 2025 | Java, Android Studio, Figma |
| 4 | Calculator Application | Application Development | 2025 | Java, Android Studio |
| 5 | Music Player System | Data Structures & Algorithms | 2025 | Java, IntelliJ IDEA |
| 6 | File Manager System | Computer Programming II | 2025 | Java, IntelliJ IDEA |
| 7 | Unggoy Ungguyan – Ascii Game | Data Structures & Algorithms | 2025 | Java, VS Code |
| 8 | Parkners – Management System | Data Structures & Algorithms | 2025 | Java, VS Code |
| 9 | Oceanshore Beach Resort – Website | Intro to Programming | 2024 | HTML, CSS, JavaScript |
| 10 | KwarTrack – Financial Tracking System | Computer Programming I | 2024 | Java |

---

## UI Features

- Dark / Light theme toggle
- Scroll progress bar
- Custom cursor dot
- Typing animation in hero section
- 3D flip skill cards
- Scroll-triggered fade-up animations
- Project modal with screenshot gallery
- Back-to-top button
- Responsive layout

---

## Author

**Janos Abel O. Rawat**
2nd Year BSIT Student — Camarines Norte State College

- 📧 rawatjanos@gmail.com
- 📱 0992 368 2100
- 📍 Daet, Camarines Norte
- 🔗 [LinkedIn](https://www.linkedin.com/in/janos-rawat-450a6b3a8/)
- 🐙 [GitHub](https://github.com/amasonaj)
