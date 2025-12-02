/**
 * Resume Generation Modal
 * UI component for generating resumes from profile data
 * Provides three generation modes: from scratch, update existing, optimize for job
 */

class ResumeGenerationModal {
    constructor() {
        this.modal = null;
        this.onGenerate = null;
        this.mode = 'generate'; // 'generate', 'update', 'optimize'
    }

    /**
     * Show the resume generation modal
     * @param {string} mode - Generation mode (generate, update, optimize)
     * @param {Function} callback - Callback when resume is generated
     */
    show(mode = 'generate', callback) {
        this.mode = mode;
        this.onGenerate = callback;
        this.render();
    }

    /**
     * Hide the modal
     */
    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    /**
     * Render the modal
     * @private
     */
    render() {
        // Remove existing modal if present
        this.hide();

        // Create modal HTML
        const modalHTML = this._getModalHTML();

        // Create and append modal
        const div = document.createElement('div');
        div.innerHTML = modalHTML;
        this.modal = div.firstElementChild;
        document.body.appendChild(this.modal);

        // Attach event listeners
        this._attachEventListeners();

        // Load saved profile data if available
        this._loadSavedProfile();
    }

    /**
     * Get modal HTML based on mode
     * @private
     * @returns {string} - Modal HTML
     */
    _getModalHTML() {
        const titles = {
            generate: 'Generate Resume from Profile',
            update: 'Update & Modernize Resume',
            optimize: 'Optimize Resume for Job'
        };

        return `
            <div class="resume-gen-modal-overlay" id="resumeGenModal">
                <div class="resume-gen-modal">
                    <div class="resume-gen-modal-header">
                        <h2>${titles[this.mode]}</h2>
                        <button class="close-btn" onclick="this.closest('.resume-gen-modal-overlay').remove()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="resume-gen-modal-body">
                        ${this._getFormHTML()}
                    </div>
                    <div class="resume-gen-modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.resume-gen-modal-overlay').remove()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" id="generateResumeBtn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Generate Resume
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get form HTML based on mode
     * @private
     * @returns {string} - Form HTML
     */
    _getFormHTML() {
        if (this.mode === 'generate') {
            return this._getGenerateFormHTML();
        } else if (this.mode === 'update') {
            return this._getUpdateFormHTML();
        } else if (this.mode === 'optimize') {
            return this._getOptimizeFormHTML();
        }
        return '';
    }

    /**
     * Get generate form HTML
     * @private
     * @returns {string} - Form HTML
     */
    _getGenerateFormHTML() {
        return `
            <form id="resumeGenForm" class="resume-gen-form">
                <div class="form-section">
                    <h3>Basic Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profileName">Full Name *</label>
                            <input type="text" id="profileName" required placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label for="profileTitle">Professional Title *</label>
                            <input type="text" id="profileTitle" required placeholder="Senior Software Engineer">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="profileEmail">Email</label>
                            <input type="email" id="profileEmail" placeholder="john@example.com">
                        </div>
                        <div class="form-group">
                            <label for="profilePhone">Phone</label>
                            <input type="tel" id="profilePhone" placeholder="(555) 123-4567">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="profileLocation">Location</label>
                            <input type="text" id="profileLocation" placeholder="San Francisco, CA">
                        </div>
                        <div class="form-group">
                            <label for="profileLinkedIn">LinkedIn</label>
                            <input type="url" id="profileLinkedIn" placeholder="linkedin.com/in/johndoe">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Career Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="targetRole">Target Role</label>
                            <input type="text" id="targetRole" placeholder="Senior Full Stack Developer">
                            <small>The position you're applying for</small>
                        </div>
                        <div class="form-group">
                            <label for="targetIndustry">Target Industry</label>
                            <input type="text" id="targetIndustry" placeholder="Technology, SaaS">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="profileSkills">Skills (comma-separated)</label>
                        <textarea id="profileSkills" rows="3" placeholder="JavaScript, React, Node.js, Python, AWS, Docker"></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Experience *</h3>
                    <div id="experienceEntries">
                        <div class="experience-entry">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Job Title</label>
                                    <input type="text" class="exp-title" placeholder="Software Engineer">
                                </div>
                                <div class="form-group">
                                    <label>Company</label>
                                    <input type="text" class="exp-company" placeholder="Tech Corp">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Dates</label>
                                    <input type="text" class="exp-dates" placeholder="Jan 2020 - Present">
                                </div>
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" class="exp-location" placeholder="San Francisco, CA">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Responsibilities (one per line)</label>
                                <textarea class="exp-responsibilities" rows="4" placeholder="Led development of...&#10;Implemented new features...&#10;Collaborated with..."></textarea>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" id="addExperienceBtn">
                        + Add Another Position
                    </button>
                </div>

                <div class="form-section">
                    <h3>Education</h3>
                    <div id="educationEntries">
                        <div class="education-entry">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Degree</label>
                                    <input type="text" class="edu-degree" placeholder="Bachelor of Science">
                                </div>
                                <div class="form-group">
                                    <label>Field of Study</label>
                                    <input type="text" class="edu-field" placeholder="Computer Science">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Institution</label>
                                    <input type="text" class="edu-school" placeholder="University Name">
                                </div>
                                <div class="form-group">
                                    <label>Year</label>
                                    <input type="text" class="edu-year" placeholder="2020">
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" id="addEducationBtn">
                        + Add Another Degree
                    </button>
                </div>

                <div class="form-section">
                    <h3>Template</h3>
                    <div class="form-group">
                        <label for="resumeTemplate">Resume Template</label>
                        <select id="resumeTemplate">
                            <option value="modern">Modern</option>
                            <option value="professional">Professional</option>
                            <option value="creative">Creative</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>
                </div>
            </form>
        `;
    }

    /**
     * Get update form HTML
     * @private
     * @returns {string} - Form HTML
     */
    _getUpdateFormHTML() {
        return `
            <form id="resumeUpdateForm" class="resume-gen-form">
                <div class="form-section">
                    <h3>Update Options</h3>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="modernizeCheck" checked>
                            <span>Modernize format and language</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="improveLanguageCheck" checked>
                            <span>Improve language with strong action verbs</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="addMetricsCheck" checked>
                            <span>Add quantified metrics and achievements</span>
                        </label>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Target Position (Optional)</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="updateTargetRole">Target Role</label>
                            <input type="text" id="updateTargetRole" placeholder="Senior Software Engineer">
                        </div>
                        <div class="form-group">
                            <label for="updateTargetIndustry">Target Industry</label>
                            <input type="text" id="updateTargetIndustry" placeholder="Technology">
                        </div>
                    </div>
                </div>

                <div class="info-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p>This will update your current resume with modern best practices while maintaining the core content and truthfulness.</p>
                </div>
            </form>
        `;
    }

    /**
     * Get optimize form HTML
     * @private
     * @returns {string} - Form HTML
     */
    _getOptimizeFormHTML() {
        return `
            <form id="resumeOptimizeForm" class="resume-gen-form">
                <div class="form-section">
                    <h3>Job Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="optimizeJobTitle">Job Title *</label>
                            <input type="text" id="optimizeJobTitle" required placeholder="Senior Software Engineer">
                        </div>
                        <div class="form-group">
                            <label for="optimizeCompany">Company Name</label>
                            <input type="text" id="optimizeCompany" placeholder="Tech Corp">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="optimizeJobDescription">Job Description *</label>
                        <textarea id="optimizeJobDescription" rows="8" required placeholder="Paste the full job description here..."></textarea>
                        <small>Paste the complete job posting to optimize your resume</small>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Skills to Emphasize (Optional)</h3>
                    <div class="form-group">
                        <label for="emphasizeSkills">Key Skills</label>
                        <input type="text" id="emphasizeSkills" placeholder="React, AWS, Kubernetes, Python">
                        <small>Comma-separated skills to highlight in the optimized resume</small>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Options</h3>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="preserveStructureCheck" checked>
                            <span>Preserve overall structure (just tailor content)</span>
                        </label>
                    </div>
                </div>

                <div class="info-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p>This will optimize your resume for the specific job by incorporating relevant keywords and emphasizing matching experience.</p>
                </div>
            </form>
        `;
    }

    /**
     * Attach event listeners to form elements
     * @private
     */
    _attachEventListeners() {
        // Generate button
        const generateBtn = this.modal.querySelector('#generateResumeBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this._handleGenerate());
        }

        // Add experience button
        const addExpBtn = this.modal.querySelector('#addExperienceBtn');
        if (addExpBtn) {
            addExpBtn.addEventListener('click', () => this._addExperienceEntry());
        }

        // Add education button
        const addEduBtn = this.modal.querySelector('#addEducationBtn');
        if (addEduBtn) {
            addEduBtn.addEventListener('click', () => this._addEducationEntry());
        }

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('resume-gen-modal-overlay')) {
                this.hide();
            }
        });
    }

    /**
     * Handle generate button click
     * @private
     */
    async _handleGenerate() {
        const generateBtn = this.modal.querySelector('#generateResumeBtn');
        const originalText = generateBtn.innerHTML;

        try {
            // Show loading state
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <div class="spinner"></div>
                Generating...
            `;

            // Collect form data based on mode
            let profileData, options;

            if (this.mode === 'generate') {
                profileData = this._collectGenerateFormData();
            } else if (this.mode === 'update') {
                options = this._collectUpdateFormData();
            } else if (this.mode === 'optimize') {
                options = this._collectOptimizeFormData();
            }

            // Call resume generator
            if (typeof resumeGenerator === 'undefined') {
                throw new Error('Resume generator not loaded');
            }

            let result;
            if (this.mode === 'generate') {
                result = await resumeGenerator.generateResume(profileData);
            } else if (this.mode === 'update') {
                const currentResume = this._getCurrentResume();
                result = await resumeGenerator.updateResume(currentResume, options);
            } else if (this.mode === 'optimize') {
                const currentResume = this._getCurrentResume();
                result = await resumeGenerator.optimizeForJob(
                    currentResume,
                    options.jobDescription,
                    options
                );
            }

            if (result.success) {
                // Save profile data for future use
                if (this.mode === 'generate') {
                    this._saveProfile(profileData);
                }

                // Call callback with generated resume
                if (this.onGenerate) {
                    this.onGenerate(result.resumeState, result.metadata);
                }

                // Show success message
                this._showSuccessMessage();

                // Close modal after short delay
                setTimeout(() => this.hide(), 1500);
            } else {
                throw new Error(result.error || 'Resume generation failed');
            }
        } catch (error) {
            console.error('[ResumeGenerationModal] Generation failed:', error);
            alert(`Resume generation failed: ${error.message}`);

            // Restore button
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalText;
        }
    }

    /**
     * Collect form data for generate mode
     * @private
     * @returns {Object} - Profile data
     */
    _collectGenerateFormData() {
        const form = this.modal.querySelector('#resumeGenForm');

        // Basic info
        const profileData = {
            name: form.querySelector('#profileName').value,
            title: form.querySelector('#profileTitle').value,
            email: form.querySelector('#profileEmail').value,
            phone: form.querySelector('#profilePhone').value,
            location: form.querySelector('#profileLocation').value,
            linkedin: form.querySelector('#profileLinkedIn').value,
            targetRole: form.querySelector('#targetRole').value,
            targetIndustry: form.querySelector('#targetIndustry').value,
            skills: form.querySelector('#profileSkills').value.split(',').map(s => s.trim()).filter(s => s),
            template: form.querySelector('#resumeTemplate').value,
            experience: [],
            education: []
        };

        // Experience entries
        form.querySelectorAll('.experience-entry').forEach(entry => {
            const exp = {
                title: entry.querySelector('.exp-title').value,
                company: entry.querySelector('.exp-company').value,
                date: entry.querySelector('.exp-dates').value,
                location: entry.querySelector('.exp-location').value,
                responsibilities: entry.querySelector('.exp-responsibilities').value
                    .split('\n')
                    .map(r => r.trim())
                    .filter(r => r)
            };
            if (exp.title && exp.company) {
                profileData.experience.push(exp);
            }
        });

        // Education entries
        form.querySelectorAll('.education-entry').forEach(entry => {
            const edu = {
                degree: entry.querySelector('.edu-degree').value,
                field: entry.querySelector('.edu-field').value,
                school: entry.querySelector('.edu-school').value,
                graduationYear: entry.querySelector('.edu-year').value
            };
            if (edu.degree && edu.school) {
                profileData.education.push(edu);
            }
        });

        return profileData;
    }

    /**
     * Collect form data for update mode
     * @private
     * @returns {Object} - Update options
     */
    _collectUpdateFormData() {
        const form = this.modal.querySelector('#resumeUpdateForm');

        return {
            modernize: form.querySelector('#modernizeCheck').checked,
            improveLanguage: form.querySelector('#improveLanguageCheck').checked,
            addMetrics: form.querySelector('#addMetricsCheck').checked,
            targetRole: form.querySelector('#updateTargetRole').value,
            targetIndustry: form.querySelector('#updateTargetIndustry').value
        };
    }

    /**
     * Collect form data for optimize mode
     * @private
     * @returns {Object} - Optimize options
     */
    _collectOptimizeFormData() {
        const form = this.modal.querySelector('#resumeOptimizeForm');

        return {
            jobTitle: form.querySelector('#optimizeJobTitle').value,
            companyName: form.querySelector('#optimizeCompany').value,
            jobDescription: form.querySelector('#optimizeJobDescription').value,
            emphasizeSkills: form.querySelector('#emphasizeSkills').value
                .split(',')
                .map(s => s.trim())
                .filter(s => s),
            preserveStructure: form.querySelector('#preserveStructureCheck').checked
        };
    }

    /**
     * Get current resume state
     * @private
     * @returns {Object} - Current resume
     */
    _getCurrentResume() {
        // Try to get from global state
        if (typeof resumeState !== 'undefined' && resumeState) {
            return resumeState;
        }

        // Try to get from localStorage
        try {
            const saved = localStorage.getItem('resume_state');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('[ResumeGenerationModal] Could not load current resume');
        }

        return { sections: [], template: 'modern' };
    }

    /**
     * Add experience entry
     * @private
     */
    _addExperienceEntry() {
        const container = this.modal.querySelector('#experienceEntries');
        const entry = container.querySelector('.experience-entry').cloneNode(true);

        // Clear values
        entry.querySelectorAll('input, textarea').forEach(input => input.value = '');

        container.appendChild(entry);
    }

    /**
     * Add education entry
     * @private
     */
    _addEducationEntry() {
        const container = this.modal.querySelector('#educationEntries');
        const entry = container.querySelector('.education-entry').cloneNode(true);

        // Clear values
        entry.querySelectorAll('input').forEach(input => input.value = '');

        container.appendChild(entry);
    }

    /**
     * Load saved profile data
     * @private
     */
    _loadSavedProfile() {
        if (this.mode !== 'generate') return;

        try {
            const saved = localStorage.getItem('saved_profile_data');
            if (saved) {
                const data = JSON.parse(saved);
                const form = this.modal.querySelector('#resumeGenForm');

                // Populate basic info
                if (data.name) form.querySelector('#profileName').value = data.name;
                if (data.title) form.querySelector('#profileTitle').value = data.title;
                if (data.email) form.querySelector('#profileEmail').value = data.email;
                if (data.phone) form.querySelector('#profilePhone').value = data.phone;
                if (data.location) form.querySelector('#profileLocation').value = data.location;
                if (data.linkedin) form.querySelector('#profileLinkedIn').value = data.linkedin;
                if (data.skills) form.querySelector('#profileSkills').value = data.skills.join(', ');
            }
        } catch (error) {
            console.warn('[ResumeGenerationModal] Could not load saved profile');
        }
    }

    /**
     * Save profile data for future use
     * @private
     * @param {Object} profileData - Profile data
     */
    _saveProfile(profileData) {
        try {
            localStorage.setItem('saved_profile_data', JSON.stringify(profileData));
        } catch (error) {
            console.warn('[ResumeGenerationModal] Could not save profile data');
        }
    }

    /**
     * Show success message
     * @private
     */
    _showSuccessMessage() {
        const footer = this.modal.querySelector('.resume-gen-modal-footer');
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Resume generated successfully!</span>
        `;
        footer.insertBefore(message, footer.firstChild);
    }
}

// Create global instance
const resumeGenerationModal = new ResumeGenerationModal();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResumeGenerationModal, resumeGenerationModal };
}
