document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const downloadBtn = document.getElementById('downloadBtn');

    generateBtn.addEventListener('click', async () => {
        // Disable button and show loading
        generateBtn.disabled = true;
        loadingDiv.classList.remove('hidden');
        downloadBtn.classList.add('hidden');

        try {
            const response = await fetch('/api/generate');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Set download link properties
            downloadBtn.href = blobUrl;
            downloadBtn.classList.remove('hidden');
        } catch (error) {
            console.error('Error generating text:', error);
            alert('Failed to generate text. Please try again.');
        } finally {
            // Re-enable button and hide loading
            generateBtn.disabled = false;
            loadingDiv.classList.add('hidden');
        }
    });
});
