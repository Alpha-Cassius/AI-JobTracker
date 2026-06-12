// State Management
let appData = {
    jobs: []
};

// Initialize app on load
document.addEventListener("DOMContentLoaded", async () => {
    // Load data from Python backend asynchronously
    appData = await eel.load_data()();
    if (!appData.jobs) appData.jobs = [];
    
    // Set today's date as default in form
    document.getElementById('job-date').valueAsDate = new Date();
    
    updateDashboard();
    renderJobsList();
});

// View Navigation Logic
function navigate(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    // Reset nav buttons styling
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600/20', 'text-blue-400');
        btn.classList.add('text-gray-400', 'hover:bg-gray-700');
    });
    
    // Show selected view
    document.getElementById(`view-${viewId}`).classList.remove('hidden');
    
    // Highlight active nav
    const activeBtn = document.getElementById(`nav-${viewId}`);
    activeBtn.classList.remove('text-gray-400', 'hover:bg-gray-700');
    activeBtn.classList.add('bg-blue-600/20', 'text-blue-400');
}

// ==========================================
// Dashboard Logic
// ==========================================
function updateDashboard() {
    const jobs = appData.jobs;
    const total = jobs.length;
    let interviews = 0;
    let offers = 0;
    let rejections = 0;
    
    jobs.forEach(job => {
        if (job.status === 'Interview' || job.status === 'Screening') interviews++;
        else if (job.status === 'Offer') offers++;
        else if (job.status === 'Rejected') rejections++;
    });
    
    // Animate numbers (simple approach)
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-interviews').innerText = interviews;
    document.getElementById('stat-offers').innerText = offers;
    document.getElementById('stat-rejections').innerText = rejections;
    
    renderRecentJobs();
}

