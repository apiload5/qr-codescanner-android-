document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const canvasContext = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const copyButton = document.getElementById('copy-button');
    const newScanButton = document.getElementById('new-scan-button');
    const openLink = document.getElementById('open-link');
    const scanStatus = document.getElementById('scan-status');
    
    let stream = null;
    let scanning = false;
    let scanInterval = null;
    
    // Start camera when page loads
    setTimeout(startCamera, 1000);
    
    startButton.addEventListener('click', startCamera);
    stopButton.addEventListener('click', stopCamera);
    newScanButton.addEventListener('click', resetScanner);
    
    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(resultText.textContent)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            });
    });
    
    async function startCamera() {
        try {
            scanStatus.textContent = "Starting camera...";
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 640 }
                } 
            });
            
            video.srcObject = stream;
            await video.play();
            
            startButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
            scanStatus.textContent = "Scanning for QR codes...";
            
            startAutoScan();
            
        } catch (error) {
            console.error('Camera error:', error);
            scanStatus.textContent = "Camera access denied. Please allow camera permissions.";
        }
    }
    
    function startAutoScan() {
        scanning = true;
        scanInterval = setInterval(() => {
            if (!scanning || !stream) return;
            
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const size = Math.min(video.videoWidth, video.videoHeight);
                canvas.width = size;
                canvas.height = size;
                
                const offsetX = (video.videoWidth - size) / 2;
                const offsetY = (video.videoHeight - size) / 2;
                canvasContext.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
                
                const imageData = canvasContext.getImageData(0, 0, size, size);
                
                try {
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth',
                    });
                    
                    if (code) {
                        scanStatus.textContent = "QR Code Detected!";
                        displayResult(code.data);
                        stopCamera();
                    }
                } catch (e) {
                    // Continue scanning
                }
            }
        }, 100);
    }
    
    function stopCamera() {
        scanning = false;
        if (scanInterval) {
            clearInterval(scanInterval);
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
    }
    
    function displayResult(text) {
        resultText.textContent = text;
        resultContainer.style.display = 'block';
        
        if (isValidUrl(text)) {
            openLink.href = text;
            openLink.textContent = "Open Link";
            openLink.style.display = "inline-block";
        } else {
            openLink.style.display = "none";
        }
        
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    function resetScanner() {
        resultContainer.style.display = 'none';
        startCamera();
    }
});
