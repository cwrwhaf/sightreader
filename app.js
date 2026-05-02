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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateNewNote();

    document.getElementById('startBtn').addEventListener('click', toggleListening);
    document.getElementById('newNoteBtn').addEventListener('click', generateNewNote);
});

// Helper to determine which clef a note belongs to
function getNoteClef(octave) {
    return octave <= 3 ? 'bass' : 'treble';
}

// VexFlow rendering
function renderNotation(note, detectedNote = null) {
    const notationDiv = document.getElementById('notation');
    notationDiv.innerHTML = '';

    try {
        const renderer = new Renderer(notationDiv, Renderer.Backends.SVG);
        renderer.resize(700, 350);
        const context = renderer.getContext();

        // Draw treble clef stave
        const trebleStave = new Stave(10, 40, 300);
        trebleStave.addClef('treble').setContext(context).draw();

        // Draw bass clef stave
        const bassStave = new Stave(10, 180, 300);
        bassStave.addClef('bass').setContext(context).draw();

        // Draw treble stave for detected note
        const trebleStave2 = new Stave(350, 40, 300);
        trebleStave2.addClef('treble').setContext(context).draw();

        // Draw bass clef stave for detected note
        const bassStave2 = new Stave(350, 180, 300);
        bassStave2.addClef('bass').setContext(context).draw();

        // Determine which stave to use for target note
        const targetClef = getNoteClef(note.octave);
        const targetStaveRef = targetClef === 'treble' ? trebleStave : bassStave;

        // Draw target note
        const targetStaveNote = new StaveNote({
            keys: note.keys,
            duration: 'w',
        });
        targetStaveNote.setStyle({
            fillStyle: '#667eea',
            strokeStyle: '#667eea'
        });

        const targetVoice = new Voice({ num_beats: 4, beat_value: 4 });
        targetVoice.addTickables([targetStaveNote]);
        new Formatter().joinVoices([targetVoice]).format([targetVoice], 250);
        targetVoice.draw(context, targetStaveRef);

        // If we have a detected note, render it on the right side
        if (detectedNote) {
            const detectedClef = getNoteClef(detectedNote.octave);
            const detectedStaveRef = detectedClef === 'treble' ? trebleStave2 : bassStave2;
            const isCorrect = detectedNote.name === note.name && detectedNote.octave === note.octave;

            const detectedStaveNote = new StaveNote({
                keys: detectedNote.keys,
                duration: 'w',
            });
            detectedStaveNote.setStyle({
                fillStyle: isCorrect ? '#28a745' : '#dc3545',
                strokeStyle: isCorrect ? '#28a745' : '#dc3545'
            });

            const detectedVoice = new Voice({ num_beats: 4, beat_value: 4 });
            detectedVoice.addTickables([detectedStaveNote]);
            new Formatter().joinVoices([detectedVoice]).format([detectedVoice], 250);
            detectedVoice.draw(context, detectedStaveRef);
        }

        // Add labels
        context.fillStyle = '#667eea';
        context.font = 'bold 14px Arial';
        context.fillText(`Target: ${note.name}${note.octave}`, 20, 30);

        if (detectedNote) {
            const isCorrect = detectedNote.name === note.name && detectedNote.octave === note.octave;
            context.fillStyle = isCorrect ? '#28a745' : '#dc3545';
            context.fillText(`You: ${detectedNote.name}${detectedNote.octave}`, 360, 30);
        }
    } catch (error) {
        console.error('Rendering error:', error);
        // If rendering fails, show error message
        notationDiv.innerHTML = '<p style="color: red; padding: 20px;">Rendering error. Please refresh.</p>';
    }
}

// Generate a new random note
function generateNewNote() {
    targetNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    lastDetectedNote = null;
    renderNotation(targetNote);
    updateFeedback('idle', `Play or sing: ${targetNote.name}${targetNote.octave}`);
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
        lastDetectedNote = null;
        renderNotation(targetNote);
        updateFeedback('idle', `Play or sing: ${targetNote.name}${targetNote.octave}`);
        document.getElementById('detectedNote').textContent = '';
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

    // Only re-render if the note changed
    if (noteChanged) {
        lastDetectedNote = detectedNote;
        renderNotation(targetNote, detectedNote);

        // Update feedback
        if (isCorrect) {
            const centsMessage = Math.abs(detectedNote.cents) < 10
                ? ' Perfect pitch!'
                : ` (${Math.abs(detectedNote.cents).toFixed(0)} cents ${detectedNote.cents > 0 ? 'sharp' : 'flat'})`;
            updateFeedback('correct', `Correct! You played ${detectedNote.name}${detectedNote.octave}${centsMessage}`);

            // Auto-generate new note after success
            setTimeout(() => {
                if (isListening) {
                    generateNewNote();
                    lastDetectedNote = null;
                    updateFeedback('listening', 'Great! Now try this one...');
                }
            }, 2000);
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
