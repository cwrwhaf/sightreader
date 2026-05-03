const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = Vex.Flow;

// All chromatic notes with sharps and flats (bass and treble range)
const ALL_NOTES = [
    // Bass clef notes (C2-B3)
    { name: 'C', octave: 2, keys: ['C/2'], frequency: 65.41 },
    { name: 'C#', octave: 2, keys: ['C#/2'], frequency: 69.30 },
    { name: 'Db', octave: 2, keys: ['Db/2'], frequency: 69.30 },
    { name: 'D', octave: 2, keys: ['D/2'], frequency: 73.42 },
    { name: 'D#', octave: 2, keys: ['D#/2'], frequency: 77.78 },
    { name: 'Eb', octave: 2, keys: ['Eb/2'], frequency: 77.78 },
    { name: 'E', octave: 2, keys: ['E/2'], frequency: 82.41 },
    { name: 'F', octave: 2, keys: ['F/2'], frequency: 87.31 },
    { name: 'F#', octave: 2, keys: ['F#/2'], frequency: 92.50 },
    { name: 'Gb', octave: 2, keys: ['Gb/2'], frequency: 92.50 },
    { name: 'G', octave: 2, keys: ['G/2'], frequency: 98.00 },
    { name: 'G#', octave: 2, keys: ['G#/2'], frequency: 103.83 },
    { name: 'Ab', octave: 2, keys: ['Ab/2'], frequency: 103.83 },
    { name: 'A', octave: 2, keys: ['A/2'], frequency: 110.00 },
    { name: 'A#', octave: 2, keys: ['A#/2'], frequency: 116.54 },
    { name: 'Bb', octave: 2, keys: ['Bb/2'], frequency: 116.54 },
    { name: 'B', octave: 2, keys: ['B/2'], frequency: 123.47 },

    { name: 'C', octave: 3, keys: ['C/3'], frequency: 130.81 },
    { name: 'C#', octave: 3, keys: ['C#/3'], frequency: 138.59 },
    { name: 'Db', octave: 3, keys: ['Db/3'], frequency: 138.59 },
    { name: 'D', octave: 3, keys: ['D/3'], frequency: 146.83 },
    { name: 'D#', octave: 3, keys: ['D#/3'], frequency: 155.56 },
    { name: 'Eb', octave: 3, keys: ['Eb/3'], frequency: 155.56 },
    { name: 'E', octave: 3, keys: ['E/3'], frequency: 164.81 },
    { name: 'F', octave: 3, keys: ['F/3'], frequency: 174.61 },
    { name: 'F#', octave: 3, keys: ['F#/3'], frequency: 185.00 },
    { name: 'Gb', octave: 3, keys: ['Gb/3'], frequency: 185.00 },
    { name: 'G', octave: 3, keys: ['G/3'], frequency: 196.00 },
    { name: 'G#', octave: 3, keys: ['G#/3'], frequency: 207.65 },
    { name: 'Ab', octave: 3, keys: ['Ab/3'], frequency: 207.65 },
    { name: 'A', octave: 3, keys: ['A/3'], frequency: 220.00 },
    { name: 'A#', octave: 3, keys: ['A#/3'], frequency: 233.08 },
    { name: 'Bb', octave: 3, keys: ['Bb/3'], frequency: 233.08 },
    { name: 'B', octave: 3, keys: ['B/3'], frequency: 246.94 },

    // Treble clef notes (C4-C5)
    { name: 'C', octave: 4, keys: ['C/4'], frequency: 261.63 },
    { name: 'C#', octave: 4, keys: ['C#/4'], frequency: 277.18 },
    { name: 'Db', octave: 4, keys: ['Db/4'], frequency: 277.18 },
    { name: 'D', octave: 4, keys: ['D/4'], frequency: 293.66 },
    { name: 'D#', octave: 4, keys: ['D#/4'], frequency: 311.13 },
    { name: 'Eb', octave: 4, keys: ['Eb/4'], frequency: 311.13 },
    { name: 'E', octave: 4, keys: ['E/4'], frequency: 329.63 },
    { name: 'F', octave: 4, keys: ['F/4'], frequency: 349.23 },
    { name: 'F#', octave: 4, keys: ['F#/4'], frequency: 369.99 },
    { name: 'Gb', octave: 4, keys: ['Gb/4'], frequency: 369.99 },
    { name: 'G', octave: 4, keys: ['G/4'], frequency: 392.00 },
    { name: 'G#', octave: 4, keys: ['G#/4'], frequency: 415.30 },
    { name: 'Ab', octave: 4, keys: ['Ab/4'], frequency: 415.30 },
    { name: 'A', octave: 4, keys: ['A/4'], frequency: 440.00 },
    { name: 'A#', octave: 4, keys: ['A#/4'], frequency: 466.16 },
    { name: 'Bb', octave: 4, keys: ['Bb/4'], frequency: 466.16 },
    { name: 'B', octave: 4, keys: ['B/4'], frequency: 493.88 },
    { name: 'C', octave: 5, keys: ['C/5'], frequency: 523.25 },
];

