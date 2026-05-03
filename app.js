const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = Vex.Flow;

// Musical notes configuration - Bass and Treble clef range
const NOTES = [
    // Bass clef notes (C2-B3)
    { name: 'C', octave: 2, keys: ['C/2'], frequency: 65.41 },
    { name: 'D', octave: 2, keys: ['D/2'], frequency: 73.42 },
    { name: 'E', octave: 2, keys: ['E/2'], frequency: 82.41 },
    { name: 'F', octave: 2, keys: ['F/2'], frequency: 87.31 },
    { name: 'G', octave: 2, keys: ['G/2'], frequency: 98.00 },
    { name: 'A', octave: 2, keys: ['A/2'], frequency: 110.00 },
    { name: 'B', octave: 2, keys: ['B/2'], frequency: 123.47 },
    { name: 'C', octave: 3, keys: ['C/3'], frequency: 130.81 },
    { name: 'D', octave: 3, keys: ['D/3'], frequency: 146.83 },
    { name: 'E', octave: 3, keys: ['E/3'], frequency: 164.81 },
    { name: 'F', octave: 3, keys: ['F/3'], frequency: 174.61 },
    { name: 'G', octave: 3, keys: ['G/3'], frequency: 196.00 },
    { name: 'A', octave: 3, keys: ['A/3'], frequency: 220.00 },
    { name: 'B', octave: 3, keys: ['B/3'], frequency: 246.94 },
    // Treble clef notes (C4-C5)
    { name: 'C', octave: 4, keys: ['C/4'], frequency: 261.63 },
    { name: 'D', octave: 4, keys: ['D/4'], frequency: 293.66 },
    { name: 'E', octave: 4, keys: ['E/4'], frequency: 329.63 },
    { name: 'F', octave: 4, keys: ['F/4'], frequency: 349.23 },
    { name: 'G', octave: 4, keys: ['G/4'], frequency: 392.00 },
    { name: 'A', octave: 4, keys: ['A/4'], frequency: 440.00 },
    { name: 'B', octave: 4, keys: ['B/4'], frequency: 493.88 },
    { name: 'C', octave: 5, keys: ['C/5'], frequency: 523.25 },
];

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
    initializeStaves();
    generateNewNote();

    document.getElementById('startBtn').addEventListener('click', toggleListening);
    document.getElementById('newNoteBtn').addEventListener('click', generateNewNote);
});

// Helper to determine which clef a note belongs to
function getNoteClef(octave) {
    return octave <= 3 ? 'bass' : 'treble';
}

// Initialize staves once - only called on page load
function initializeStaves() {
    const notationDiv = document.getElementById('notation');

    // Create renderer
    renderer = new Renderer(notationDiv, Renderer.Backends.SVG);
    renderer.resize(600, 350);
    context = renderer.getContext();

    try {
        // Draw treble clef stave
        trebleStave = new Stave(10, 40, 580);
        trebleStave.addClef('treble').setContext(context).draw();

        // Draw bass clef stave
        bassStave = new Stave(10, 180, 580);
        bassStave.addClef('bass').setContext(context).draw();

        // Add labels
        context.fillStyle = '#667eea';
        context.font = 'bold 14px Arial';
        context.fillText('Target', 20, 25);

        context.fillStyle = '#333';
        context.fillText('You Played', 200, 25);

        // Count SVG children - everything after this is notes that can be cleared
        const svg = notationDiv.querySelector('svg');
        if (svg) {
            stavesChildCount = svg.children.length;
        }
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
            // Clear all notes
            while (svg.children.length > stavesChildCount) {
                svg.removeChild(svg.lastChild);
            }
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

        // Add target label
        context.fillStyle = '#667eea';
        context.font = 'bold 14px Arial';
        context.fillText(`Target: ${note.name}${note.octave}`, 20, 335);

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
        const isCorrect = detectedNote.name === targetNote.name && detectedNote.octave === targetNote.octave;

        const detectedStaveRef = detectedClef === 'treble' ? freshTrebleStave : freshBassStave;

        const detectedStaveNote = new StaveNote({
            keys: detectedNote.keys,
            duration: 'q',
        });
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
    targetNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    lastDetectedNote = null;
    renderTargetNote(targetNote);

    // Update feedback based on listening state
    if (isListening) {
        updateFeedback('listening', `Next note: ${targetNote.name}${targetNote.octave}`);
    } else {
        updateFeedback('idle', `Play or sing: ${targetNote.name}${targetNote.octave}`);
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

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = noteNames[noteIndex];

    // Convert to VexFlow format
    let keys = [`${noteName.replace('#', '')}/${octave}`];

    return {
        name: noteName.replace('#', ''),
        octave: octave,
        keys: keys,
        frequency: frequency,
        cents: cents
    };
}

// Handle detected note
function handleDetectedNote(detectedNote, frequency) {
    const isCorrect = detectedNote.name === targetNote.name &&
                     detectedNote.octave === targetNote.octave;

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
            updateFeedback('correct', `Correct! You played ${detectedNote.name}${detectedNote.octave}${centsMessage}`);

            // Mark target note as correct (turn green) and generate new note
            setTimeout(() => {
                markTargetNoteCorrect(targetNote);
                generateNewNote();
            }, 500); // Small delay to show the green match
        } else {
            updateFeedback('incorrect',
                `Not quite. Target: ${targetNote.name}${targetNote.octave}, You: ${detectedNote.name}${detectedNote.octave}`);
        }
    }
}

// Update feedback UI
function updateFeedback(type, message) {
    const feedback = document.getElementById('feedback');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
}
