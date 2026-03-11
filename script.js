document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const cursor = document.getElementById("cur");
    const loader = document.getElementById("loader");
    const loaderBar = document.getElementById("loaderBar");
    const sequenceBarBg = document.getElementById("sequenceBarBg");
    const hudMode = document.getElementById("hudMode");
    const navbar = document.getElementById("navbar");
    
    // Acts
    const act1 = document.getElementById("act1");
    const act2 = document.getElementById("act2");
    const act3 = document.getElementById("act3");
    const act4 = document.getElementById("act4");
    const act5 = document.getElementById("act5");
    
    // Canvas & Scrollytelling Setup
    const canvas = document.getElementById("frameCanvas");
    const context = canvas.getContext("2d");
    
    // Frame Settings
    const frameCount = 238;
    const images = new Array(frameCount);
    const imagePath = (index) => `./frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
    
    let loadedImages = 0;
    let sequenceReady = false;
    
    // Handle Canvas Resizing
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (sequenceReady && images[currentFrameIndex]) {
            drawFrame(currentFrameIndex);
        }
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Initial size

    // Draw Function (Object-Fit Contain)
    function drawFrame(index) {
        if (!images[index]) return;
        const img = images[index];
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratios for 'contain'
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio  = Math.min(hRatio, vRatio);
        
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;  
        
        context.drawImage(img, 0,0, img.width, img.height,
                          centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

    // Preload Images
    function checkCompletion() {
        if (sequenceReady) return;
        const progress = (loadedImages / frameCount) * 100;
        loaderBar.style.width = `${progress}%`;
        
        // If all loaded, transition out loader
        if (loadedImages === frameCount) {
            sequenceReady = true;
            setTimeout(() => {
                loader.style.opacity = "0";
                setTimeout(() => loader.style.display = "none", 600);
                // Draw first frame
                drawFrame(0);
            }, 500); // slight delay for aesthetic
        }
    }

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const arrayIndex = i - 1; // 0-indexed array for drawing
        img.onload = () => {
            loadedImages++;
            images[arrayIndex] = img;
            checkCompletion();
        };
        img.onerror = () => {
            console.error("Failed to load frame " + i);
            loadedImages++;
            images[arrayIndex] = null; // Mark as missing
            checkCompletion();
        };
        img.src = imagePath(i);
    }

    // Custom Cursor Logic
    window.addEventListener("mousemove", (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    window.addEventListener("mousedown", () => cursor.classList.add("clicking"));
    window.addEventListener("mouseup", () => cursor.classList.remove("clicking"));

    // Nav Background on scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // SCROLLYTELLING LOGIC
    const scrollyContainer = document.querySelector(".scrolly-container");
    let currentFrameIndex = 0;
    
    function updateScrollytelling() {
        // Calculate scroll bounds for the container
        const rect = scrollyContainer.getBoundingClientRect();
        
        // How far we have scrolled PAST the top of the container
        const scrollPx = -rect.top;
        
        // Total scrollable area (container height - viewport height)
        const maxScroll = rect.height - window.innerHeight;
        
        // Scroll percentage 0 to 1
        let scrollFraction = scrollPx / maxScroll;
        
        // Clamp between 0 and 1
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));
        
        // 1. UPDATE CANVAS FRAME
        if (loadedImages === frameCount) {
            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollFraction * frameCount)
            );
            
            if (frameIndex !== currentFrameIndex) {
                currentFrameIndex = frameIndex;
                requestAnimationFrame(() => drawFrame(frameIndex));
            }
        }
        
        // 2. UPDATE HUD PROGRESS BAR
        sequenceBarBg.style.width = `${scrollFraction * 100}%`;
        
        // 3. UPDATE HUD MODE TEXT
        if (scrollFraction < 0.2) hudMode.textContent = "AUTOBOT MODE";
        else if (scrollFraction < 0.8) hudMode.textContent = "TRANSFORMING...";
        else hudMode.textContent = "VEHICLE MODE";
        
        // 4. TRIGGER ACTS (Based on user scroll %)
        const pct = scrollFraction * 100;
        
        // Act 1 (0-18%)
        if (pct >= 0 && pct < 18) act1.classList.remove('hidden');
        else act1.classList.add('hidden');
        
        // Act 2 (18-40%)
        if (pct >= 18 && pct < 40) act2.classList.remove('hidden');
        else act2.classList.add('hidden');
        
        // Act 3 (40-62%)
        if (pct >= 40 && pct < 62) act3.classList.remove('hidden');
        else act3.classList.add('hidden');
        
        // Act 4 (62-82%)
        if (pct >= 62 && pct < 82) act4.classList.remove('hidden');
        else act4.classList.add('hidden');
        
        // Act 5 (82-100%)
        if (pct >= 82) act5.classList.remove('hidden');
        else act5.classList.add('hidden');
    }

    // Attach scroll listener
    window.addEventListener("scroll", updateScrollytelling);

    // BACKGROUND GENERATION LOGIC
    const hexField = document.getElementById("hexField");
    const hexChars = ['⬡', '◈', '△', '▷'];
    
    for (let i = 0; i < 30; i++) {
        const hex = document.createElement("div");
        hex.className = "hex";
        hex.textContent = hexChars[Math.floor(Math.random() * hexChars.length)];
        hex.style.left = `${Math.random() * 100}vw`;
        hex.style.setProperty('--hd', `${10 + Math.random() * 8}s`);
        hex.style.setProperty('--hdelay', `-${Math.random() * 15}s`);
        hex.style.fontSize = `${8 + Math.random() * 6}px`;
        hexField.appendChild(hex);
    }
});
