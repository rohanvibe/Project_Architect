document.addEventListener('DOMContentLoaded', () => {
    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW Registered'))
                .catch(err => console.log('SW Failed', err));
        });
    }

    // DOM Elements
    const inputView = document.getElementById('input-view');
    const loadingView = document.getElementById('loading-view');
    const readyView = document.getElementById('ready-view');
    const bottomNav = document.getElementById('bottom-nav');
    const simpleFooter = document.getElementById('simple-footer');

    const generateBtn = document.getElementById('generate-btn');
    const projectIdea = document.getElementById('project-idea');
    const userApiKey = document.getElementById('user-api-key');
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedFields = document.getElementById('advanced-fields');

    const resultProjectName = document.getElementById('result-project-name');
    const aiSummaryList = document.getElementById('ai-summary-list');
    const fileExplorer = document.getElementById('file-explorer');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const restartBtn = document.getElementById('restart-btn');

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    const previewOverlay = document.getElementById('file-preview-overlay');
    const previewFilename = document.getElementById('preview-filename');
    const previewContent = document.getElementById('preview-content');
    const closePreview = document.getElementById('close-preview');

    let currentProjectData = null;

    // --- Persistence ---
    const savedIdea = localStorage.getItem('projectIdea');
    const savedKey = localStorage.getItem('userApiKey');
    if (savedIdea) projectIdea.value = savedIdea;
    if (savedKey) {
        userApiKey.value = savedKey;
        advancedToggle.checked = true;
        advancedFields.classList.remove('hidden');
    }

    // --- Theme Logic ---
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });

    // --- UI Interactions ---
    advancedToggle.addEventListener('change', () => {
        advancedFields.classList.toggle('hidden', !advancedToggle.checked);
    });

    projectIdea.addEventListener('input', () => {
        localStorage.setItem('projectIdea', projectIdea.value);
    });

    userApiKey.addEventListener('input', () => {
        localStorage.setItem('userApiKey', userApiKey.value);
    });

    // --- Generation Logic ---
    generateBtn.addEventListener('click', async () => {
        const idea = projectIdea.value.trim();
        const apiKey = userApiKey.value.trim();

        if (!idea) {
            alert('Please enter a project idea.');
            return;
        }

        // Switch to loading state
        inputView.classList.add('hidden');
        simpleFooter.classList.add('hidden');
        loadingView.classList.remove('hidden');

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea, apiKey })
            });

            const data = await response.json();

            if (response.ok) {
                currentProjectData = data;
                renderResult(data);
            } else {
                alert(data.error || 'Something went wrong.');
                resetView();
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to connect to backend. Ensure it is running.');
            resetView();
        }
    });

    function resetView() {
        loadingView.classList.add('hidden');
        inputView.classList.remove('hidden');
        simpleFooter.classList.remove('hidden');
    }

    function renderResult(data) {
        loadingView.classList.add('hidden');
        readyView.classList.remove('hidden');
        bottomNav.classList.remove('hidden');

        resultProjectName.textContent = data.projectName || 'Project Architecture';

        // Render Summary
        aiSummaryList.innerHTML = '';
        const features = data.folders.map(f => f.name).slice(0, 4);
        features.forEach(feat => {
            const li = document.createElement('li');
            li.className = 'flex items-center gap-2 fade-in';
            li.innerHTML = `
                <span class="material-symbols-outlined text-emerald-500 text-sm">check</span>
                <span>${feat.charAt(0).toUpperCase() + feat.slice(1)} Module scaffolded</span>
            `;
            aiSummaryList.appendChild(li);
        });

        // Render File Explorer
        renderFileTree(data.folders);
    }

    function renderFileTree(folders) {
        fileExplorer.innerHTML = '';

        folders.forEach((folder, folderIdx) => {
            const folderId = `folder-${folderIdx}`;
            const folderEl = document.createElement('div');
            folderEl.className = 'mb-1';

            // Folder Header
            const header = document.createElement('div');
            header.className = 'flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer group transition-colors';
            header.innerHTML = `
                <span class="material-symbols-outlined text-amber-400 text-sm">folder</span>
                <span class="font-bold text-slate-300 group-hover:text-white">${folder.name}</span>
                <span class="material-symbols-outlined text-xs text-slate-500 ml-auto transition-transform duration-200" id="icon-${folderId}">expand_more</span>
            `;

            // Sub-files container
            const filesContainer = document.createElement('div');
            filesContainer.id = folderId;
            filesContainer.className = 'ml-4 pl-4 border-l border-slate-800 overflow-hidden transition-all duration-300';

            header.onclick = () => {
                filesContainer.classList.toggle('hidden');
                document.getElementById(`icon-${folderId}`).classList.toggle('-rotate-90');
            };

            folder.files.forEach(file => {
                const fileEl = document.createElement('div');
                fileEl.className = 'flex items-center gap-2 py-1 px-2 hover:bg-primary/10 rounded cursor-pointer group transition-colors text-slate-400 hover:text-primary';

                let icon = 'description';
                if (file.name.endsWith('.html')) icon = 'html';
                if (file.name.endsWith('.js')) icon = 'javascript';
                if (file.name.endsWith('.css')) icon = 'css';
                if (file.name.endsWith('.md')) icon = 'markdown';
                if (file.name.endsWith('.json')) icon = 'settings';

                fileEl.innerHTML = `
                    <span class="material-symbols-outlined text-sm">${icon}</span>
                    <span class="text-xs font-mono">${file.name}</span>
                `;

                fileEl.onclick = (e) => {
                    e.stopPropagation();
                    openPreview(file);
                };

                filesContainer.appendChild(fileEl);
            });

            folderEl.appendChild(header);
            folderEl.appendChild(filesContainer);
            fileExplorer.appendChild(folderEl);
        });
    }

    function openPreview(file) {
        previewFilename.textContent = file.name;
        previewContent.textContent = file.content;

        let icon = 'description';
        if (file.name.endsWith('.html')) icon = 'html';
        if (file.name.endsWith('.js')) icon = 'javascript';
        if (file.name.endsWith('.css')) icon = 'css';
        if (file.name.endsWith('.md')) icon = 'markdown';

        document.getElementById('preview-icon').textContent = icon;
        previewOverlay.classList.remove('hidden');
        previewOverlay.classList.add('flex');
    }

    closePreview.onclick = () => {
        previewOverlay.classList.add('hidden');
        previewOverlay.classList.remove('flex');
    };

    // --- ZIP Download Logic ---
    downloadZipBtn.addEventListener('click', () => {
        if (!currentProjectData) return;

        const zip = new JSZip();

        currentProjectData.folders.forEach(folder => {
            const folderRef = zip.folder(folder.name);
            folder.files.forEach(file => {
                folderRef.file(file.name, file.content);
            });
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentProjectData.projectName || 'project'}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    });

    restartBtn.addEventListener('click', () => {
        readyView.classList.add('hidden');
        bottomNav.classList.add('hidden');
        inputView.classList.remove('hidden');
        simpleFooter.classList.remove('hidden');
    });
});
