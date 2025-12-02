/**
 * ResuMate Section Definitions
 * Defines all 20+ section types for resume building
 */

const SectionTypes = {
    HEADER: 'header',
    SUMMARY: 'summary',
    EXPERIENCE: 'experience',
    EDUCATION: 'education',
    SKILLS: 'skills',
    CERTIFICATIONS: 'certifications',
    PROJECTS: 'projects',
    ACHIEVEMENTS: 'achievements',
    LANGUAGES: 'languages',
    VOLUNTEERING: 'volunteering',
    PUBLICATIONS: 'publications',
    AWARDS: 'awards',
    REFERENCES: 'references',
    DAY_IN_LIFE: 'dayInLife',
    PHILOSOPHY: 'philosophy',
    STRENGTHS: 'strengths',
    PASSIONS: 'passions',
    INTERESTS: 'interests',
    CONFERENCES: 'conferences',
    PATENTS: 'patents',
    PROFESSIONAL_MEMBERSHIPS: 'professionalMemberships',
    TESTIMONIALS: 'testimonials',
    CUSTOM: 'custom'
};

/**
 * Section template definitions
 */
const SectionTemplates = {
    [SectionTypes.HEADER]: {
        type: SectionTypes.HEADER,
        name: 'Header',
        icon: '👤',
        required: true,
        description: 'Your name and contact information',
        defaultContent: {
            fullName: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            website: '',
            portfolio: ''
        },
        fields: [
            { key: 'fullName', label: 'Full Name', type: 'text', required: true },
            { key: 'title', label: 'Professional Title', type: 'text', required: false },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'phone', label: 'Phone', type: 'tel', required: false },
            { key: 'location', label: 'Location', type: 'text', required: false },
            { key: 'linkedin', label: 'LinkedIn', type: 'url', required: false },
            { key: 'github', label: 'GitHub', type: 'url', required: false },
            { key: 'website', label: 'Website', type: 'url', required: false },
            { key: 'portfolio', label: 'Portfolio', type: 'url', required: false }
        ]
    },

    [SectionTypes.SUMMARY]: {
        type: SectionTypes.SUMMARY,
        name: 'Professional Summary',
        icon: '📝',
        required: false,
        description: 'Brief overview of your professional background',
        defaultContent: {
            text: ''
        },
        fields: [
            { key: 'text', label: 'Summary', type: 'textarea', required: true, rows: 5 }
        ]
    },

    [SectionTypes.EXPERIENCE]: {
        type: SectionTypes.EXPERIENCE,
        name: 'Work Experience',
        icon: '💼',
        required: false,
        description: 'Your employment history',
        defaultContent: {
            items: []
        },
        itemSchema: {
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            highlights: []
        },
        fields: [
            { key: 'company', label: 'Company', type: 'text', required: true },
            { key: 'position', label: 'Position', type: 'text', required: true },
            { key: 'location', label: 'Location', type: 'text', required: false },
            { key: 'startDate', label: 'Start Date', type: 'month', required: true },
            { key: 'endDate', label: 'End Date', type: 'month', required: false },
            { key: 'current', label: 'Current Position', type: 'checkbox', required: false },
            { key: 'highlights', label: 'Key Achievements', type: 'list', required: false }
        ]
    },

    [SectionTypes.EDUCATION]: {
        type: SectionTypes.EDUCATION,
        name: 'Education',
        icon: '🎓',
        required: false,
        description: 'Your educational background',
        defaultContent: {
            items: []
        },
        itemSchema: {
            institution: '',
            degree: '',
            field: '',
            location: '',
            graduationDate: '',
            gpa: '',
            honors: []
        },
        fields: [
            { key: 'institution', label: 'Institution', type: 'text', required: true },
            { key: 'degree', label: 'Degree', type: 'text', required: true },
            { key: 'field', label: 'Field of Study', type: 'text', required: false },
            { key: 'location', label: 'Location', type: 'text', required: false },
            { key: 'graduationDate', label: 'Graduation Date', type: 'month', required: false },
            { key: 'gpa', label: 'GPA', type: 'text', required: false },
            { key: 'honors', label: 'Honors & Activities', type: 'list', required: false }
        ]
    },

    [SectionTypes.SKILLS]: {
        type: SectionTypes.SKILLS,
        name: 'Skills',
        icon: '⚡',
        required: false,
        description: 'Technical and professional skills',
        defaultContent: {
            categories: []
        },
        categorySchema: {
            name: '',
            skills: []
        },
        fields: [
            { key: 'name', label: 'Category Name', type: 'text', required: true },
            { key: 'skills', label: 'Skills', type: 'tags', required: true }
        ]
    },

    [SectionTypes.CERTIFICATIONS]: {
        type: SectionTypes.CERTIFICATIONS,
        name: 'Certifications',
        icon: '📜',
        required: false,
        description: 'Professional certifications and licenses',
        defaultContent: {
            items: []
        },
        itemSchema: {
            name: '',
            issuer: '',
            issueDate: '',
            expiryDate: '',
            credentialId: '',
            credentialUrl: ''
        },
        fields: [
            { key: 'name', label: 'Certification Name', type: 'text', required: true },
            { key: 'issuer', label: 'Issuing Organization', type: 'text', required: true },
            { key: 'issueDate', label: 'Issue Date', type: 'month', required: false },
            { key: 'expiryDate', label: 'Expiry Date', type: 'month', required: false },
            { key: 'credentialId', label: 'Credential ID', type: 'text', required: false },
            { key: 'credentialUrl', label: 'Credential URL', type: 'url', required: false }
        ]
    },

    [SectionTypes.PROJECTS]: {
        type: SectionTypes.PROJECTS,
        name: 'Projects',
        icon: '🚀',
        required: false,
        description: 'Notable projects you have worked on',
        defaultContent: {
            items: []
        },
        itemSchema: {
            name: '',
            description: '',
            role: '',
            technologies: [],
            startDate: '',
            endDate: '',
            url: '',
            highlights: []
        },
        fields: [
            { key: 'name', label: 'Project Name', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: true, rows: 3 },
            { key: 'role', label: 'Your Role', type: 'text', required: false },
            { key: 'technologies', label: 'Technologies Used', type: 'tags', required: false },
            { key: 'startDate', label: 'Start Date', type: 'month', required: false },
            { key: 'endDate', label: 'End Date', type: 'month', required: false },
            { key: 'url', label: 'Project URL', type: 'url', required: false },
            { key: 'highlights', label: 'Key Achievements', type: 'list', required: false }
        ]
    },

    [SectionTypes.ACHIEVEMENTS]: {
        type: SectionTypes.ACHIEVEMENTS,
        name: 'Achievements',
        icon: '🏆',
        required: false,
        description: 'Notable accomplishments and recognitions',
        defaultContent: {
            items: []
        },
        itemSchema: {
            title: '',
            description: '',
            date: ''
        },
        fields: [
            { key: 'title', label: 'Achievement Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 3 },
            { key: 'date', label: 'Date', type: 'month', required: false }
        ]
    },

    [SectionTypes.LANGUAGES]: {
        type: SectionTypes.LANGUAGES,
        name: 'Languages',
        icon: '🌍',
        required: false,
        description: 'Languages you speak',
        defaultContent: {
            items: []
        },
        itemSchema: {
            language: '',
            proficiency: ''
        },
        fields: [
            { key: 'language', label: 'Language', type: 'text', required: true },
            {
                key: 'proficiency',
                label: 'Proficiency',
                type: 'select',
                required: true,
                options: [
                    { value: 'native', label: 'Native' },
                    { value: 'fluent', label: 'Fluent' },
                    { value: 'advanced', label: 'Advanced' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'basic', label: 'Basic' }
                ]
            }
        ]
    },

    [SectionTypes.VOLUNTEERING]: {
        type: SectionTypes.VOLUNTEERING,
        name: 'Volunteer Experience',
        icon: '🤝',
        required: false,
        description: 'Volunteer work and community service',
        defaultContent: {
            items: []
        },
        itemSchema: {
            organization: '',
            role: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            highlights: []
        },
        fields: [
            { key: 'organization', label: 'Organization', type: 'text', required: true },
            { key: 'role', label: 'Role', type: 'text', required: true },
            { key: 'location', label: 'Location', type: 'text', required: false },
            { key: 'startDate', label: 'Start Date', type: 'month', required: false },
            { key: 'endDate', label: 'End Date', type: 'month', required: false },
            { key: 'current', label: 'Current', type: 'checkbox', required: false },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 3 },
            { key: 'highlights', label: 'Key Contributions', type: 'list', required: false }
        ]
    },

    [SectionTypes.PUBLICATIONS]: {
        type: SectionTypes.PUBLICATIONS,
        name: 'Publications',
        icon: '📚',
        required: false,
        description: 'Published works and articles',
        defaultContent: {
            items: []
        },
        itemSchema: {
            title: '',
            publisher: '',
            date: '',
            url: '',
            authors: '',
            description: ''
        },
        fields: [
            { key: 'title', label: 'Publication Title', type: 'text', required: true },
            { key: 'publisher', label: 'Publisher', type: 'text', required: false },
            { key: 'date', label: 'Publication Date', type: 'month', required: false },
            { key: 'url', label: 'URL', type: 'url', required: false },
            { key: 'authors', label: 'Authors', type: 'text', required: false },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 3 }
        ]
    },

    [SectionTypes.AWARDS]: {
        type: SectionTypes.AWARDS,
        name: 'Awards & Honors',
        icon: '🌟',
        required: false,
        description: 'Awards and recognition received',
        defaultContent: {
            items: []
        },
        itemSchema: {
            title: '',
            issuer: '',
            date: '',
            description: ''
        },
        fields: [
            { key: 'title', label: 'Award Title', type: 'text', required: true },
            { key: 'issuer', label: 'Issuing Organization', type: 'text', required: false },
            { key: 'date', label: 'Date', type: 'month', required: false },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 3 }
        ]
    },

    [SectionTypes.REFERENCES]: {
        type: SectionTypes.REFERENCES,
        name: 'References',
        icon: '✉️',
        required: false,
        description: 'Professional references',
        defaultContent: {
            items: [],
            availableOnRequest: true
        },
        itemSchema: {
            name: '',
            title: '',
            company: '',
            email: '',
            phone: '',
            relationship: ''
        },
        fields: [
            { key: 'name', label: 'Name', type: 'text', required: true },
            { key: 'title', label: 'Title', type: 'text', required: false },
            { key: 'company', label: 'Company', type: 'text', required: false },
            { key: 'email', label: 'Email', type: 'email', required: false },
            { key: 'phone', label: 'Phone', type: 'tel', required: false },
            { key: 'relationship', label: 'Relationship', type: 'text', required: false }
        ]
    },

    [SectionTypes.DAY_IN_LIFE]: {
        type: SectionTypes.DAY_IN_LIFE,
        name: 'A Day in My Life',
        icon: '📅',
        required: false,
        description: 'What a typical day looks like for you',
        defaultContent: {
            text: ''
        },
        fields: [
            { key: 'text', label: 'Description', type: 'textarea', required: true, rows: 5 }
        ]
    },

    [SectionTypes.PHILOSOPHY]: {
        type: SectionTypes.PHILOSOPHY,
        name: 'Work Philosophy',
        icon: '💭',
        required: false,
        description: 'Your professional philosophy and approach',
        defaultContent: {
            text: ''
        },
        fields: [
            { key: 'text', label: 'Philosophy', type: 'textarea', required: true, rows: 5 }
        ]
    },

    [SectionTypes.STRENGTHS]: {
        type: SectionTypes.STRENGTHS,
        name: 'Key Strengths',
        icon: '💪',
        required: false,
        description: 'Your core strengths and competencies',
        defaultContent: {
            items: []
        },
        itemSchema: {
            strength: '',
            description: ''
        },
        fields: [
            { key: 'strength', label: 'Strength', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 2 }
        ]
    },

    [SectionTypes.PASSIONS]: {
        type: SectionTypes.PASSIONS,
        name: 'Passions',
        icon: '❤️',
        required: false,
        description: 'What drives and motivates you',
        defaultContent: {
            items: []
        },
        itemSchema: {
            passion: '',
            description: ''
        },
        fields: [
            { key: 'passion', label: 'Passion', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 2 }
        ]
    },

    [SectionTypes.INTERESTS]: {
        type: SectionTypes.INTERESTS,
        name: 'Interests',
        icon: '🎯',
        required: false,
        description: 'Personal and professional interests',
        defaultContent: {
            items: []
        },
        fields: [
            { key: 'items', label: 'Interests', type: 'tags', required: true }
        ]
    },

    [SectionTypes.CONFERENCES]: {
        type: SectionTypes.CONFERENCES,
        name: 'Conferences & Events',
        icon: '🎤',
        required: false,
        description: 'Conferences and events attended or spoken at',
        defaultContent: {
            items: []
        },
        itemSchema: {
            name: '',
            role: '',
            location: '',
            date: '',
            description: ''
        },
        fields: [
            { key: 'name', label: 'Event Name', type: 'text', required: true },
            {
                key: 'role',
                label: 'Role',
                type: 'select',
                required: false,
                options: [
                    { value: 'speaker', label: 'Speaker' },
                    { value: 'panelist', label: 'Panelist' },
                    { value: 'attendee', label: 'Attendee' },
                    { value: 'organizer', label: 'Organizer' }
                ]
            },
            { key: 'location', label: 'Location', type: 'text', required: false },
            { key: 'date', label: 'Date', type: 'month', required: false },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 3 }
        ]
    },

    [SectionTypes.PATENTS]: {
        type: SectionTypes.PATENTS,
        name: 'Patents',
        icon: '⚖️',
        required: false,
        description: 'Patents filed or awarded',
        defaultContent: {
            items: []
        },
        itemSchema: {
            title: '',
            patentNumber: '',
            status: '',
            date: '',
            description: '',
            inventors: ''
        },
        fields: [
            { key: 'title', label: 'Patent Title', type: 'text', required: true },
            { key: 'patentNumber', label: 'Patent Number', type: 'text', required: false },
            {
                key: 'status',
                label: 'Status',
                type: 'select',
                required: false,
                options: [
                    { value: 'granted', label: 'Granted' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'filed', label: 'Filed' }
                ]
            },
            { key: 'date', label: 'Date', type: 'month', required: false },
            { key: 'description', label: 'Description', type: 'textarea', required: false, rows: 3 },
            { key: 'inventors', label: 'Co-Inventors', type: 'text', required: false }
        ]
    },

    [SectionTypes.PROFESSIONAL_MEMBERSHIPS]: {
        type: SectionTypes.PROFESSIONAL_MEMBERSHIPS,
        name: 'Professional Memberships',
        icon: '👔',
        required: false,
        description: 'Memberships in professional organizations',
        defaultContent: {
            items: []
        },
        itemSchema: {
            organization: '',
            role: '',
            startDate: '',
            endDate: '',
            current: false
        },
        fields: [
            { key: 'organization', label: 'Organization', type: 'text', required: true },
            { key: 'role', label: 'Role/Position', type: 'text', required: false },
            { key: 'startDate', label: 'Start Date', type: 'month', required: false },
            { key: 'endDate', label: 'End Date', type: 'month', required: false },
            { key: 'current', label: 'Current Member', type: 'checkbox', required: false }
        ]
    },

    [SectionTypes.TESTIMONIALS]: {
        type: SectionTypes.TESTIMONIALS,
        name: 'Testimonials',
        icon: '💬',
        required: false,
        description: 'Testimonials from colleagues and clients',
        defaultContent: {
            items: []
        },
        itemSchema: {
            author: '',
            title: '',
            company: '',
            text: '',
            date: ''
        },
        fields: [
            { key: 'author', label: 'Author Name', type: 'text', required: true },
            { key: 'title', label: 'Author Title', type: 'text', required: false },
            { key: 'company', label: 'Company', type: 'text', required: false },
            { key: 'text', label: 'Testimonial', type: 'textarea', required: true, rows: 4 },
            { key: 'date', label: 'Date', type: 'month', required: false }
        ]
    },

    [SectionTypes.CUSTOM]: {
        type: SectionTypes.CUSTOM,
        name: 'Custom Section',
        icon: '✏️',
        required: false,
        description: 'Create your own custom section',
        defaultContent: {
            title: '',
            content: ''
        },
        fields: [
            { key: 'title', label: 'Section Title', type: 'text', required: true },
            { key: 'content', label: 'Content', type: 'textarea', required: true, rows: 5 }
        ]
    }
};

