/**
 * DNR Student Portal - Redesigned JavaScript Controller
 * Layout: Figma Dashboard with Groups/Sections
 */

const app = {
    state: {
        currentGroup: 'BSC-CS-2',
        currentSemester: 'Semester 1',
        data: null,
        // --- GOOGLE SHEETS CONFIGURATION ---
        // 1. Deploy the Google Apps Script and paste the "Web App URL" here:
        scriptURL: 'https://script.google.com/macros/s/AKfycbyzRkSFrr43oCT_xy8KSHab0Ib3SJCKXYDdDDu72Ilfp6lnfNzeHiALSNAwd38QhiXOaA/exec',
        // 2. Publish your Google Sheet as CSV and paste the link here:
        lfCsvURL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQngOXK-Hw2w17WiQcTfnd0t0IpaZIhg2Yb4ztX_tme2MvtK2Z3OeEHz_qkfAagkyliyK6UKiOFGn4a/pub?output=csv',
        // 3. (For images) Get a FREE API key from https://api.imgbb.com/ and paste it here:
        imgbbApiKey: 'ec4afa2c3f668e3ab6666840498d29f9'
    },

    // --- CONFIGURATION: ADD GROUPS, SEMESTERS, AND CSV LINKS HERE ---
    groupConfig: {
        // Example: 'Group A' is the group name that appears in the dropdown
        'Group A': {
            semesters: {
                // Each group can have multiple semesters
                'Semester 1': {
                    // LINK: Google Sheets CSV link for this Semester's timetable
                    csv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-XXX-placeholder1/pub?output=csv',
                    // --- FACULTY LEGEND: Add abbreviations and full names here ---
                    // This appears below the timetable for this semester.
                    legend: {
                        'CS': 'Computer Science Dept',
                        'MA': 'Math Admin'
                    }
                },
                'Semester 2': {
                    csv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-XXX-placeholderA2/pub?output=csv',
                    legend: { 'KS': 'Suparna Mam', 'NM': 'Malleswari Mam' }
                }
            }
        },
        'Group B': {
            semesters: {
                'Semester 1': {
                    csv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-XXX-placeholder2/pub?output=csv',
                    legend: { 'JD': 'John Doe', 'AS': 'Alice Smith' }
                },
                'Semester 2': {
                    csv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-XXX-placeholderB2/pub?output=csv',
                    legend: { 'JD': 'John Doe' }
                }
            }
        },
        'BSC-CS-2': {
            semesters: {
                'Semester 1': {
                    csv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS8g3tYH1vOqtLG1kxHK_tgMHNVUHuAWBFoUIONpC9uuaZNabuimf083Oo6K6c-P7T3whdgYBBM5yE_/pub?gid=0&single=true&output=csv',

                    legend: { 'KS': 'Suparna Mam', 'LS': 'Sowjanya Mam', 'NM': 'Malleswari Mam', 'YP': 'Yuva priya Mam', 'IES': 'Geology class' }
                },
                'Semester 2': {
                    csv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS8g3tYH1vOqtLG1kxHK_tgMHNVUHuAWBFoUIONpC9uuaZNabuimf083Oo6K6c-P7T3whdgYBBM5yE_/pub?gid=0&single=true&output=csv',

                    legend: { 'KS': 'Suparna Mam', 'LS': 'Sowjanya Mam', 'NM': 'Malleswari Mam', 'YP': 'Yuva priya Mam', 'IES': 'Geology class' }
                }
            }
        }
        // TIP: To add a new group, copy the structure above and change the names/links
    },

    init() {
        console.log('Portal Initializing with Group Hierarchy...');
        this.bindEvents();
        this.loadAllData();
        this.updateSelectors(); // Initialize selectors based on default state
    },

    bindEvents() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page, false);
            }
        });
    },

    updateSelectors() {
        // Populate Group Selectors
        const groups = Object.keys(this.groupConfig);
        document.querySelectorAll('.group-select').forEach(select => {
            select.innerHTML = groups.map(g => `<option value="${g}">${g}</option>`).join('');
            select.value = this.state.currentGroup;
        });

        this.updateSemesterSelectors();
    },

    updateSemesterSelectors() {
        const group = this.state.currentGroup;
        const semesters = Object.keys(this.groupConfig[group].semesters);

        document.querySelectorAll('.semester-select').forEach(select => {
            select.innerHTML = semesters.map(s => `<option value="${s}">${s}</option>`).join('');
            // Preserve selection if possible
            if (semesters.includes(this.state.currentSemester)) {
                select.value = this.state.currentSemester;
            } else {
                select.value = semesters[0];
            }
        });

        this.state.currentSemester = document.querySelector('.semester-select').value;
    },

    setGroup(group) {
        this.state.currentGroup = group;
        console.log('Group changed to:', group);

        // Sync all group selectors
        document.querySelectorAll('.group-select').forEach(select => {
            select.value = group;
        });

        this.updateSemesterSelectors();
        this.setSemester(this.state.currentSemester);
    },

    setSemester(semester) {
        this.state.currentSemester = semester;
        console.log('Semester changed to:', semester);

        // Sync all semester selectors
        document.querySelectorAll('.semester-select').forEach(select => {
            select.value = semester;
        });

        // Re-render components
        if (this.state.data) {
            this.renderFilteredContent();
        }
    },

    renderFilteredContent() {
        const group = this.state.currentGroup;
        const sem = this.state.currentSemester;

        // Filter and render Materials
        const filteredMaterials = this.state.data.materials.filter(m => m.Group === group && m.Semester === sem);
        this.renderMaterials(filteredMaterials);

        // Filter and render Assignments
        const filteredAssignments = this.state.data.assignments.filter(a => a.Group === group && a.Semester === sem);
        this.renderAssignments(filteredAssignments);

        // Update Timetable from CSV
        const config = this.groupConfig[group]?.semesters[sem];
        if (config) {
            this.updateTimetableFromCSV(group, sem);
            this.renderStaffLegend(group, sem);
        } else {
            document.getElementById('timetable-body').innerHTML = '<tr><td colspan="100%">No CSV link configured for this selection.</td></tr>';
            const legendContainer = document.getElementById('staff-legend-container');
            if (legendContainer) legendContainer.innerHTML = '';
        }
    },

    renderStaffLegend(group, sem) {
        const container = document.getElementById('staff-legend-container');
        if (!container) return;

        const legendData = this.groupConfig[group]?.semesters[sem]?.legend;

        if (!legendData) {
            container.innerHTML = '';
            return;
        }

        const legendHtml = Object.entries(legendData).map(([abbrev, name]) => `
            <div><strong>${abbrev}:</strong> ${name}</div>
        `).join('');

        container.innerHTML = `
            <div style="margin-top: 2rem; font-size: 0.85rem; padding: 1.5rem; background: rgba(255,255,255,0.3); border-radius: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${legendHtml}
                </div>
            </div>
        `;
    },

    async updateTimetableFromCSV(group, sem) {
        const url = this.groupConfig[group].semesters[sem].csv;
        const body = document.getElementById('timetable-body');
        body.innerHTML = '<tr><td colspan="100%">Loading timetable from Google Sheets...</td></tr>';

        try {
            const data = await this.fetchCSV(url);
            if (data && data.length > 0) {
                this.state.data.lastFetchedTimetable = data;
                this.renderTimetable(data);
            } else {
                body.innerHTML = '<tr><td colspan="100%">No data found in the sheet.</td></tr>';
            }
        } catch (error) {
            console.error('CSV Fetch Error:', error);
            body.innerHTML = '<tr><td colspan="100%">Error fetching timetable. Ensure the sheet is published to web as CSV.</td></tr>';
        }
    },

    async fetchCSV(url) {
        const response = await fetch(url);
        const text = await response.text();
        return this.parseCSV(text);
    },

    parseCSV(text) {
        const lines = text.split('\n');
        if (lines.length === 0) return [];

        // Normalize headers: remove spaces and lowercase for robust mapping
        const headers = lines[0].split(',').map(h => h.trim().replace(/\s+/g, '').toLowerCase());

        return lines.slice(1).filter(line => line.trim() !== '').map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] || '';
            });
            return obj;
        });
    },

    printTimetable() {
        window.print();
    },

    showPage(pageId, updateHistory = true) {
        const sections = document.querySelectorAll('section');
        sections.forEach(s => s.classList.remove('active'));

        const target = document.getElementById(pageId);
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
        }

        if (updateHistory) {
            history.pushState({ page: pageId }, '', `#${pageId}`);
        }
    },

    loadAllData() {
        // --- DATA ENTRY: ADD YOUR INFORMATION BELOW ---
        // This section controls all the text and links shown in the portal.
        this.state.data = {
            // 1. DASHBOARD ANNOUNCEMENTS
            // Add new items: { Date: 'DD/MM', Title: 'Your Title', Msg: 'Description' }
            announcements: [
                { Date: '27/03', Title: 'CAT-1 For 1st Year', Msg: 'Final sem exams start from approx june.' },
                { Date: '12/03', Title: 'Ground Maintenance', Msg: 'Walk track is renovation.' }
            ],

            // 2. STUDY MATERIALS
            // Add new items: { Title: 'Name', Link: 'URL', Group: 'Group ID', Semester: 'Semester ID' }
            materials: [
                { Title: 'Mathematics', Link: '#', Group: 'Group A', Semester: 'Semester 1' },
                { Title: 'Calculus Advanced', Link: '#', Group: 'Group B', Semester: 'Semester 1' },
                { Title: 'Data Structures', Link: 'https://limewire.com/d/3aijV#QcSqGKPg1S', Group: 'BSC-CS-2', Semester: 'Semester 2' },
                { Title: 'Algorithms', Link: '#', Group: 'Group B', Semester: 'Semester 2' },
                { Title: 'Computer Networks', Link: '#', Group: 'Group A', Semester: 'Semester 1' },
                { Title: 'ARTIFICIAL INTELLIGENCE', Link: '#', Group: 'BSC-CS-2', Semester: 'Semester 2' },
                { Title: 'DLD(Digital Logic Design)', Link: '#', Group: 'BSC-CS-2', Semester: 'Semester 2' },
                { Title: 'OA (Office Automation', Link: '#', Group: 'BSC-CS-2', Semester: 'Semester 1' },
                { Title: 'C-Programming', Link: 'https://drive.google.com/file/d/1DFUBzYd18INl7E5Wnp4i4lRYo_UwvNfg/view?usp=drivesdk', Group: 'BSC-CS-2', Semester: 'Semester 1' }
            ],

            // 3. COLLEGE EVENTS
            // Add new items: { Title: 'Event Name', Date: 'Date', Loc: 'Location' }
            events: [
                { Title: 'Vision-x', Date: 'march-28', Loc: 'Swarnandhra college' },
                { Title: 'Samagra', Date: 'Mar 25', Loc: 'SRKR' }
            ],

            // 4. ASSIGNMENTS & HOMEWORK
            // Add new items: { Sub: 'Subject', Task: 'Topic', Date: 'Deadline', Group: 'Group ID' }
            assignments: [
                { Sub: 'OS', Task: 'Memory Management', Date: 'Oct 30', Group: 'Group A', Semester: 'Semester 1' },
                { Sub: 'DB', Task: 'SQL Query', Date: 'Oct 31', Group: 'Group B', Semester: 'Semester 1' },
                { Sub: 'DBMS', Task: 'ER Diagram', Date: 'Nov 02', Group: 'Group A', Semester: 'Semester 2' }
            ],

            // 5. IMPORTANT INFORMATION (General info shown in Info section)
            // Add new items: { Title: 'Your Title', Content: 'Description or text' }
            info: [
                { Title: 'College Hours', Content: 'Monday - Saturday: 9:30 AM - 4:30 PM' },
                { Title: 'About DNR College', Content: '\n\n\n<iframe width="560" height="315" src="https://www.youtube.com/embed/9S2Rw80Y8V8?si=wHT2eGRGajIpUra9" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' }

            ],

            // 6. STATIC LOST & FOUND (Most items now come from Google Sheets)
            lostfound: [
                { Item: 'Blue Bottle', Date: 'Oct 14', Loc: 'Canteen' }
            ],

            timetable: [], // DO NOT EDIT: Auto-filled from Google Sheets CSV links
        };

        this.renderAnnouncements(this.state.data.announcements);
        this.renderFilteredContent();
        this.renderEvents(this.state.data.events);
        this.renderInfo(this.state.data.info);
        this.fetchLFItems(); // Fetch from Google Sheets
    },

    toggleReportForm() {
        const container = document.getElementById('report-form-container');
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
        if (isHidden) container.scrollIntoView({ behavior: 'smooth' });
    },

    async handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnHtml = submitBtn.innerHTML;

        // Validation
        const fileInput = document.getElementById('itemImage');
        if (fileInput.files.length > 0 && fileInput.files[0].size > 1024 * 1024) {
            alert('Image size must be less than 1MB');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Step 1: Upload image to ImgBB (free hosting) so we only save a short URL to Google Sheets
            if (fileInput.files[0]) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading image...';
                const imageUrl = await this.uploadToImgBB(fileInput.files[0]);
                data.image = imageUrl; // Store just the URL, not the full Base64
            }

            if (this.state.scriptURL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
                alert('Please configure your Google Script URL in script.js first.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                return;
            }

            if (this.state.scriptURL.includes('docs.google.com/spreadsheets')) {
                alert('Error: You are using the Google Sheet URL as the Script URL. You MUST use the "Web App URL" from the Apps Script deployment instead.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                return;
            }

            const response = await fetch(this.state.scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(data)
            });

            alert('Success! Your report has been submitted to Google Sheets.');
            form.reset();
            this.toggleReportForm();

            // Refresh list after a short delay (Google Sheets might take a second to update CSV)
            setTimeout(() => this.fetchLFItems(), 3000);

        } catch (error) {
            console.error('Submission Error:', error);
            alert('Error submitting form. Check console for details.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    },

    // Uploads an image to ImgBB and returns the public URL.
    // Images are hosted for free — no Google Drive permission needed.
    async uploadToImgBB(file) {
        if (!this.state.imgbbApiKey || this.state.imgbbApiKey === 'YOUR_IMGBB_API_KEY_HERE') {
            // No API key: fall back to compressed base64 (may still hit Sheet limits)
            console.warn('ImgBB API key not set. Falling back to Base64. Get a free key at https://api.imgbb.com/');
            return await this.compressImage(file);
        }

        const compressed = await this.compressImage(file);
        // Remove the data:image/jpeg;base64, prefix for the ImgBB API
        const base64Data = compressed.split(',')[1];

        const formData = new FormData();
        formData.append('image', base64Data);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${this.state.imgbbApiKey}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            return result.data.display_url; // Use display_url — more reliable for <img> embedding
        } else {
            console.error('ImgBB upload failed:', result);
            return ''; // Return empty on failure
        }
    },

    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Since we are now using Google Drive, we can afford higher quality (0.8) and larger size (1024px)
                    // This creates a much better viewing experience than the 50k character restricted version.
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
            };
            reader.onerror = error => reject(error);
        });
    },

    async fetchLFItems() {
        const url = this.state.lfCsvURL;
        const container = document.getElementById('lostfound-items-container');

        if (url === 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQngOXK-Hw2w17WiQcTfnd0t0IpaZIhg2Yb4ztX_tme2MvtK2Z3OeEHz_qkfAagkyliyK6UKiOFGn4a/pub?gid=0&single=true&output=csv' || !url) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Please configure the Google Sheets CSV link in script.js to see reported items.</p>';
            return;
        }

        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Fetching items...</p></div>';

        try {
            const items = await this.fetchCSV(url);
            this.renderLFItems(items);
        } catch (error) {
            console.error('Fetch LF Error:', error);
            container.innerHTML = '<p style="text-align: center; color: red;">Error fetching items from Google Sheets.</p>';
        }
    },

    renderLFItems(data) {
        const container = document.getElementById('lostfound-items-container');
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No items reported yet.</p>';
            return;
        }

        container.innerHTML = data.map(item => {
            // Using lowercase keys normalized in parseCSV
            const name = item.contactname || '';
            const number = item.contactnumber || '';
            const itemName = item.itemname || 'Unknown Item';
            const date = item.datefound || 'Unknown Date';
            const category = item.itemcategory || 'General';
            const loc = item.locationfound || 'Unknown';
            const desc = item.description || 'No description provided.';
            const image = item.image || item.imageurl || '';

            const contactLabel = name ? `Contact ${name}` : (number ? `Contact ${number}` : 'No Contact Info');
            const whatsappMsg = `Hi ${name || 'there'}, I am inquiring about the ${itemName} you found on ${date}.`;

            return `
            <div class="item-card">
                <div class="item-img-container">
                    ${image && image !== ''
                    ? `<img src="${image}" alt="${itemName}">`
                    : '<i class="fas fa-box item-img-placeholder"></i>'}
                </div>
                <div class="item-details">
                    <span class="item-category-tag">${category}</span>
                    <h3 class="item-title">${itemName}</h3>
                    <div class="item-meta">
                        <span><i class="fas fa-map-marker-alt"></i> Found at: ${loc}</span>
                        <span><i class="fas fa-calendar-alt"></i> Date: ${date}</span>
                    </div>
                    <p class="item-description">${desc}</p>
                    ${number ? `
                    <a href="https://wa.me/${number.replace(/\s+/g, '')}?text=${encodeURIComponent(whatsappMsg)}" 
                       target="_blank" class="item-contact-btn">
                        <i class="fab fa-whatsapp"></i> ${contactLabel}
                    </a>
                    ` : '<span class="item-contact-btn disabled" style="opacity: 0.5; cursor: not-allowed;"><i class="fas fa-phone-slash"></i> No Number</span>'}
                </div>
            </div>
            `;
        }).join('');
    },

    renderAnnouncements(data) {
        const summary = document.getElementById('announcements-summary');
        summary.innerHTML = data.map(item => `
            <div style="border-bottom: 1px solid rgba(0,0,0,0.05); padding: 1rem 0;">
                <span style="color: var(--accent); font-weight: 700;">${item.Date}</span>
                <h4 style="margin: 0.2rem 0;">${item.Title}</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted);">${item.Msg}</p>
            </div>
        `).join('');
    },

    renderMaterials(data) {
        const container = document.getElementById('materials-container');
        container.innerHTML = `<div class="dashboard-grid" style="margin-top: 1rem; width: 100%;">
            ${data.map(item => `
                <a href="${item.Link}" target="_blank" class="dash-card" style="text-decoration: none; display: flex;">
                    <i class="fas fa-file-pdf"></i>
                    <span>${item.Title}</span>
                    <small style="margin-top: 0.5rem; opacity: 0.6;">${item.Group}</small>
                </a>
            `).join('')}
        </div>`;
    },

    renderTimetable(data) {
        const header = document.getElementById('timetable-header');
        const body = document.getElementById('timetable-body');

        if (!data || data.length === 0) {
            body.innerHTML = '<tr><td colspan="100%">No schedule found.</td></tr>';
            return;
        }

        // Filter out "Group" column as it's redundant
        const keys = Object.keys(data[0]).filter(k => k.toLowerCase() !== 'group');

        header.innerHTML = `<tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr>`;
        body.innerHTML = data.map(row => `
            <tr>${keys.map(k => `<td>${row[k] || ''}</td>`).join('')}</tr>
        `).join('');
    },

    renderEvents(data) {
        const container = document.getElementById('events-container');
        container.innerHTML = data.map(item => `
            <div class="info-item">
                <span style="font-weight: 800; color: var(--accent);">${item.Date}</span>
                <h3>${item.Title}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${item.Loc}</p>
            </div>
        `).join('');
    },

    renderAssignments(data) {
        const container = document.getElementById('assignments-container');
        container.innerHTML = data.map(item => `
            <div class="info-item">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <span style="color: red; font-weight: 700;">Due: ${item.Date}</span>
                    <span style="background: var(--bg-color); color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem;">${item.Group}</span>
                </div>
                <h3>${item.Sub}</h3>
                <p>${item.Task}</p>
                <button class="back-btn" style="margin-top: 1rem; border: 1px solid; padding: 0.5rem 1rem; border-radius: 10px;">Upload Work</button>
            </div>
        `).join('');
    },

    renderInfo(data) {
        const container = document.getElementById('info-container');
        if (!container) return;

        container.innerHTML = data.map(item => `
            <div class="info-item">
                <h3>${item.Title}</h3>
                <div class="info-content">${item.Content}</div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