function renderRecentJobs() {
    const tbody = document.getElementById('recent-jobs-list');
    tbody.innerHTML = '';
    
    // Sort by date newest first, take top 5
    const recentJobs = [...appData.jobs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (recentJobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-gray-500">No applications yet. Add one from the Job Tracker!</td></tr>`;
        return;
    }
    
    recentJobs.forEach(job => {
        tbody.innerHTML += `
            <tr class="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                <td class="py-3 text-white font-medium">${job.company}</td>
                <td class="py-3 text-gray-300">${job.role}</td>
                <td class="py-3 text-gray-400">${job.date}</td>
                <td class="py-3"><span class="status-badge status-${job.status}">${job.status}</span></td>
            </tr>
        `;
    });
}

// ==========================================
// Job Tracker CRUD Logic
// ==========================================
function renderJobsList() {
    const tbody = document.getElementById('all-jobs-list');
    tbody.innerHTML = '';
    
    // Sort by date newest first
    const sortedJobs = [...appData.jobs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedJobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500 text-lg">No jobs tracked yet. Click "Add Job" to start tracking.</td></tr>`;
        return;
    }
    
    sortedJobs.forEach(job => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-700/30 transition-colors group">
                <td class="p-4 text-white font-semibold">${job.company}</td>
                <td class="p-4 text-gray-300">${job.role}</td>
                <td class="p-4 text-gray-400">${job.date}</td>
                <td class="p-4"><span class="status-badge status-${job.status}">${job.status}</span></td>
                <td class="p-4 text-gray-400">${job.salary || '-'}</td>
                <td class="p-4 text-right">
                    <button onclick="editJob('${job.id}')" title="Edit" class="text-blue-400 hover:text-blue-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteJob('${job.id}')" title="Delete" class="text-red-400 hover:text-red-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Modal Handlers
const modal = document.getElementById('job-modal');
const modalContent = document.getElementById('job-modal-content');

function openJobModal() {
    document.getElementById('job-form').reset();
    document.getElementById('job-id').value = '';
    document.getElementById('job-date').valueAsDate = new Date();
    document.getElementById('modal-title').innerText = 'Add New Job';
    
    modal.classList.remove('hidden');
    // Trigger reflow for animation
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
}

function closeJobModal() {
    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Save Form Data
document.getElementById('job-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('job-id').value || crypto.randomUUID();
    const isNew = !document.getElementById('job-id').value;
    
    const jobData = {
        id: id,
        company: document.getElementById('job-company').value,
        role: document.getElementById('job-role').value,
        date: document.getElementById('job-date').value,
        status: document.getElementById('job-status').value,
        salary: document.getElementById('job-salary').value,
        notes: document.getElementById('job-notes').value
    };
    
    if (isNew) {
        appData.jobs.push(jobData);
    } else {
        const index = appData.jobs.findIndex(j => j.id === id);
        if (index !== -1) appData.jobs[index] = jobData;
    }
    
    // Save to backend via Eel
    await eel.save_data(appData)();
    
    updateDashboard();
    renderJobsList();
    closeJobModal();
});

// Edit / Delete Actions
function editJob(id) {
    const job = appData.jobs.find(j => j.id === id);
    if (!job) return;
    
    document.getElementById('job-id').value = job.id;
    document.getElementById('job-company').value = job.company;
    document.getElementById('job-role').value = job.role;
    document.getElementById('job-date').value = job.date;
    document.getElementById('job-status').value = job.status;
    document.getElementById('job-salary').value = job.salary || '';
    document.getElementById('job-notes').value = job.notes || '';
    
    document.getElementById('modal-title').innerText = 'Edit Job';
    
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
}

async function deleteJob(id) {
    if(confirm("Are you sure you want to delete this job application?")) {
        appData.jobs = appData.jobs.filter(j => j.id !== id);
        await eel.save_data(appData)();
        updateDashboard();
        renderJobsList();
    }
}

// ==========================================
// Optimizer & AI Logic
// ==========================================
async function runOptimizer() {
    const jobDesc = document.getElementById('opt-job-desc').value;
    const resume = document.getElementById('opt-resume').value;
    
    if (!jobDesc || !resume) {
        alert("Please paste both the job description and your resume text.");
        return;
    }
    
    const btn = document.querySelector('button[onclick="runOptimizer()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Analyzing with AI...`;
    btn.disabled = true;
    
    try {
        // Call Python Ollama function via Eel
        const response = await eel.optimize_resume(jobDesc, resume)();
        
        if (!response.success) {
            alert(response.error || "An unknown error occurred while analyzing.");
            return;
        }
        
        const result = response.data;
        
        // Update UI
        document.getElementById('opt-results').classList.remove('hidden');
        
        // Setup donut chart stroke animation
        const donut = document.getElementById('match-donut');
        const percentage = result.match_percentage || 0;
        
        // Animate counter
        let current = 0;
        const scoreEl = document.getElementById('match-score');
        const interval = setInterval(() => {
            if(current >= percentage) {
                clearInterval(interval);
                scoreEl.innerText = `${percentage}%`;
            } else {
                current++;
                scoreEl.innerText = `${current}%`;
            }
        }, 15);
        
        // Color based on score
        if (percentage < 40) donut.classList.replace(donut.classList[1], 'text-red-500');
        else if (percentage < 70) donut.classList.replace(donut.classList[1], 'text-yellow-500');
        else donut.classList.replace(donut.classList[1], 'text-green-500');
        
        // Execute stroke animation
        setTimeout(() => {
            donut.setAttribute('stroke-dasharray', `${percentage}, 100`);
        }, 50);
        
        // Render missing keywords
        const keywordsContainer = document.getElementById('missing-keywords');
        keywordsContainer.innerHTML = '';
        const keywords = result.missing_keywords || [];
        
        if (keywords.length === 0) {
            keywordsContainer.innerHTML = `<span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">Perfect Match! No obvious missing keywords found.</span>`;
        } else {
            keywords.forEach(word => {
                keywordsContainer.innerHTML += `<span class="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm font-medium border border-gray-600 shadow-sm">${word}</span>`;
            });
        }

        // Render AI Suggestions
        const suggestionsContainer = document.getElementById('ai-suggestions');
        suggestionsContainer.innerHTML = '';
        const suggestions = result.suggestions || ["Add more relevant keywords to your resume.", "Ensure your experience aligns with the job requirements."];
        
        suggestions.forEach(suggestion => {
            suggestionsContainer.innerHTML += `<li>${suggestion}</li>`;
        });
        
        // Reset cover letter area
        document.getElementById('cover-letter-container').classList.add('hidden');
        document.getElementById('generated-cover-letter').value = '';

    } catch (e) {
        alert("Error running optimization. See console for details.");
        console.error(e);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function generateCoverLetter() {
    const jobDesc = document.getElementById('opt-job-desc').value;
    const resume = document.getElementById('opt-resume').value;
    
    if (!jobDesc || !resume) {
        alert("Job description and resume are required to generate a cover letter.");
        return;
    }

    const btn = document.querySelector('button[onclick="generateCoverLetter()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Drafting...`;
    btn.disabled = true;

    try {
        const response = await eel.generate_cover_letter(jobDesc, resume)();
        
        if (!response.success) {
            alert(response.error || "Failed to generate cover letter.");
            return;
        }

        const container = document.getElementById('cover-letter-container');
        const textarea = document.getElementById('generated-cover-letter');
        
        textarea.value = response.cover_letter;
        container.classList.remove('hidden');
        
    } catch (e) {
        alert("Error generating cover letter.");
        console.error(e);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function copyCoverLetter() {
    const textarea = document.getElementById('generated-cover-letter');
    textarea.select();
    document.execCommand('copy');
    
    const btn = document.querySelector('button[onclick="copyCoverLetter()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check mr-2"></i> Copied!`;
    
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
}

// ==========================================
// Resume Builder Logic
// ==========================================
async function buildResume() {
    const rawText = document.getElementById('builder-input').value;
    const targetRole = document.getElementById('builder-target-role').value;
    
    if (!rawText || rawText.trim() === '') {
        alert("Please paste your raw LinkedIn profile text first.");
        return;
    }
    
    const btn = document.querySelector('button[onclick="buildResume()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Generating Resume... (This may take up to a minute)`;
    btn.disabled = true;
    
    const previewContainer = document.getElementById('resume-preview');
    const copyBtn = document.getElementById('copy-resume-btn');
    const rawMarkdownInput = document.getElementById('raw-resume-markdown');
    
    previewContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-blue-400">
            <i class="fa-solid fa-robot text-5xl mb-4 fa-bounce"></i>
            <p class="font-medium text-lg">AI is analyzing your profile...</p>
            <p class="text-sm text-gray-400 mt-2">Crafting impact-driven bullet points.</p>
        </div>
    `;
    
    try {
        const response = await eel.generate_resume_from_linkedin(rawText, targetRole)();
        
        if (!response.success) {
            alert(response.error || "Failed to generate resume.");
            previewContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-red-400">
                    <i class="fa-solid fa-triangle-exclamation text-4xl mb-3"></i>
                    <p>Generation Failed</p>
                </div>
            `;
            return;
        }
        
        const markdownContent = response.resume_markdown;
        rawMarkdownInput.value = markdownContent;
        
        // Parse markdown to HTML using marked.js
        previewContainer.innerHTML = marked.parse(markdownContent);
        
        // Enable copy button
        copyBtn.disabled = false;
        
    } catch (e) {
        alert("Error connecting to backend.");
        console.error(e);
        previewContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-500">
                <i class="fa-solid fa-file-lines text-4xl mb-3 opacity-50"></i>
                <p>Failed to generate.</p>
            </div>
        `;
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function copyResume() {
    const textarea = document.getElementById('raw-resume-markdown');
    if (!textarea.value) return;
    
    textarea.classList.remove('hidden');
    textarea.select();
    document.execCommand('copy');
    textarea.classList.add('hidden');
    
    const btn = document.getElementById('copy-resume-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check mr-1"></i> Copied!`;
    
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
}