/**
 * Section Manager - Factory and utility methods
 */
class SectionManager {
    /**
     * Create a new section instance
     */
    static createSection(type, customData = {}) {
        const template = SectionTemplates[type];
        if (!template) {
            throw new Error(`Unknown section type: ${type}`);
        }

        return {
            id: this.generateId(),
            type: template.type,
            name: template.name,
            icon: template.icon,
            required: template.required,
            content: { ...template.defaultContent, ...customData },
            visible: true,
            locked: template.required
        };
    }

    /**
     * Get section template
     */
    static getTemplate(type) {
        return SectionTemplates[type];
    }

    /**
     * Get all section types
     */
    static getAllTypes() {
        return Object.values(SectionTypes);
    }

    /**
     * Get all section templates
     */
    static getAllTemplates() {
        return Object.values(SectionTemplates);
    }

    /**
     * Get available sections (non-required)
     */
    static getAvailableSections() {
        return Object.values(SectionTemplates).filter(t => !t.required);
    }

    /**
     * Validate section data
     */
    static validateSection(section) {
        const template = SectionTemplates[section.type];
        if (!template) {
            return { valid: false, errors: ['Invalid section type'] };
        }

        const errors = [];
        const fields = template.fields || [];

        fields.forEach(field => {
            if (field.required) {
                const value = section.content[field.key];
                if (value === undefined || value === null || value === '') {
                    errors.push(`${field.label} is required`);
                }
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return 'section-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Clone a section
     */
    static cloneSection(section) {
        return {
            ...section,
            id: this.generateId(),
            content: JSON.parse(JSON.stringify(section.content))
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SectionTypes, SectionTemplates, SectionManager };
}