// Major key signatures (which notes belong to each key)
// Using only keys that VexFlow reliably supports
const KEY_SIGNATURES = {
    'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
    'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
};

const KEY_NAMES = Object.keys(KEY_SIGNATURES);
let currentKey = 'C';
let currentKeyNotes = [];

// Score tracking
let wrongNoteCount = 0;
let bestScore = null;

// App state
let targetNote = null;
let lastDetectedNote = null;
let audioContext = null;
let analyser = null;
let microphone = null;
let isListening = false;
let detectionInterval = null;

// Rendering state (persistent)
let renderer = null;
let context = null;
let trebleStave = null;
let bassStave = null;
let stavesChildCount = 0; // Number of SVG children after drawing staves
let targetNoteChildCount = 0; // Number of SVG children after drawing target note
let currentNoteX = 90; // Starting x position for notes
const noteWidth = 80; // Width allocated per note
const staveEndX = 580; // End of the stave
let lastTargetNoteChildCount = 0; // Track where the last target note ends

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Select key first, before drawing staves
    selectNewKey();

    // Now initialize staves with the selected key
    initializeStaves();

    // Generate first note and update score
    generateNewNote();
    updateScoreDisplay();

    document.getElementById('startBtn').addEventListener('click', toggleListening);
    document.getElementById('newNoteBtn').addEventListener('click', generateNewNote);
});

// Helper to determine which clef a note belongs to
function getNoteClef(octave) {
    return octave <= 3 ? 'bass' : 'treble';
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = wrongNoteCount;
    document.getElementById('bestScore').textContent = bestScore === null ? '-' : bestScore;
}

// Reset score for new page
function resetScore() {
    // Update best score if current is better (lower)
    if (bestScore === null || wrongNoteCount < bestScore) {
        bestScore = wrongNoteCount;
    }
    wrongNoteCount = 0;
    updateScoreDisplay();
}

// Increment wrong note count
function incrementWrongCount() {
    wrongNoteCount++;
    updateScoreDisplay();
}

// Select a new random key
function selectNewKey() {
    const newKey = KEY_NAMES[Math.floor(Math.random() * KEY_NAMES.length)];
    currentKey = newKey;

    // Filter notes from ALL_NOTES that belong to this key
    const keyNotes = KEY_SIGNATURES[currentKey];
    currentKeyNotes = ALL_NOTES.filter(note =>
        keyNotes.includes(note.name)
    );

    console.log(`New key: ${currentKey} major`);
    console.log(`Available notes: ${currentKeyNotes.length}`);
}

// Redraw staves with current key signature
function redrawStaves() {
    const notationDiv = document.getElementById('notation');
    const svg = notationDiv.querySelector('svg');

    // Clear all SVG content
    if (svg) {
        svg.innerHTML = '';
    }

    try {
        // Draw treble clef stave with key signature
        trebleStave = new Stave(10, 40, 580);
        trebleStave.addClef('treble').addKeySignature(currentKey).setContext(context).draw();

        // Draw bass clef stave with key signature
        bassStave = new Stave(10, 180, 580);
        bassStave.addClef('bass').addKeySignature(currentKey).setContext(context).draw();

        // Add labels
        context.fillStyle = '#667eea';
        context.font = 'bold 14px Arial';
        context.fillText('Target', 20, 25);

        context.fillStyle = '#333';
        context.fillText('You Played', 200, 25);

        // Update child count
        if (svg) {
            stavesChildCount = svg.children.length;
        }
    } catch (error) {
        console.error('Error drawing staves with key signature:', currentKey, error);
        // Fallback: draw without key signature
        trebleStave = new Stave(10, 40, 580);
        trebleStave.addClef('treble').setContext(context).draw();

        bassStave = new Stave(10, 180, 580);
        bassStave.addClef('bass').setContext(context).draw();

        if (svg) {
            stavesChildCount = svg.children.length;
        }
    }
}

