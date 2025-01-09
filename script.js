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
    document.querySelector('.voice-selection').insertBefore(voiceSelect, document.querySelector('.voice-grid'));

    // Function to load and display available voices
    function loadVoices() {
        const voices = synth.getVoices();
        
        // Clear existing options
        voiceSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a system voice...';
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

    // Handle voice card selection
    document.querySelectorAll('.voice-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.voice-card').forEach(c => 
                c.classList.remove('selected'));
            card.classList.add('selected');
            
            const voiceType = card.querySelector('.preview-btn').getAttribute('data-voice');
            if (voiceType === 'female') {
                selectedVoice = synth.getVoices().find(v => v.name.includes('female') || v.name.includes('Female'));
            } else {
                selectedVoice = synth.getVoices().find(v => v.name.includes('male') || v.name.includes('Male'));
            }
        });
    });

    // Preview voice buttons
    document.querySelectorAll('.preview-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const voiceType = button.getAttribute('data-voice');
            const utterance = new SpeechSynthesisUtterance("Hello, this is my voice.");
            
            if (voiceType === 'female') {
                utterance.pitch = 1.2;
                utterance.rate = 1.0;
            } else {
                utterance.pitch = 0.8;
                utterance.rate = 0.95;
            }
            
            synth.cancel();
            synth.speak(utterance);
        });
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
    
    downloadBtn.addEventListener('click', () => {
        alert('Download functionality requires server-side implementation');
    });
});
