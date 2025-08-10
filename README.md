# Ahmed E - Portfolio Website

A modern, interactive portfolio website featuring a phone interface design with multiple apps including a game, video gallery, and contact form.

## 🚀 Features

- **Phone Interface**: Realistic phone design with animated gradient background
- **Interactive Apps**: Multiple app screens including:
  - 🎥 **Video Gallery**: Sample video projects with modal playback
  - 🌐 **XR/VR**: Placeholder for 3D scenes and VR demos
  - 🖼️ **Frames**: Image gallery for still photography
  - 🎮 **Snake Game**: Fully playable HTML5 canvas game
  - ✉️ **Contact Form**: Interactive contact form
  - ℹ️ **About**: Project information
- **Responsive Design**: Works on desktop and mobile devices
- **Vanilla JavaScript**: No framework dependencies, pure vanilla JS
- **Modern CSS**: Custom animations and responsive layouts

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with animations
- **Game Engine**: HTML5 Canvas
- **Server**: Python HTTP Server (for development)

## 📁 Project Structure

```
ahmed-e-portfolio/
├── public/                 # Public assets
│   └── index.html         # Main HTML file
├── src/                    # Source code
│   ├── app.js             # Main application logic
│   ├── styles.css         # All CSS styles
│   ├── components/        # Component files (future use)
│   ├── utils/             # Utility functions (future use)
│   └── assets/            # Media assets
│       ├── images/        # Image files
│       ├── sounds/        # Audio files
│       └── videos/        # Video files
├── package.json           # Project configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.x (for local development server)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ahmed-e-portfolio.git
   cd ahmed-e-portfolio
   ```

2. **Start the development server**
   ```bash
   npm start
   # or
   python3 -m http.server 8000
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000`

## 🎮 How to Use

### Navigation
- **Click/Tap**: Open apps from the home screen
- **ESC Key**: Return to home screen from any app
- **Arrow Keys**: Navigate between app icons (when focused)

### Apps
- **Video App**: Click "Open" to view videos in modal
- **Game App**: Use arrow keys or on-screen buttons to play Snake
- **Contact App**: Fill out the form (currently shows alert)
- **Other Apps**: Browse content and use back button to return

## 🎨 Customization

### Adding New Apps
1. Add app details to the `apps` array in `src/app.js`
2. Create a render function (e.g., `renderNewApp()`)
3. Add the case to `renderAppScreen()`

### Styling
- Modify `src/styles.css` for visual changes
- Add new CSS classes as needed
- Responsive breakpoints are included

### Content
- Update text content in the render functions
- Replace placeholder images/videos in the assets folders
- Modify contact form handling

## 📱 Responsive Design

The website is fully responsive with:
- Mobile-first approach
- Flexible phone interface sizing
- Touch-friendly interactions
- Optimized for various screen sizes

## 🚀 Deployment

### GitHub Pages
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to main branch

### Other Hosting
- Upload all files to your web server
- Ensure `index.html` is in the root directory
- No build process required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Ahmed E**
- Portfolio: [Your Portfolio URL]
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inspired by modern mobile app interfaces
- Built with vanilla JavaScript for performance
- CSS animations and gradients for visual appeal

---

⭐ Star this repository if you found it helpful!