// Initialize staves once - only called on page load
function initializeStaves() {
    const notationDiv = document.getElementById('notation');

    // Create renderer
    renderer = new Renderer(notationDiv, Renderer.Backends.SVG);
    renderer.resize(600, 350);
    context = renderer.getContext();

    try {
        redrawStaves();
    } catch (error) {
        console.error('Stave initialization error:', error);
    }
}

// Render target note only (called once per new target note)
function renderTargetNote(note, color = '#667eea') {
    try {
        const notationDiv = document.getElementById('notation');
        const svg = notationDiv.querySelector('svg');

        // Check if we need to clear and reset (stave is full)
        if (currentNoteX + noteWidth > staveEndX) {
            currentNoteX = 90; // Reset to start
            // Reset score and select new key
            resetScore();
            selectNewKey();
            console.log(`Starting new page in ${currentKey} major`);
            // Redraw staves with new key signature
            redrawStaves();
        }

        // Store where this target note starts
        lastTargetNoteChildCount = svg ? svg.children.length : stavesChildCount;

        // Create fresh Stave objects for positioning at current x position
        const freshTrebleStave = new Stave(currentNoteX, 40, noteWidth);
        freshTrebleStave.setContext(context);
        const freshBassStave = new Stave(currentNoteX, 180, noteWidth);
        freshBassStave.setContext(context);

        // Draw target note
        const targetClef = getNoteClef(note.octave);
        const targetStaveRef = targetClef === 'treble' ? freshTrebleStave : freshBassStave;

        const targetStaveNote = new StaveNote({
            keys: note.keys,
            duration: 'q', // Quarter note for tighter spacing
        });

        // Add accidental if note has sharp or flat
        if (note.name.includes('#')) {
            targetStaveNote.addModifier(new Accidental('#'), 0);
        } else if (note.name.includes('b')) {
            targetStaveNote.addModifier(new Accidental('b'), 0);
        }

        targetStaveNote.setStyle({
            fillStyle: color,
            strokeStyle: color
        });

        // Format and draw using Voice
        const voice = new Voice({ num_beats: 1, beat_value: 4 });
        voice.addTickables([targetStaveNote]);
        new Formatter().joinVoices([voice]).format([voice], noteWidth - 10);
        voice.draw(context, targetStaveRef);

        // Store child count after target note
        if (svg) {
            targetNoteChildCount = svg.children.length;
        }

        // Don't display target note name - let user figure it out!
        // Will be revealed when they play it correctly

        // Move to next position for next note
        currentNoteX += noteWidth;
    } catch (error) {
        console.error('Error rendering target note:', error);
    }
}

// Render detected note overlay (shows what user played)
function renderDetectedNote(targetNote, detectedNote) {
    try {
        const notationDiv = document.getElementById('notation');
        const svg = notationDiv.querySelector('svg');

        // Clear only detected notes (everything after target note)
        if (svg && targetNoteChildCount > 0) {
            while (svg.children.length > targetNoteChildCount) {
                svg.removeChild(svg.lastChild);
            }
        }

        if (!detectedNote) return;

        // Use the position of the current target note
        const targetNoteX = currentNoteX - noteWidth;

        // Create fresh Stave objects for positioning - same position as target note
        const freshTrebleStave = new Stave(targetNoteX, 40, noteWidth);
        freshTrebleStave.setContext(context);
        const freshBassStave = new Stave(targetNoteX, 180, noteWidth);
        freshBassStave.setContext(context);

        const detectedClef = getNoteClef(detectedNote.octave);
        const isCorrect = areNotesEquivalent(detectedNote, targetNote);

        const detectedStaveRef = detectedClef === 'treble' ? freshTrebleStave : freshBassStave;

        const detectedStaveNote = new StaveNote({
            keys: detectedNote.keys,
            duration: 'q',
        });

        // Add accidental if note has sharp or flat
        if (detectedNote.name.includes('#')) {
            detectedStaveNote.addModifier(new Accidental('#'), 0);
        } else if (detectedNote.name.includes('b')) {
            detectedStaveNote.addModifier(new Accidental('b'), 0);
        }

        detectedStaveNote.setStyle({
            fillStyle: isCorrect ? '#28a745' : '#dc3545',
            strokeStyle: isCorrect ? '#28a745' : '#dc3545'
        });

        // Format and draw using Voice
        const voice = new Voice({ num_beats: 1, beat_value: 4 });
        voice.addTickables([detectedStaveNote]);
        new Formatter().joinVoices([voice]).format([voice], noteWidth - 10);
        voice.draw(context, detectedStaveRef);
    } catch (error) {
        console.error('Error rendering detected note:', error);
    }
}

