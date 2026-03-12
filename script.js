/**
 * DNR Student Portal - Redesigned JavaScript Controller
 * Layout: Figma Dashboard with Groups/Sections
 */

const app = {
    state: {
        currentGroup: 'BSC-CS-2',
        currentSemester: 'Semester 1',
        data: null
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
                    // LEGEND: Staff abbreviations and full names (appears below timetable)
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

        const headers = lines[0].split(',').map(h => h.trim());
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
        // --- DATA SECTION: ADD ANNOUNCEMENTS, MATERIALS, ASSIGNMENTS HERE ---
        this.state.data = {
            // Notifications that appear on the dashboard
            announcements: [
                { Date: '15/10', Title: 'Exam Schedule Out', Msg: 'Final sem exams start from Nov 10.' },
                { Date: '12/10', Title: 'Library Upgrade', Msg: '100+ new technical books added.' }
            ],
            // PDF or Web Links for study materials
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
            timetable: [], // DO NOT EDIT: This is automatically filled from your Google Sheet CSV links
            // College events
            events: [
                { Title: 'Tech Fest', Date: 'Nov 05', Loc: 'Auditorium' },
                { Title: 'Blood Drive', Date: 'Oct 25', Loc: 'Grounds' }
            ],
            // Homework and project deadlines
            assignments: [
                { Sub: 'OS', Task: 'Memory Management', Date: 'Oct 30', Group: 'Group A', Semester: 'Semester 1' },
                { Sub: 'DB', Task: 'SQL Query', Date: 'Oct 31', Group: 'Group B', Semester: 'Semester 1' },
                { Sub: 'DBMS', Task: 'ER Diagram', Date: 'Nov 02', Group: 'Group A', Semester: 'Semester 2' }
            ],
            // Reported items found on campus
            lostfound: [
                { Item: 'Blue Bottle', Date: 'Oct 14', Loc: 'Canteen' },
                { Item: 'Wrist Watch', Date: 'Oct 12', Loc: 'Library' }
            ]
        };

        this.renderAnnouncements(this.state.data.announcements);
        this.renderFilteredContent();
        this.renderEvents(this.state.data.events);
        this.renderLF(this.state.data.lostfound);
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
            body.innerHTML = '<tr><td colspan="4">No schedule found.</td></tr>';
            return;
        }

        const keys = Object.keys(data[0]);
        header.innerHTML = `<tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr>`;
        body.innerHTML = data.map(row => `
            <tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>
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

    renderLF(data) {
        const container = document.getElementById('lostfound-container');
        container.innerHTML = data.map(item => `
            <div class="info-item">
                <h3>${item.Item}</h3>
                <p><strong>Found On:</strong> ${item.Date}</p>
                <p><strong>Location:</strong> ${item.Loc}</p>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
