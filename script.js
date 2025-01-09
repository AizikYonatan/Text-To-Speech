document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const speedControl = document.getElementById('speedControl');
    const pitchControl = document.getElementById('pitchControl');
    const volumeControl = document.getElementById('volumeControl');
    const generateBtn = document.getElementById('generateBtn');
    const playBtn = document.getElementById('playBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Speech synthesis setup
    const synth = window.speechSynthesis;
    let selectedVoice = null;

    // Create voice selection dropdown
    const voiceSelect = document.createElement('select');
    voiceSelect.id = 'voiceSelect';
    voiceSelect.className = 'voice-dropdown';
    document.querySelector('.voice-selection').appendChild(voiceSelect);

    // Function to load and display available voices
    function loadVoices() {
        const voices = synth.getVoices();
        
        // Clear existing options
        voiceSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a voice...';
        defaultOption.value = '';
        voiceSelect.appendChild(defaultOption);
        
        // Add all available voices
        voices.forEach(voice => {
            if (voice.lang.includes('en')) {  // Only show English voices
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.value = voice.name;
                voiceSelect.appendChild(option);
            }
        });
    }

    // Initialize voices
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    // Voice selection change handler
    voiceSelect.addEventListener('change', (e) => {
        const voices = synth.getVoices();
        selectedVoice = voices.find(voice => voice.name === e.target.value);
        
        // Preview the selected voice
        if (selectedVoice) {
            const utterance = new SpeechSynthesisUtterance("Hello, this is my voice.");
            utterance.voice = selectedVoice;
            synth.cancel();
            synth.speak(utterance);
        }
    });

    // Update character count
    textInput.addEventListener('input', () => {
        charCount.textContent = textInput.value.length;
    });
    
    // Update control values
    speedControl.addEventListener('input', () => {
        document.getElementById('speedValue').textContent = `${speedControl.value}x`;
    });
    
    pitchControl.addEventListener('input', () => {
        document.getElementById('pitchValue').textContent = `${pitchControl.value}x`;
    });
    
    volumeControl.addEventListener('input', () => {
        document.getElementById('volumeValue').textContent = 
            `${Math.round(volumeControl.value * 100)}%`;
    });
    
    // Generate speech
    generateBtn.addEventListener('click', () => {
        if (!textInput.value.trim()) {
            alert('Please enter some text first');
            return;
        }
        if (!selectedVoice) {
            alert('Please select a voice first');
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(textInput.value);
        utterance.voice = selectedVoice;
        utterance.rate = speedControl.value;
        utterance.pitch = pitchControl.value;
        utterance.volume = volumeControl.value;
        
        playBtn.disabled = false;
        downloadBtn.disabled = false;
        
        window.generatedSpeech = utterance;
    });
    
    // Play preview
    playBtn.addEventListener('click', () => {
        if (window.generatedSpeech) {
            synth.cancel();
            synth.speak(window.generatedSpeech);
        }
    });
    
    // Download MP3 (new code)
    downloadBtn.addEventListener('click', async () => {
        if (!window.generatedSpeech) return;
        
        try {
            const response = await fetch('http://localhost:5000/generate-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textInput.value
                })
            });
            
            if (!response.ok) throw new Error('Failed to generate speech');
            
            // Get the blob from the response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'speech.mp3';
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to download MP3. Please try again.');
        }
    });
});