// Change the last target note to green (when user plays correctly)
function markTargetNoteCorrect(note) {
    try {
        const notationDiv = document.getElementById('notation');
        const svg = notationDiv.querySelector('svg');

        // Remove the last target note and any detected notes
        if (svg) {
            while (svg.children.length > lastTargetNoteChildCount) {
                svg.removeChild(svg.lastChild);
            }
        }

        // Move back to the last position
        const lastNoteX = currentNoteX - noteWidth;

        // Create fresh Stave objects for positioning
        const freshTrebleStave = new Stave(lastNoteX, 40, noteWidth);
        freshTrebleStave.setContext(context);
        const freshBassStave = new Stave(lastNoteX, 180, noteWidth);
        freshBassStave.setContext(context);

        // Draw target note in green
        const targetClef = getNoteClef(note.octave);
        const targetStaveRef = targetClef === 'treble' ? freshTrebleStave : freshBassStave;

        const targetStaveNote = new StaveNote({
            keys: note.keys,
            duration: 'q',
        });

        // Add accidental if note has sharp or flat
        if (note.name.includes('#')) {
            targetStaveNote.addModifier(new Accidental('#'), 0);
        } else if (note.name.includes('b')) {
            targetStaveNote.addModifier(new Accidental('b'), 0);
        }

        targetStaveNote.setStyle({
            fillStyle: '#28a745',
            strokeStyle: '#28a745'
        });

        // Format and draw using Voice
        const voice = new Voice({ num_beats: 1, beat_value: 4 });
        voice.addTickables([targetStaveNote]);
        new Formatter().joinVoices([voice]).format([voice], noteWidth - 10);
        voice.draw(context, targetStaveRef);

        // Restore child count
        if (svg) {
            targetNoteChildCount = svg.children.length;
        }
    } catch (error) {
        console.error('Error marking target note correct:', error);
    }
}


// Generate a new random note
function generateNewNote() {
    if (!currentKeyNotes || currentKeyNotes.length === 0) {
        console.error('No notes available in current key!');
        return;
    }

    targetNote = currentKeyNotes[Math.floor(Math.random() * currentKeyNotes.length)];
    console.log('Generated target note:', targetNote.name + targetNote.octave, 'Freq:', targetNote.frequency);
    lastDetectedNote = null;
    renderTargetNote(targetNote);

    // Update feedback based on listening state (don't reveal the note!)
    if (isListening) {
        updateFeedback('listening', 'New note! Can you play it?');
    } else {
        updateFeedback('idle', 'Click "Start Listening" to begin');
    }

    document.getElementById('detectedNote').textContent = '';
}

// Toggle microphone listening
async function toggleListening() {
    const btn = document.getElementById('startBtn');

    if (!isListening) {
        try {
            await startListening();
            btn.textContent = 'Stop Listening';
            btn.classList.add('listening');
            updateFeedback('listening', 'Listening... play the note!');
        } catch (error) {
            console.error('Error starting microphone:', error);
            updateFeedback('incorrect', 'Could not access microphone. Please grant permission.');
        }
    } else {
        stopListening();
        btn.textContent = 'Start Listening';
        btn.classList.remove('listening');
        // Don't clear lastDetectedNote - keep it visible
        updateFeedback('idle', `Play or sing: ${targetNote.name}${targetNote.octave}`);
    }
}

// Start audio capture and analysis
async function startListening() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);

    isListening = true;
    detectPitch();
}

// Stop audio capture
function stopListening() {
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }

    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    isListening = false;
}

// Pitch detection loop
function detectPitch() {
    detectionInterval = setInterval(() => {
        const buffer = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buffer);

        const frequency = autoCorrelate(buffer, audioContext.sampleRate);

        if (frequency > 0) {
            const detectedNote = frequencyToNote(frequency);
            if (detectedNote) {
                handleDetectedNote(detectedNote, frequency);
            }
        }
    }, 100); // Check every 100ms
}

