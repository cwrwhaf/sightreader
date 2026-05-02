# Sight Reader - Pitch Practice App

A browser-based music education tool that displays sheet music notes and listens to your instrument or voice to provide real-time feedback on pitch accuracy.

## Features

- Real-time pitch detection using Web Audio API
- Visual sheet music notation with VexFlow
- Instant feedback on correct/incorrect notes
- Automatic progression to new notes on success
- Works with any instrument or voice
- No installation required - runs in browser

## How to Use

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, or Safari)
2. Click "Start Listening" and grant microphone permission
3. Play or sing the note shown on the staff
4. The app will detect your pitch and show feedback
5. When correct, it automatically generates a new note

## Tech Stack

- **VexFlow** - Music notation rendering
- **Web Audio API** - Microphone input and audio analysis
- **Autocorrelation algorithm** - Pitch detection
- **Vanilla JavaScript** - No build tools required

## Deployment Options

### Option 1: Local Testing
Simply open `index.html` in your browser.

### Option 2: Free Hosting

**Netlify Drop:**
1. Go to https://app.netlify.com/drop
2. Drag and drop this folder
3. Get instant public URL

**GitHub Pages:**
1. Push to GitHub repository
2. Go to Settings > Pages
3. Select main branch
4. Your site will be at `https://username.github.io/SightReader`

**Vercel:**
```bash
npm i -g vercel
vercel
```

## Browser Requirements

- Modern browser with Web Audio API support
- Microphone access
- HTTPS required for microphone (except localhost)

## How It Works

1. **Notation Rendering**: VexFlow draws the target note on a treble clef staff
2. **Audio Capture**: Web Audio API captures microphone input
3. **Pitch Detection**: Autocorrelation algorithm analyzes the audio buffer to determine fundamental frequency
4. **Note Matching**: Converts frequency to note name and compares with target
5. **Visual Feedback**: Displays both target and detected notes with color coding

## Customization Ideas

- Add different note ranges (bass clef, extended range)
- Include sharps and flats
- Add difficulty levels
- Track statistics and progress
- Add rhythm practice mode
- Support chord recognition

## Limitations

- Requires quiet environment for best results
- ~30-50ms latency (acceptable for this use case)
- Mobile Safari may require user interaction before audio starts
