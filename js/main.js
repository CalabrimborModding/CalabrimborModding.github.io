/**
 * Calabrimbor Interactive Hub JavaScript
 * Controls: CAD Drafting Crosshairs, Schematic Theme Switcher,
 * Tourette's Wave Chart Animator, and the Interactive Terminal.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. SCHEMATIC THEME SWITCHER
    // -----------------------------------------------------------------
    const THEMES = ['blueprint', 'amber', 'green', 'light', 'awareness'];
    let currentThemeIndex = 0;

    function isTourettesAwarenessMonth() {
        if (localStorage.getItem('calabrimbor-force-awareness') === 'true') {
            return true;
        }
        const now = new Date();
        const month = now.getMonth(); // 4 = May, 5 = June
        const day = now.getDate();
        return (month === 4 && day >= 15) || (month === 5 && day <= 15);
    }

    // Inject awareness banner if in Tourette's Awareness Month
    if (isTourettesAwarenessMonth()) {
        const banner = document.createElement('div');
        banner.className = 'awareness-banner';
        banner.innerHTML = `🎗️ May 15 - June 15 is Tourette's Syndrome Awareness Month. Learn more on our <a href="tourettes-awareness.html">Awareness Sheet</a>.`;
        document.body.insertBefore(banner, document.body.firstChild);
    }

    // Load theme from localStorage or use default
    const cachedTheme = localStorage.getItem('calabrimbor-theme');
    if (cachedTheme && THEMES.includes(cachedTheme)) {
        currentThemeIndex = THEMES.indexOf(cachedTheme);
        setTheme(cachedTheme);
    } else if (isTourettesAwarenessMonth()) {
        currentThemeIndex = THEMES.indexOf('awareness');
        setTheme('awareness');
    } else {
        setTheme('blueprint');
    }

    // Inject Theme Switcher Dropdown into Navigation
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const switcherLi = document.createElement('li');
        
        // Wrap select element for custom styling (like custom arrow)
        const selectWrapper = document.createElement('div');
        selectWrapper.className = 'theme-select-wrapper';

        const selectMenu = document.createElement('select');
        selectMenu.className = 'theme-select';
        selectMenu.id = 'theme-select-menu';
        selectMenu.title = 'Select Site Style';

        THEMES.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = `Style: ${getThemeLabel(theme)}`;
            if (theme === THEMES[currentThemeIndex]) {
                option.selected = true;
            }
            selectMenu.appendChild(option);
        });

        selectMenu.addEventListener('change', (e) => {
            const chosenTheme = e.target.value;
            currentThemeIndex = THEMES.indexOf(chosenTheme);
            setTheme(chosenTheme);
        });

        selectWrapper.appendChild(selectMenu);
        switcherLi.appendChild(selectWrapper);
        navLinks.appendChild(switcherLi);
    }

    function setTheme(themeName) {
        // Remove existing theme classes
        THEMES.forEach(theme => {
            if (theme !== 'blueprint') {
                document.documentElement.classList.remove(`theme-${theme}`);
            }
        });

        // Add new class if not default
        if (themeName !== 'blueprint') {
            document.documentElement.classList.add(`theme-${themeName}`);
        }

        // Save
        localStorage.setItem('calabrimbor-theme', themeName);
    }

    function getThemeLabel(themeName) {
        const labels = {
            'blueprint': '🔵 Blue',
            'amber': '🟠 Amber',
            'green': '🟢 Term',
            'light': '⚪ Light',
            'awareness': '🎗️ Teal'
        };
        return labels[themeName] || themeName;
    }


    // -----------------------------------------------------------------
    // 2. CAD-STYLE DRAFTING CROSSHAIRS
    // -----------------------------------------------------------------
    let canvas = document.getElementById('blueprint-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'blueprint-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let mouseX = -9999;
    let mouseY = -9999;
    let isMouseOnScreen = false;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawCrosshairs();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseOnScreen = true;
        drawCrosshairs();
    });

    window.addEventListener('mouseleave', () => {
        isMouseOnScreen = false;
        drawCrosshairs();
    });

    function drawCrosshairs() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Disable rendering on mobile or touchscreens to prioritize performance
        if (window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        if (!isMouseOnScreen || mouseX < 0 || mouseY < 0) {
            return;
        }

        // Get the active primary color from CSS variables dynamically
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00d2ff';

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 0.5;
        
        // Draw crosshair lines
        ctx.globalAlpha = 0.18;
        ctx.setLineDash([5, 5]);

        // Horizontal Line
        ctx.beginPath();
        ctx.moveTo(0, mouseY);
        ctx.lineTo(canvas.width, mouseY);
        ctx.stroke();

        // Vertical Line
        ctx.beginPath();
        ctx.moveTo(mouseX, 0);
        ctx.lineTo(mouseX, canvas.height);
        ctx.stroke();

        // Draw Coordinate Display Badge
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = primaryColor;
        ctx.font = '10px JetBrains Mono, monospace';
        
        const coordsText = `[X: ${mouseX.toFixed(0)}  Y: ${mouseY.toFixed(0)}] px`;
        ctx.fillText(coordsText, mouseX + 14, mouseY + 20);
    }


    // -----------------------------------------------------------------
    // 3. TOURETTE'S FLOW-STATE OSCILLOSCOPE
    // -----------------------------------------------------------------
    const oscSvg = document.getElementById('oscilloscope-svg');
    if (oscSvg) {
        // Draw GridLines inside SVG dynamically
        const gridGroup = oscSvg.querySelector('.svg-grid');
        if (gridGroup) {
            gridGroup.innerHTML = '';
            // Vertical lines
            for (let x = 50; x < 500; x += 50) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x);
                line.setAttribute('y1', 0);
                line.setAttribute('x2', x);
                line.setAttribute('y2', 150);
                line.setAttribute('class', 'svg-grid-line');
                gridGroup.appendChild(line);
            }
            // Horizontal lines
            for (let y = 25; y < 150; y += 25) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', 0);
                line.setAttribute('y1', y);
                line.setAttribute('x2', 500);
                line.setAttribute('y2', y);
                line.setAttribute('class', 'svg-grid-line');
                gridGroup.appendChild(line);
            }
        }

        const ticPath = document.getElementById('tic-wave');
        const focusPath = document.getElementById('focus-wave');
        const toggleBtn = document.getElementById('btn-toggle-focus');
        const statusDot = document.getElementById('vis-status-dot');
        const statusText = document.getElementById('vis-status-text');
        const statTics = document.getElementById('stat-tics-val');
        const statFocus = document.getElementById('stat-focus-val');
        const headerTitle = oscSvg.closest('.focus-visualizer-card').querySelector('.visualizer-title');

        let isFocusMode = false;
        let focusFactor = 0.0; // Interpolates between 0.0 (Standard) and 1.0 (Java Flow state)
        let animationTime = 0;

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                isFocusMode = !isFocusMode;
                if (isFocusMode) {
                    toggleBtn.textContent = 'Release Flow State';
                    toggleBtn.classList.remove('btn-primary');
                    toggleBtn.classList.add('btn-secondary');
                    
                    statusText.textContent = 'FLOW STATE ACTIVE';
                    statusText.style.color = '#10b981';
                    statusDot.classList.add('active');
                    statusDot.classList.remove('blinking');
                    
                    statTics.textContent = 'STABILIZED (0.0/min)';
                    statTics.style.color = '#10b981';
                    statFocus.textContent = 'MAXIMUM (98%)';
                    statFocus.style.color = '#10b981';

                    if (headerTitle) headerTitle.textContent = 'BRAIN WAVE OSCILLOSCOPE [MODE: JAVA_FOCUS]';
                } else {
                    toggleBtn.textContent = 'Engage Java Flow State';
                    toggleBtn.classList.remove('btn-secondary');
                    toggleBtn.classList.add('btn-primary');
                    
                    statusText.textContent = 'TICS ACTIVE';
                    statusText.style.color = 'var(--accent-gold)';
                    statusDot.classList.remove('active');
                    statusDot.classList.add('blinking');
                    
                    statTics.textContent = 'HIGH (8.4/min)';
                    statTics.style.color = '';
                    statFocus.textContent = 'LOW (12%)';
                    statFocus.style.color = '';

                    if (headerTitle) headerTitle.textContent = 'BRAIN WAVE OSCILLOSCOPE [MODE: STANDARD]';
                }
            });
        }

        // Oscilloscope render loop
        function renderOscilloscope() {
            animationTime += 0.04;
            
            // Smoothly ease focusFactor
            const targetFactor = isFocusMode ? 1.0 : 0.0;
            focusFactor += (targetFactor - focusFactor) * 0.08;

            let ticD = `M 0 75`;
            let focusD = `M 0 75`;

            // Draw paths
            for (let x = 0; x <= 500; x += 4) {
                // Tic Wave: highly erratic in standard mode, dampens to near-flatline in focus
                let baseNoise = Math.sin(x * 0.045 - animationTime * 2.5) * 8 + Math.cos(x * 0.08 + animationTime * 3.5) * 5;
                
                // Add sudden spike-tics in standard mode (focusFactor close to 0)
                let spikes = 0;
                let triggerVal = Math.sin(x * 0.012 - animationTime * 0.7);
                if (triggerVal > 0.75) {
                    spikes = Math.sin(x * 0.18 + animationTime * 8) * 32 * Math.sin(animationTime * 1.5);
                }

                const finalTicY = 75 + (baseNoise + spikes) * (1 - focusFactor * 0.96);
                ticD += ` L ${x} ${finalTicY}`;

                // Focus Wave: low and chaotic in standard mode, resolves into a beautiful, high-amplitude sine wave
                let lowDormantNoise = Math.sin(x * 0.08 + animationTime) * 3 + Math.cos(x * 0.15 - animationTime * 2) * 2;
                let stableSine = Math.sin(x * 0.04 - animationTime * 3) * 26;

                const finalFocusY = 75 + (lowDormantNoise * (1 - focusFactor)) + (stableSine * focusFactor);
                focusD += ` L ${x} ${finalFocusY}`;
            }

            if (ticPath) ticPath.setAttribute('d', ticD);
            if (focusPath) focusPath.setAttribute('d', focusD);

            requestAnimationFrame(renderOscilloscope);
        }

        renderOscilloscope();
    }


    // -----------------------------------------------------------------
    // 4. INTERACTIVE FLOATING TERMINAL WIDGET
    // -----------------------------------------------------------------
    // Inject console wrapper card only (removed floating button from bottom right)
    const terminalCardHtml = `
    <div class="terminal-widget-card" id="terminal-widget" style="cursor: text;">
        <div class="terminal-header">
            <div class="terminal-buttons">
                <span class="terminal-btn-dot close" id="terminal-widget-close-dot" style="cursor: pointer;" title="Close Console"></span>
                <span class="terminal-btn-dot minimize"></span>
                <span class="terminal-btn-dot expand"></span>
            </div>
            <span class="terminal-title">calabrimbor@macbook: ~</span>
            <button class="terminal-close-btn" id="terminal-widget-close-btn" title="Close Console" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.25rem; font-family: var(--font-mono); line-height: 1; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
        <div class="terminal-widget-body" id="terminal-widget-body">
            <div class="terminal-log" id="terminal-widget-log">
                <div>Welcome to Calabrimbor's developer console. Press <kbd style="background: var(--bg-card); padding: 2px 5px; border-radius: 3px; font-family: var(--font-mono); border: 1px solid var(--border-color);">\`</kbd> (backtick) to toggle this console. Type <span style="color: var(--primary); font-weight: bold;">help</span> for aliases.</div>
            </div>
            <div class="terminal-input-wrapper">
                <span class="terminal-prompt-prefix">calabrimbor@macbook ~ %</span>
                <input type="text" class="terminal-widget-input" id="terminal-widget-input" autocomplete="off" spellcheck="false" placeholder="type a command...">
            </div>
        </div>
    </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = terminalCardHtml;
    document.body.appendChild(tempDiv.firstElementChild);

    const termInput = document.getElementById('terminal-widget-input');
    const termLog = document.getElementById('terminal-widget-log');
    const termBody = document.getElementById('terminal-widget-body');
    const termWidget = document.getElementById('terminal-widget');
    const closeDot = document.getElementById('terminal-widget-close-dot');
    const closeBtn = document.getElementById('terminal-widget-close-btn');

    function toggleConsole() {
        if (!termWidget) return;
        const isActive = termWidget.classList.toggle('active');
        if (isActive && termInput) {
            setTimeout(() => {
                termInput.focus();
            }, 50);
        }
    }

    // Toggle Console on Backtick (`) keypress
    document.addEventListener('keydown', (e) => {
        // Toggle on backtick (`), unless typing in the chat field or key configuration inputs
        const activeEl = document.activeElement;
        const typingInInput = activeEl && (
            activeEl.tagName === 'INPUT' || 
            activeEl.tagName === 'TEXTAREA' || 
            activeEl.tagName === 'SELECT'
        );
        if (e.key === '`' && !typingInInput) {
            e.preventDefault();
            toggleConsole();
        }
    });

    if (termWidget && termInput) {
        // Close on header controls click
        [closeDot, closeBtn].forEach(el => {
            if (el) {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    termWidget.classList.remove('active');
                });
            }
        });

        // Click inside console focuses input
        termWidget.addEventListener('click', (e) => {
            e.stopPropagation();
            termInput.focus();
        });

        // Close on Escape keypress
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && termWidget.classList.contains('active')) {
                termWidget.classList.remove('active');
            }
        });

        // Close on clicking outside container
        document.addEventListener('click', (e) => {
            if (termWidget.classList.contains('active')) {
                if (!termWidget.contains(e.target)) {
                    termWidget.classList.remove('active');
                }
            }
        });

        // Command submission listener
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandLine = termInput.value.trim();
                termInput.value = '';

                if (commandLine === '') {
                    appendTerminalLine('calabrimbor@macbook ~ % ');
                    return;
                }

                // Echo command back to log
                appendTerminalLine(`calabrimbor@macbook ~ % ${commandLine}`, 'command-echo');
                
                // Process command input
                processTerminalCommand(commandLine);
            }
        });
    }

    function appendTerminalLine(text, className = '') {
        if (!termLog) return;
        const line = document.createElement('div');
        if (className) line.className = className;
        
        if (className === 'system-output') {
            line.innerHTML = text; // Preserves styled system templates (e.g. ASCII art)
        } else {
            line.textContent = text;
        }

        termLog.appendChild(line);
        
        // Ensure scroll keeps pace with input
        if (termBody) {
            termBody.scrollTop = termBody.scrollHeight;
        }
    }

    function processTerminalCommand(rawCommand) {
        const parts = rawCommand.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (cmd) {
            case 'help':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">CALABRIMBOR INTERACTIVE COMMAND CATALOG:</span>
------------------------------------------------------------------
<span style="color: var(--accent-gold); font-weight: bold;">help</span>           - Show this available commands index
<span style="color: var(--accent-gold); font-weight: bold;">neoforge</span>       - Display Java & NeoForge mod development environment specs
<span style="color: var(--accent-gold); font-weight: bold;">scotland</span>       - Display regional developer context & flag
<span style="color: var(--accent-gold); font-weight: bold;">tics</span>           - Explain Tourette's suppression via focus states
<span style="color: var(--accent-gold); font-weight: bold;">setup</span>          - Output shell configurations and aliases setup list
<span style="color: var(--accent-gold); font-weight: bold;">theme [theme]</span>  - Change site style (blueprint | amber | green | light | awareness)
<span style="color: var(--accent-gold); font-weight: bold;">contact</span>        - Show developer transmission channels & form link
<span style="color: var(--accent-gold); font-weight: bold;">social</span>         - Display developer social coordinates & online channels
<span style="color: var(--accent-gold); font-weight: bold;">essentials</span>     - List essential directory links (CB-01 to CB-06)
<span style="color: var(--accent-gold); font-weight: bold;">admin</span>          - Output navigation links to host administrative portal
<span style="color: var(--accent-gold); font-weight: bold;">clear-posts</span>    - Wipes custom published blog post data cache
<span style="color: var(--accent-gold); font-weight: bold;">clear</span>          - Clear terminal logs display
------------------------------------------------------------------
Type command above and press <span style="color: var(--primary); font-weight: bold;">Enter</span> to initialize.`, 'system-output');
                break;

            case 'neoforge':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">NeoForge Development Profile:</span>
-----------------------------
Target Loader : NeoForge 1.21
SDK/Platform  : Java 21 (Temurin JDK distribution)
Build Tool    : Gradle (Kotlin DSL configurations)
Dependencies  : Minecraft Client/Server mappings, official NeoForm mappings
Design Focus  : Mechanical automation, automation blocks, high performance loops`, 'system-output');
                break;

            case 'scotland':
                appendTerminalLine(
`* * * * * * * * * * * * * * * * * * * * * * *
*   *                                   *   *
*     *                               *     *
*       *                           *       *
*         *                       *         *
*           *                   *           *
*             *               *             *
*               *           *               *
*                 *       *                 *
*                   *   *                   *
*                     *                     *
*                   *   *                   *
*                 *       *                 *
*               *           *               *
*             *               *             *
*           *                   *           *
*         *                       *         *
*       *                           *       *
*     *                               *     *
*   *                                   *   *
* * * * * * * * * * * * * * * * * * * * * * *
Developer : Callum
Location  : Scotland, UK 🏴󠁧󠁢󠁳󠁣󠁴󠁿
Status    : Age 24 / System Tinkerer`, 'system-output');
                break;

            case 'tics':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">Tourette's Syndrome & Programming Focus:</span>
-----------------------------
- Tourette's manifests as involuntary physical and vocal tics.
- Focus-induced stability: High levels of analytical activity (such as coding Java structures, writing build configs, or tracking mechanical logic) occupy the motor cortex, reducing tic output close to zero.
- Modding serves as a calming flow state, restoring control and mental peace.`, 'system-output');
                break;

            case 'setup':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">macOS Environment Setup:</span>
-----------------------------
Processor : Apple Silicon (M-series SOC)
Shell     : zsh (macOS Default)
IDE/Code  : Visual Studio Code & IntelliJ IDEA Community Edition
Tinkering : Custom bash scripting, OS tweaking scripts
Core Alias Configs:
  alias gradlew='./gradlew'
  alias runclient='./gradlew runClient'
  alias runserver='./gradlew runServer'
  alias build='./gradlew build'`, 'system-output');
                break;

            case 'contact':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">Developer Transmission Vectors:</span>
-----------------------------
Email Address : <a href="mailto:callum_dev@icloud.com" style="color: var(--primary); text-decoration: underline;">callum_dev@icloud.com</a>
Topic Vectors :
  [VEC-01] - Tourette's & Cognitive Suppressive Focus
  [VEC-02] - Minecraft Mod Development (Java 21, NeoForge)
  [VEC-03] - Tech Tinkering & Shell scripting (macOS/Linux)
  [VEC-04] - General Collaboration & Peer Networking
Direct Link   : <a href="contact.html" style="color: var(--primary); text-decoration: underline;">Open Dedicated Contact Page</a>`, 'system-output');
                break;

            case 'social':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">Developer Social Coordinates:</span>
-----------------------------
GitHub Profile : <a href="https://github.com/CalabrimborModding" target="_blank" style="color: var(--primary); text-decoration: underline;">github.com/CalabrimborModding</a>
Email Address  : <a href="mailto:callum_dev@icloud.com" style="color: var(--primary); text-decoration: underline;">callum_dev@icloud.com</a>
Discord Host   : calabrimbor (developer ID)`, 'system-output');
                break;

            case 'essisal':
            case 'essential':
            case 'essentials':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">Essential Directory Mapping:</span>
-----------------------------
Home Index     : <a href="index.html" style="color: var(--primary); text-decoration: underline;">CB-01 (Index Page)</a>
Projects List  : <a href="projects.html" style="color: var(--primary); text-decoration: underline;">CB-02 (Projects Registry)</a>
Dev Blog Logs  : <a href="blog.html" style="color: var(--primary); text-decoration: underline;">CB-03 (Journal Logs)</a>
Biography Info : <a href="about.html" style="color: var(--primary); text-decoration: underline;">CB-04 (Developer Biography)</a>
TS Awareness   : <a href="tourettes-awareness.html" style="color: var(--primary); text-decoration: underline;">CB-05 (Awareness Sheet)</a>
Contact Portal : <a href="contact.html" style="color: var(--primary); text-decoration: underline;">CB-06 (Contact Transmission)</a>`, 'system-output');
                break;

            case 'theme':
                if (args.length === 0) {
                    appendTerminalLine('Usage: theme [blueprint|amber|green|light|awareness]', 'system-output');
                    break;
                }
                const targetTheme = args[0].toLowerCase();
                if (THEMES.includes(targetTheme)) {
                    currentThemeIndex = THEMES.indexOf(targetTheme);
                    setTheme(targetTheme);
                    
                    // Update dropdown selection if present
                    const selectEl = document.getElementById('theme-select-menu');
                    if (selectEl) {
                        selectEl.value = targetTheme;
                    }
                    
                    appendTerminalLine(`Theme dynamically updated to: ${targetTheme}`, 'system-output');
                } else {
                    appendTerminalLine(`Theme not found: "${targetTheme}". Select from: blueprint, amber, green, light, awareness.`, 'system-output');
                }
                break;

            case 'admin':
                appendTerminalLine(
`<span style="color: var(--primary); font-weight: bold;">Administrative Portal Vector:</span>
-----------------------------
Link: <a href="admin.html" style="color: var(--primary); text-decoration: underline;">Open Admin Dashboard Page</a>
Keycode: 1337 (Access authentication key)`, 'system-output');
                break;

            case 'clear-posts':
                localStorage.removeItem('calabrimbor-custom-posts');
                appendTerminalLine('System database updated: Custom blog post cache cleared.', 'system-output');
                break;

            case 'clear':
                if (termLog) {
                    termLog.innerHTML = '<div>Console logs cleared. Type <span style="color: var(--primary);">help</span> for commands.</div>';
                }
                break;

            default:
                appendTerminalLine(`calabrimbor: command not found: "${cmd}". Type "help" for options.`, 'system-output');
        }
    }

    // -----------------------------------------------------------------
    // 6. DYNAMIC BLUEPRINT CHATBOT WIDGET
    // -----------------------------------------------------------------
    const chatbotHtml = `
    <button class="chat-widget-btn" id="chat-widget-toggle" title="Chat with Calabrimbor AI">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </button>

    <div class="chat-widget-panel" id="chat-widget-panel">
        <div class="chat-widget-header">
            <div class="chat-widget-title-area">
                <span class="chat-status-indicator"></span>
                <span>CALABRIMBOR AI // CB-08</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button class="chat-widget-close" id="chat-settings-toggle" title="AI Configuration" style="font-size: 0.95rem; line-height: 1; border: none; background: none; cursor: pointer; color: var(--text-muted); transition: var(--transition-blueprint); padding: 2px;">⚙️</button>
                <button class="chat-widget-close" id="chat-widget-close" style="font-size: 1.25rem; line-height: 1; border: none; background: none; cursor: pointer; color: var(--text-muted); transition: var(--transition-blueprint); padding: 2px;">×</button>
            </div>
        </div>
        <div class="chat-widget-body" id="chat-widget-body"></div>
        
        <!-- Settings Configuration View -->
        <div class="chat-settings-pane" id="chat-settings-pane" style="display: none; flex: 1; padding: 20px; flex-direction: column; gap: 15px; justify-content: center; background: rgba(10, 25, 47, 0.2);">
            <h3 style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--primary); margin: 0; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">AI Configuration</h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                Connect a Google Gemini API key to enable real-time generative responses to any question. Keys are saved locally in your browser storage.
            </p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--primary);">GEMINI_API_KEY</label>
                <input type="password" id="chat-gemini-key-input" class="chat-input-field" placeholder="Enter Gemini key (AI Studio)..." style="width: 100%;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--primary);">SELECT_MODEL</label>
                <select id="chat-gemini-model-select" style="background: var(--bg-terminal); border: 1px solid var(--border-color); color: var(--text-main); padding: 8px 12px; font-family: var(--font-mono); font-size: 0.8rem; border-radius: var(--border-radius-sm); outline: none; width: 100%;">
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 5px;">
                <button id="chat-settings-save" class="chat-send-btn" style="flex: 1;">Save Key</button>
                <button id="chat-settings-clear" class="chat-send-btn" style="border-color: var(--accent-gold); color: var(--accent-gold);">Clear</button>
            </div>
            <a href="https://aistudio.google.com/" target="_blank" style="font-size: 0.7rem; color: var(--primary); text-decoration: underline; text-align: center; margin-top: 5px;">Get a free API key from Google AI Studio</a>
        </div>

        <div class="chat-suggestions-container" id="chat-suggestions">
            <span class="chat-suggestion-chip" data-query="Minecraft Mods">Minecraft</span>
            <span class="chat-suggestion-chip" data-query="Tourette's Suppression">Tourette's</span>
            <span class="chat-suggestion-chip" data-query="Scotland Location">Scotland</span>
            <span class="chat-suggestion-chip" data-query="Theme Switcher">Themes</span>
            <span class="chat-suggestion-chip" data-query="Contact Me">Contact</span>
        </div>
        <div class="chat-widget-footer" id="chat-widget-footer">
            <form class="chat-input-form" id="chat-input-form">
                <input type="text" class="chat-input-field" id="chat-input-field" placeholder="Ask about modding, coding, etc..." autocomplete="off" required>
                <button type="submit" class="chat-send-btn">Send</button>
            </form>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHtml);

    const chatToggle = document.getElementById('chat-widget-toggle');
    const chatPanel = document.getElementById('chat-widget-panel');
    const chatClose = document.getElementById('chat-widget-close');
    const chatBody = document.getElementById('chat-widget-body');
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input-field');
    const chatSuggestions = document.getElementById('chat-suggestions');
    const chatFooter = document.getElementById('chat-widget-footer');

    // Settings elements
    const settingsToggle = document.getElementById('chat-settings-toggle');
    const settingsPane = document.getElementById('chat-settings-pane');
    const keyInput = document.getElementById('chat-gemini-key-input');
    const modelSelect = document.getElementById('chat-gemini-model-select');
    const saveBtn = document.getElementById('chat-settings-save');
    const clearBtn = document.getElementById('chat-settings-clear');

    let chatHistory = [];
    try {
        const storedHistory = sessionStorage.getItem('calabrimbor-chat-history');
        if (storedHistory) {
            chatHistory = JSON.parse(storedHistory);
        }
    } catch(e) {
        console.error(e);
    }

    // Load configurations from storage
    const savedKey = localStorage.getItem('calabrimbor-gemini-key') || '';
    keyInput.value = savedKey;
    if (savedKey) {
        populateModelsDropdown(savedKey);
    }

    async function populateModelsDropdown(key) {
        if (!modelSelect || !key) return;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
            if (response.ok) {
                const data = await response.json();
                if (data.models && data.models.length > 0) {
                    const validModels = data.models.filter(m => 
                        m.supportedGenerationMethods && 
                        m.supportedGenerationMethods.includes('generateContent')
                    );
                    if (validModels.length > 0) {
                        modelSelect.innerHTML = '';
                        validModels.forEach(m => {
                            const name = m.name.replace('models/', '');
                            const option = document.createElement('option');
                            option.value = name;
                            option.textContent = name;
                            modelSelect.appendChild(option);
                        });
                        const current = localStorage.getItem('calabrimbor-gemini-model');
                        if (current) {
                            modelSelect.value = current;
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error listing models:', e);
        }
    }

    // Toggle Settings panel
    settingsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (settingsPane.style.display === 'none') {
            settingsPane.style.display = 'flex';
            chatBody.style.display = 'none';
            chatSuggestions.style.display = 'none';
            chatFooter.style.display = 'none';
            settingsToggle.textContent = '💬';
            settingsToggle.title = 'Back to Chat';
            // Pre-populate if key exists
            const key = keyInput.value.trim();
            if (key) {
                populateModelsDropdown(key);
            }
        } else {
            settingsPane.style.display = 'none';
            chatBody.style.display = 'flex';
            chatSuggestions.style.display = 'flex';
            chatFooter.style.display = 'flex';
            settingsToggle.textContent = '⚙️';
            settingsToggle.title = 'AI Configuration';
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

    saveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const key = keyInput.value.trim();
        if (key) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Verifying...';
            try {
                // Verify key and list models
                const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
                if (!response.ok) {
                    throw new Error(`Verification request returned status ${response.status}`);
                }
                const data = await response.json();
                if (data.models && data.models.length > 0) {
                    const validModels = data.models.filter(m => 
                        m.supportedGenerationMethods && 
                        m.supportedGenerationMethods.includes('generateContent')
                    );
                    if (validModels.length > 0) {
                        modelSelect.innerHTML = '';
                        validModels.forEach(m => {
                            const name = m.name.replace('models/', '');
                            const option = document.createElement('option');
                            option.value = name;
                            option.textContent = name;
                            modelSelect.appendChild(option);
                        });
                        
                        localStorage.setItem('calabrimbor-gemini-key', key);
                        const selectedModel = modelSelect.value || 'gemini-1.5-flash';
                        localStorage.setItem('calabrimbor-gemini-model', selectedModel);
                        
                        alert(`Gemini key verified successfully! Found ${validModels.length} compatible models.`);
                        settingsToggle.click(); // Toggle back
                    } else {
                        alert('Verified API key, but no text generation models are enabled for it.');
                    }
                } else {
                    alert('API key verification failed: no models returned.');
                }
            } catch (err) {
                console.error(err);
                alert(`Verification failed: ${err.message}. Please verify your API key.`);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Key';
            }
        } else {
            alert('Please enter a key, or click Clear.');
        }
    });

    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        localStorage.removeItem('calabrimbor-gemini-key');
        localStorage.removeItem('calabrimbor-gemini-model');
        keyInput.value = '';
        modelSelect.innerHTML = `
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
        `;
        modelSelect.value = 'gemini-1.5-flash';
        alert('Gemini configurations cleared. Reverting to local offline simulator mode.');
        settingsToggle.click(); // Toggle back
    });

    // Toggle Chat Panel
    chatToggle.addEventListener('click', () => {
        const isOpen = chatPanel.classList.toggle('open');
        chatToggle.classList.toggle('active');
        if (isOpen) {
            chatInput.focus();
            if (chatHistory.length === 0) {
                sendBotResponse("Hello there! I am Callum's virtual workspace avatar. Feel free to ask about my Minecraft mods, Java codebase setup, Tourette's Syndrome, or click a quick topic below!");
            }
        }
    });

    chatClose.addEventListener('click', () => {
        chatPanel.classList.remove('open');
        chatToggle.classList.remove('active');
    });

    // Click inside chatbot focuses input (unless selecting text in message bubbles or clicking buttons)
    chatPanel.addEventListener('click', (e) => {
        e.stopPropagation();
        const clickedElement = e.target.closest('.chat-msg-bubble') || 
                               e.target.closest('.chat-suggestion-chip') || 
                               e.target.closest('.chat-settings-pane') || 
                               e.target.closest('input') || 
                               e.target.closest('button') || 
                               e.target.closest('a');
        if (!clickedElement && settingsPane.style.display === 'none') {
            chatInput.focus();
        }
    });

    // Close on Escape keypress
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatPanel.classList.contains('open')) {
            chatPanel.classList.remove('open');
            chatToggle.classList.remove('active');
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (chatPanel.classList.contains('open') && 
            !chatPanel.contains(e.target) && 
            !chatToggle.contains(e.target)) {
            chatPanel.classList.remove('open');
            chatToggle.classList.remove('active');
        }
    });

    // Render historical messages on start
    function renderHistory() {
        chatBody.innerHTML = '';
        chatHistory.forEach(msg => {
            appendMessageUI(msg.sender, msg.text, msg.time, false);
        });
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    renderHistory();

    function appendMessageUI(sender, text, time, save = true) {
        const row = document.createElement('div');
        row.className = `chat-msg-row ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'chat-msg-bubble';
        bubble.innerHTML = text; // allow HTML anchors/formatting
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'chat-msg-time';
        timeSpan.textContent = time;
        
        bubble.appendChild(timeSpan);
        row.appendChild(bubble);
        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;

        if (save) {
            chatHistory.push({ sender, text, time });
            try {
                sessionStorage.setItem('calabrimbor-chat-history', JSON.stringify(chatHistory));
            } catch(e) {}
        }
    }

    function getFormattedTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function sendBotResponse(text) {
        appendMessageUI('bot', text, getFormattedTime());
    }

    // Process user input
    async function handleUserSendMessage(msgText) {
        appendMessageUI('user', msgText, getFormattedTime());
        
        // Show typing indicator
        const typingRow = document.createElement('div');
        typingRow.className = 'chat-msg-row bot';
        typingRow.id = 'chat-typing-indicator';
        
        const typingBubble = document.createElement('div');
        typingBubble.className = 'chat-msg-bubble';
        typingBubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
        
        typingRow.appendChild(typingBubble);
        chatBody.appendChild(typingRow);
        chatBody.scrollTop = chatBody.scrollHeight;

        const geminiKey = localStorage.getItem('calabrimbor-gemini-key');
        if (geminiKey) {
            try {
                const reply = await queryGemini(msgText, geminiKey);
                const indicator = document.getElementById('chat-typing-indicator');
                if (indicator) indicator.remove();
                sendBotResponse(reply);
            } catch (err) {
                console.error(err);
                const indicator = document.getElementById('chat-typing-indicator');
                if (indicator) indicator.remove();
                sendBotResponse(`Error: ${err.message}. Please verify your API Key in settings (⚙️). <br><br><strong>Fallback reply:</strong> ${matchResponse(msgText)}`);
            }
        } else {
            // Generate response after mock delay
            setTimeout(() => {
                const indicator = document.getElementById('chat-typing-indicator');
                if (indicator) indicator.remove();
                
                const reply = matchResponse(msgText);
                sendBotResponse(reply);
            }, 800 + Math.random() * 600);
        }
    }

    async function queryGemini(userQuery, key) {
        const model = localStorage.getItem('calabrimbor-gemini-model') || 'gemini-1.5-flash';
        // Use stable v1 endpoint since it is widely supported across all regions (e.g. EU) for Gemini 1.5/2.0
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
        
        const rawContents = [];
        // Map history excluding the very last message (which is the current userQuery already saved)
        const historyToInclude = chatHistory.slice(0, -1).slice(-8);
        historyToInclude.forEach(msg => {
            rawContents.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text.replace(/<[^>]*>/g, '') }]
            });
        });
        
        // Add active query
        rawContents.push({
            role: 'user',
            parts: [{ text: userQuery }]
        });

        // Filter and merge contents to guarantee strict role alternation (user <-> model)
        const contents = [];
        rawContents.forEach(item => {
            if (contents.length === 0) {
                contents.push(item);
            } else {
                const prev = contents[contents.length - 1];
                if (prev.role !== item.role) {
                    contents.push(item);
                } else {
                    // Merge text from the same role to prevent consecutive role errors
                    prev.parts[0].text += "\n" + item.parts[0].text;
                }
            }
        });

        // Ensure the contents array starts with a 'user' role as strictly required by Gemini API
        while (contents.length > 0 && contents[0].role !== 'user') {
            contents.shift();
        }

        // We use Prompt Prepending for roleplay system instructions. 
        // This is 100% compatible with the stable v1 API version in all regions.
        const systemPrompt = `You are "Calabrimbor AI", a virtual assistant avatar for Callum's developer portfolio. Callum is a 24-year-old developer from Scotland who builds Minecraft Java mods using NeoForge 1.21. He has Tourette's Syndrome and writes code as a way to calm his motor cortex (tics suppression). Be helpful, smart, technical, and match the retro blueprint/terminal aesthetic of the website. Keep responses concise (under 2-3 paragraphs). You can suggest visiting projects.html, contact.html, about.html, or tourettes-awareness.html where appropriate. If asked about unrelated general topics or questions, answer them normally and accurately, but maintain Callum's helpful technical assistant tone.`;

        if (contents.length > 0 && contents[0].role === 'user') {
            contents[0].parts[0].text = `[System Instructions: ${systemPrompt}]\n\nUser Question: ${contents[0].parts[0].text}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents
            })
        });

        if (!response.ok) {
            let errMsg = response.statusText || "";
            try {
                const errData = await response.json();
                if (errData.error && errData.error.message) {
                    errMsg = errData.error.message;
                }
            } catch (e) {}
            throw new Error(`Gemini API Error: ${response.status} - ${errMsg}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid API response format");
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
            handleUserSendMessage(text);
            chatInput.value = '';
        }
    });

    // Handle suggestion chips
    chatSuggestions.addEventListener('click', (e) => {
        const chip = e.target.closest('.chat-suggestion-chip');
        if (chip) {
            const query = chip.getAttribute('data-query');
            handleUserSendMessage(query);
        }
    });

    function matchResponse(msg) {
        const m = msg.toLowerCase();
        
        if (m.includes('minecraft') || m.includes('mod')) {
            return `I develop Minecraft Java mods using the <strong>NeoForge</strong> API (specifically v1.21). My primary focuses are automation systems, mechanical blocks, and item flow. Explore my project sheets on the <a href="projects.html" style="color: var(--primary); text-decoration: underline;">Projects Page</a>!`;
        }
        if (m.includes('tics') || m.includes('tourette') || m.includes('ts')) {
            return `Tourette's Syndrome causes motor and vocal tics. When coding in Java, Callum experiences a focus-induced calming effect that reduces tics to near zero. I've compiled medical facts, myths, and support groups on the <a href="tourettes-awareness.html" style="color: var(--primary); text-decoration: underline;">Tourette's Awareness Page</a>.`;
        }
        if (m.includes('scotland') || m.includes('where') || m.includes('location')) {
            return `Callum is located in <strong>Scotland, UK</strong> 🏴󠁧󠁢󠁳󠁣󠁴󠁿. If you type the command <code>scotland</code> in the developer console, it will draw a custom ASCII flag representation!`;
        }
        if (m.includes('theme') || m.includes('color') || m.includes('style')) {
            return `You can swap stylesheet layouts instantly! Use the navbar theme select menu, or run command <code>theme [blueprint|amber|green|light|awareness]</code> in the developer terminal. Try them out!`;
        }
        if (m.includes('contact') || m.includes('hire') || m.includes('email') || m.includes('collaborate')) {
            return `Let's collaborate! You can reach out directly via email at <a href="mailto:callum_dev@icloud.com" style="color: var(--primary); text-decoration: underline;">callum_dev@icloud.com</a> or send a structured mail carrier package through the <a href="contact.html" style="color: var(--primary); text-decoration: underline;">Contact Page Form</a>.`;
        }
        if (m.includes('setup') || m.includes('mac') || m.includes('machine') || m.includes('os')) {
            return `Callum runs a MacBook system with Apple Silicon, zsh terminal configurations, and Temurin JDK 21. Try running the <code>setup</code> command in the developer terminal widget to inspect details!`;
        }
        if (m.includes('admin') || m.includes('dashboard') || m.includes('passcode') || m.includes('1337')) {
            return `The administrative dashboard is located at <a href="admin.html" style="color: var(--primary); text-decoration: underline;">admin.html</a>. It uses verification code <code>1337</code> to view system telemetry and publish posts!`;
        }
        if (m.includes('hello') || m.includes('hi') || m.includes('hey') || m.includes('welcome')) {
            return `Greetings! I am Callum's virtual copilot. How can I help you navigate the codebase sheet layout today? Choose a chip below or type away!`;
        }
        
        return `Interesting query! In simulator mode, I can explain Callum's Java Minecraft mods, Tourette's suppression mechanics, Scottish origins, system configuration details, or contact channels.<br><br><em>💡 Hint: To allow me to answer any general question, click the settings icon (⚙️) in the header and input a free Google Gemini API Key!</em>`;
    }
});