// Autocorrelation pitch detection algorithm
function autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms = 0;

    // Calculate RMS (root mean square) to detect silence
    for (let i = 0; i < SIZE; i++) {
        const val = buffer[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    // Not enough signal
    if (rms < 0.01) return -1;

    // Find the best correlation
    let lastCorrelation = 1;
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
        let correlation = 0;

        for (let i = 0; i < MAX_SAMPLES; i++) {
            correlation += Math.abs(buffer[i] - buffer[i + offset]);
        }

        correlation = 1 - correlation / MAX_SAMPLES;

        if (correlation > 0.9 && correlation > lastCorrelation) {
            const foundGoodCorrelation = correlation > best_correlation;
            if (foundGoodCorrelation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        }

        lastCorrelation = correlation;
    }

    if (best_correlation > 0.01 && best_offset !== -1) {
        const frequency = sampleRate / best_offset;
        return frequency;
    }

    return -1;
}

// Convert frequency to note name
function frequencyToNote(frequency) {
    // Calculate note from frequency using A4 = 440Hz as reference
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    const roundedNoteNum = Math.round(noteNum);
    const cents = (noteNum - roundedNoteNum) * 100;

    // Accept notes within 50 cents (half semitone) to show user how far off they are
    if (Math.abs(cents) > 50) return null;

    const noteIndex = (roundedNoteNum + 69) % 12;
    const octave = Math.floor((roundedNoteNum + 69) / 12);

    // Get the note names in the current key signature
    const keyNotes = KEY_SIGNATURES[currentKey];

    // Map of note indices to both sharp and flat names
    const noteOptions = {
        0: ['C'],
        1: ['C#', 'Db'],
        2: ['D'],
        3: ['D#', 'Eb'],
        4: ['E'],
        5: ['F'],
        6: ['F#', 'Gb'],
        7: ['G'],
        8: ['G#', 'Ab'],
        9: ['A'],
        10: ['A#', 'Bb'],
        11: ['B']
    };

    // Get all possible names for this pitch
    const possibleNames = noteOptions[noteIndex];

    // Find which name is in the current key signature
    let noteName = possibleNames.find(name => keyNotes.includes(name)) || possibleNames[0];

    // Convert to VexFlow format
    let keys = [`${noteName}/${octave}`];

    const result = {
        name: noteName,
        octave: octave,
        keys: keys,
        frequency: frequency,
        cents: cents
    };

    console.log('frequencyToNote:', frequency.toFixed(1), 'Hz ->', result.name + result.octave);
    return result;
}

// Check if two notes are enharmonically equivalent (e.g., C# and Db)
function areNotesEquivalent(note1, note2) {
    console.log('Comparing:', note1.name + note1.octave, 'vs', note2.name + note2.octave);

    if (note1.octave !== note2.octave) {
        console.log('Different octaves');
        return false;
    }

    // Since frequencyToNote() now returns the correct enharmonic spelling
    // for the current key, we can compare by name directly
    if (note1.name === note2.name) {
        console.log('Names match!');
        return true;
    }

    // Also check if they're enharmonic equivalents by frequency
    // Use larger tolerance since detected frequency varies
    const freqDiff = Math.abs(note1.frequency - note2.frequency);
    console.log('Frequency difference:', freqDiff.toFixed(2), 'Hz');
    return freqDiff < 5;
}

// Handle detected note
function handleDetectedNote(detectedNote, frequency) {
    console.log('Target:', targetNote.name + targetNote.octave, 'Detected:', detectedNote.name + detectedNote.octave);
    const isCorrect = areNotesEquivalent(detectedNote, targetNote);

    // Check if this is a different note than the last one detected
    const noteChanged = !lastDetectedNote ||
                       lastDetectedNote.name !== detectedNote.name ||
                       lastDetectedNote.octave !== detectedNote.octave;

    // Update detected note display with cents deviation
    const centsDisplay = detectedNote.cents >= 0 ? `+${detectedNote.cents.toFixed(0)}` : detectedNote.cents.toFixed(0);
    document.getElementById('detectedNote').textContent =
        `Detected: ${detectedNote.name}${detectedNote.octave} (${frequency.toFixed(1)} Hz, ${centsDisplay} cents)`;

    // Only process when note changes
    if (noteChanged) {
        lastDetectedNote = detectedNote;

        // Show the detected note on the staff
        renderDetectedNote(targetNote, detectedNote);

        // Update feedback
        if (isCorrect) {
            const centsMessage = Math.abs(detectedNote.cents) < 10
                ? ' Perfect pitch!'
                : ` (${Math.abs(detectedNote.cents).toFixed(0)} cents ${detectedNote.cents > 0 ? 'sharp' : 'flat'})`;
            updateFeedback('correct', `Correct! The note was ${detectedNote.name}${detectedNote.octave}${centsMessage}`);

            // Mark target note as correct (turn green) and generate new note
            setTimeout(() => {
                markTargetNoteCorrect(targetNote);
                generateNewNote();
            }, 500); // Small delay to show the green match
        } else {
            incrementWrongCount();
            updateFeedback('incorrect', `Not quite. Try again!`);
        }
    }
}

// Update feedback UI
function updateFeedback(type, message) {
    const feedback = document.getElementById('feedback');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
}
