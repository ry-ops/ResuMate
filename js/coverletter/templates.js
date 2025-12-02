/**
 * Cover Letter Template Engine
 * Manages template registry, variable substitution, and fill-in-the-blank functionality
 */

class CoverLetterTemplateEngine {
  constructor() {
    this.templates = new Map();
    this.currentTemplate = null;
    this.currentVariables = {};
    this.initializeTemplates();
  }

  /**
   * Initialize template registry with metadata
   */
  initializeTemplates() {
    // Template 1: Traditional Professional
    this.registerTemplate({
      id: 'traditional',
      name: 'Traditional Professional',
      category: 'traditional',
      industry: ['corporate', 'finance', 'legal', 'consulting'],
      careerLevel: 'mid-senior',
      tone: 'professional',
      description: 'Conservative, formal tone ideal for corporate environments',
      structure: {
        opening: 'Dear {{hiring_manager_name}},\n\nI am writing to express my strong interest in the {{job_title}} position at {{company_name}}. With {{years_experience}} years of experience in {{industry}}, I am confident that my background and expertise align perfectly with the requirements outlined in your job posting.',
        body1: '{{experience_highlight_1}}\n\nIn my current role as {{current_title}} at {{current_company}}, I have {{achievement_1}}. This experience has strengthened my abilities in {{key_skill_1}} and {{key_skill_2}}, which I understand are critical for success in this position.',
        body2: 'My qualifications include {{qualification_1}}, {{qualification_2}}, and {{qualification_3}}. I am particularly proud of {{achievement_2}}, which demonstrates my commitment to {{value_proposition}}.',
        body3: 'I am impressed by {{company_attribute}} and believe my experience in {{relevant_experience}} would enable me to contribute meaningfully to your team. I am particularly drawn to {{specific_interest}} and would welcome the opportunity to bring my expertise to {{company_name}}.',
        closing: 'Thank you for considering my application. I look forward to the opportunity to discuss how my background, skills, and enthusiasm can contribute to {{company_name}}\'s continued success. I am available at your convenience for an interview.\n\nSincerely,\n{{your_name}}\n{{your_phone}}\n{{your_email}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'John Smith' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'john.smith@email.com' },
        { name: 'hiring_manager_name', label: 'Hiring Manager Name', type: 'text', required: false, placeholder: 'Hiring Manager or specific name' },
        { name: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'Senior Financial Analyst' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'ABC Corporation' },
        { name: 'years_experience', label: 'Years of Experience', type: 'number', required: true, placeholder: '7' },
        { name: 'industry', label: 'Your Industry', type: 'text', required: true, placeholder: 'financial services' },
        { name: 'current_title', label: 'Current Job Title', type: 'text', required: true, placeholder: 'Financial Analyst' },
        { name: 'current_company', label: 'Current Company', type: 'text', required: true, placeholder: 'XYZ Financial' },
        { name: 'experience_highlight_1', label: 'Key Experience Highlight', type: 'textarea', required: true, placeholder: 'Throughout my career, I have developed a strong foundation in financial modeling and risk analysis.' },
        { name: 'achievement_1', label: 'Major Achievement #1', type: 'textarea', required: true, placeholder: 'led the implementation of a new portfolio management system that reduced processing time by 40%' },
        { name: 'key_skill_1', label: 'Key Skill #1', type: 'text', required: true, placeholder: 'quantitative analysis' },
        { name: 'key_skill_2', label: 'Key Skill #2', type: 'text', required: true, placeholder: 'strategic planning' },
        { name: 'qualification_1', label: 'Qualification #1', type: 'text', required: true, placeholder: 'CFA certification' },
        { name: 'qualification_2', label: 'Qualification #2', type: 'text', required: true, placeholder: 'MBA in Finance' },
        { name: 'qualification_3', label: 'Qualification #3', type: 'text', required: true, placeholder: 'extensive experience with Bloomberg Terminal' },
        { name: 'achievement_2', label: 'Major Achievement #2', type: 'textarea', required: true, placeholder: 'developing a risk assessment framework that identified $2M in cost savings' },
        { name: 'value_proposition', label: 'Your Value Proposition', type: 'text', required: true, placeholder: 'excellence and continuous improvement' },
        { name: 'company_attribute', label: 'Company Attribute You Admire', type: 'text', required: true, placeholder: 'ABC Corporation\'s reputation for innovation in financial technology' },
        { name: 'relevant_experience', label: 'Relevant Experience Area', type: 'text', required: true, placeholder: 'enterprise-level financial systems' },
        { name: 'specific_interest', label: 'Specific Interest in Role/Company', type: 'textarea', required: true, placeholder: 'the opportunity to work on international portfolio management' }
      ],
      tips: 'Best for traditional corporate environments. Keep tone formal and focus on achievements with metrics. Research the company thoroughly and mention specific attributes.',
      example: null // Will be generated on demand
    });

    // Template 2: Modern Conversational
    this.registerTemplate({
      id: 'modern',
      name: 'Modern Conversational',
      category: 'modern',
      industry: ['tech', 'startups', 'creative', 'digital'],
      careerLevel: 'entry-mid-senior',
      tone: 'conversational',
      description: 'Friendly but professional, ideal for modern tech companies',
      structure: {
        opening: 'Hi {{hiring_manager_name}},\n\nI\'m excited to apply for the {{job_title}} role at {{company_name}}. {{opening_hook}}',
        body1: 'Here\'s why I think I\'d be a great fit:\n\n{{value_proposition}}\n\nAt {{current_company}}, I {{achievement_story}}. {{achievement_impact}}',
        body2: 'What really draws me to {{company_name}} is {{company_interest}}. I\'ve been following your work on {{specific_project_or_product}}, and I love how you {{what_you_admire}}.',
        body3: 'I bring {{key_strength_1}}, {{key_strength_2}}, and {{key_strength_3}} to the table. Plus, I\'m genuinely passionate about {{passion_area}}, which aligns perfectly with {{company_name}}\'s mission.',
        closing: 'I\'d love to chat more about how I can contribute to {{team_or_project}}. Feel free to reach out anytime!\n\nBest,\n{{your_name}}\n{{your_phone}} | {{your_email}}\n{{linkedin_url}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'Alex Chen' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '555-123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'alex.chen@email.com' },
        { name: 'linkedin_url', label: 'LinkedIn URL (optional)', type: 'url', required: false, placeholder: 'linkedin.com/in/alexchen' },
        { name: 'hiring_manager_name', label: 'Hiring Manager Name', type: 'text', required: false, placeholder: 'Hiring Team or specific name' },
        { name: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'Senior Product Designer' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'TechFlow' },
        { name: 'opening_hook', label: 'Opening Hook', type: 'textarea', required: true, placeholder: 'When I saw this posting, it felt like the perfect next step in my design journey. I\'ve spent the last 5 years crafting user experiences that people actually love using.' },
        { name: 'value_proposition', label: 'Your Value Proposition', type: 'textarea', required: true, placeholder: 'I\'m a product designer who believes great design solves real problems, not just looks pretty. I\'ve led design for 3 B2B SaaS products that went from concept to 100K+ users.' },
        { name: 'current_company', label: 'Current/Recent Company', type: 'text', required: true, placeholder: 'DesignLab' },
        { name: 'achievement_story', label: 'Achievement Story', type: 'textarea', required: true, placeholder: 'redesigned our entire onboarding flow based on user research and testing' },
        { name: 'achievement_impact', label: 'Achievement Impact', type: 'textarea', required: true, placeholder: 'The result? We increased user activation by 65% and cut support tickets in half.' },
        { name: 'company_interest', label: 'Why This Company', type: 'textarea', required: true, placeholder: 'how you\'re reimagining collaboration tools for remote teams' },
        { name: 'specific_project_or_product', label: 'Specific Project/Product', type: 'text', required: true, placeholder: 'your new whiteboarding feature' },
        { name: 'what_you_admire', label: 'What You Admire', type: 'textarea', required: true, placeholder: 'prioritize simplicity without sacrificing functionality' },
        { name: 'key_strength_1', label: 'Key Strength #1', type: 'text', required: true, placeholder: 'user research skills' },
        { name: 'key_strength_2', label: 'Key Strength #2', type: 'text', required: true, placeholder: 'systems thinking' },
        { name: 'key_strength_3', label: 'Key Strength #3', type: 'text', required: true, placeholder: 'the ability to turn complex problems into elegant solutions' },
        { name: 'passion_area', label: 'Passion Area', type: 'text', required: true, placeholder: 'making technology more accessible' },
        { name: 'team_or_project', label: 'Team/Project You Want to Join', type: 'text', required: true, placeholder: 'the product team' }
      ],
      tips: 'Perfect for startups and tech companies. Use a conversational tone but remain professional. Show personality and genuine enthusiasm. Mention specific products or projects.',
      example: null
    });

    // Template 3: Career Changer
    this.registerTemplate({
      id: 'career-changer',
      name: 'Career Changer',
      category: 'specialized',
      industry: ['any'],
      careerLevel: 'mid-senior',
      tone: 'professional',
      description: 'Addresses career transitions and emphasizes transferable skills',
      structure: {
        opening: 'Dear {{hiring_manager_name}},\n\nI am writing to express my enthusiasm for the {{job_title}} position at {{company_name}}. After {{years_in_previous_field}} years in {{previous_industry}}, I am excited to transition into {{new_industry}}, bringing a unique perspective and valuable transferable skills.',
        body1: 'My background in {{previous_industry}} has equipped me with {{transferable_skill_1}}, {{transferable_skill_2}}, and {{transferable_skill_3}}. While my career path may appear non-traditional, {{transition_reasoning}}.',
        body2: 'To prepare for this transition, I have {{preparation_steps}}. This includes {{specific_preparation}}, demonstrating my commitment and readiness to excel in this new field.',
        body3: 'What excites me most about {{company_name}} is {{company_appeal}}. My experience in {{previous_industry}} has given me {{unique_perspective}}, which I believe will be valuable in {{how_perspective_helps}}.',
        closing: 'I would welcome the opportunity to discuss how my diverse background can bring fresh insights and proven capabilities to your team. Thank you for considering my application.\n\nSincerely,\n{{your_name}}\n{{your_phone}}\n{{your_email}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'Jordan Martinez' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'jordan.martinez@email.com' },
        { name: 'hiring_manager_name', label: 'Hiring Manager Name', type: 'text', required: false, placeholder: 'Hiring Manager' },
        { name: 'job_title', label: 'Target Job Title', type: 'text', required: true, placeholder: 'UX Researcher' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'UserFirst Inc.' },
        { name: 'years_in_previous_field', label: 'Years in Previous Field', type: 'number', required: true, placeholder: '8' },
        { name: 'previous_industry', label: 'Previous Industry', type: 'text', required: true, placeholder: 'market research' },
        { name: 'new_industry', label: 'New Industry/Field', type: 'text', required: true, placeholder: 'UX research and product design' },
        { name: 'transferable_skill_1', label: 'Transferable Skill #1', type: 'text', required: true, placeholder: 'strong analytical abilities' },
        { name: 'transferable_skill_2', label: 'Transferable Skill #2', type: 'text', required: true, placeholder: 'user-centered research methodologies' },
        { name: 'transferable_skill_3', label: 'Transferable Skill #3', type: 'text', required: true, placeholder: 'the ability to translate complex data into actionable insights' },
        { name: 'transition_reasoning', label: 'Why This Transition Makes Sense', type: 'textarea', required: true, placeholder: 'I\'ve realized that the skills I\'ve honed in market research translate directly to understanding user needs and behaviors in digital product design' },
        { name: 'preparation_steps', label: 'Preparation Steps Taken', type: 'textarea', required: true, placeholder: 'completed a UX Research certification, conducted 5 freelance UX projects, and attended industry conferences' },
        { name: 'specific_preparation', label: 'Specific Preparation Example', type: 'textarea', required: true, placeholder: 'leading a user research study for a mobile app that resulted in a 40% increase in user engagement' },
        { name: 'company_appeal', label: 'What Appeals About Company', type: 'textarea', required: true, placeholder: 'your commitment to user-centered design and data-driven decision making' },
        { name: 'unique_perspective', label: 'Unique Perspective You Bring', type: 'textarea', required: true, placeholder: 'a deep understanding of both quantitative and qualitative research methods' },
        { name: 'how_perspective_helps', label: 'How Your Perspective Helps', type: 'textarea', required: true, placeholder: 'bridging the gap between business objectives and user needs' }
      ],
      tips: 'Address the career change directly and positively. Emphasize transferable skills and show preparation. Explain why the transition makes sense and what unique value you bring.',
      example: null
    });

    // Template 4: Entry Level / New Grad
    this.registerTemplate({
      id: 'entry-level',
      name: 'Entry Level / New Graduate',
      category: 'specialized',
      industry: ['any'],
      careerLevel: 'entry',
      tone: 'enthusiastic',
      description: 'Emphasizes education, potential, and eagerness to learn',
      structure: {
        opening: 'Dear {{hiring_manager_name}},\n\nAs a recent graduate from {{university}} with a degree in {{degree}}, I am excited to apply for the {{job_title}} position at {{company_name}}. I am eager to launch my career in {{industry}} and believe this role is the perfect opportunity to apply my skills and continue learning.',
        body1: 'During my time at {{university}}, I {{academic_achievement}}. My coursework in {{relevant_coursework}} provided me with a strong foundation in {{key_skill_1}} and {{key_skill_2}}.',
        body2: 'I gained practical experience through {{experience_type}} at {{organization}}, where I {{practical_achievement}}. Additionally, I {{project_or_activity}}, which taught me {{lesson_learned}}.',
        body3: 'I am particularly drawn to {{company_name}} because {{why_this_company}}. I am confident that my {{personal_qualities}}, combined with my technical skills and enthusiasm, would make me a valuable addition to your team.',
        closing: 'I am eager to contribute my energy, fresh perspective, and strong work ethic to {{company_name}}. Thank you for considering my application. I look forward to the opportunity to discuss how I can grow with your organization.\n\nSincerely,\n{{your_name}}\n{{your_phone}}\n{{your_email}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'Emily Thompson' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'emily.thompson@email.com' },
        { name: 'hiring_manager_name', label: 'Hiring Manager Name', type: 'text', required: false, placeholder: 'Hiring Manager' },
        { name: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'Junior Software Developer' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'TechStart Solutions' },
        { name: 'university', label: 'University/College', type: 'text', required: true, placeholder: 'State University' },
        { name: 'degree', label: 'Degree', type: 'text', required: true, placeholder: 'Computer Science' },
        { name: 'industry', label: 'Industry/Field', type: 'text', required: true, placeholder: 'software development' },
        { name: 'academic_achievement', label: 'Academic Achievement', type: 'textarea', required: true, placeholder: 'graduated with honors (3.8 GPA) and was selected for the Dean\'s List for four consecutive semesters' },
        { name: 'relevant_coursework', label: 'Relevant Coursework', type: 'text', required: true, placeholder: 'Data Structures, Web Development, and Database Systems' },
        { name: 'key_skill_1', label: 'Key Skill #1', type: 'text', required: true, placeholder: 'full-stack development' },
        { name: 'key_skill_2', label: 'Key Skill #2', type: 'text', required: true, placeholder: 'problem-solving' },
        { name: 'experience_type', label: 'Experience Type', type: 'text', required: true, placeholder: 'a summer internship' },
        { name: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'Digital Innovations Inc.' },
        { name: 'practical_achievement', label: 'Practical Achievement', type: 'textarea', required: true, placeholder: 'contributed to the development of a customer portal that improved user engagement by 30%' },
        { name: 'project_or_activity', label: 'Project/Activity', type: 'textarea', required: true, placeholder: 'led a team of four students in developing a mobile app for campus events management' },
        { name: 'lesson_learned', label: 'Lesson Learned', type: 'text', required: true, placeholder: 'the importance of collaboration and agile methodologies' },
        { name: 'why_this_company', label: 'Why This Company', type: 'textarea', required: true, placeholder: 'of your reputation for mentoring junior developers and your innovative work in cloud computing' },
        { name: 'personal_qualities', label: 'Personal Qualities', type: 'text', required: true, placeholder: 'dedication, adaptability, and passion for technology' }
      ],
      tips: 'Highlight education, projects, internships, and extracurricular activities. Show enthusiasm and willingness to learn. Emphasize potential and soft skills.',
      example: null
    });

    // Template 5: Executive / Senior
    this.registerTemplate({
      id: 'executive',
      name: 'Executive / Senior Leadership',
      category: 'traditional',
      industry: ['executive', 'leadership', 'c-suite'],
      careerLevel: 'executive',
      tone: 'professional',
      description: 'Leadership-focused with strategic thinking emphasis',
      structure: {
        opening: 'Dear {{hiring_manager_name}},\n\nI am writing to express my interest in the {{job_title}} position at {{company_name}}. With over {{years_experience}} years of progressive leadership experience in {{industry}}, I have a proven track record of {{leadership_summary}}.',
        body1: 'Throughout my career, I have {{career_highlight}}. Most recently, as {{current_title}} at {{current_company}}, I led {{leadership_achievement}}, resulting in {{measurable_impact}}.',
        body2: 'My leadership philosophy centers on {{leadership_philosophy}}. I have consistently demonstrated the ability to {{leadership_capability_1}}, {{leadership_capability_2}}, and {{leadership_capability_3}}. Under my direction, teams have {{team_achievement}}.',
        body3: 'I am drawn to {{company_name}} because of {{strategic_interest}}. I see significant opportunities to {{strategic_contribution}} and believe my experience in {{relevant_expertise}} positions me to drive meaningful impact from day one.',
        closing: 'I would welcome the opportunity to discuss how my strategic vision and operational expertise can contribute to {{company_name}}\'s continued growth and success. Thank you for your consideration.\n\nSincerely,\n{{your_name}}\n{{your_phone}}\n{{your_email}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'Michael Anderson' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'michael.anderson@email.com' },
        { name: 'hiring_manager_name', label: 'Hiring Manager/Board Contact', type: 'text', required: false, placeholder: 'Board of Directors or specific name' },
        { name: 'job_title', label: 'Target Position', type: 'text', required: true, placeholder: 'Chief Technology Officer' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Global Tech Corporation' },
        { name: 'years_experience', label: 'Years of Experience', type: 'number', required: true, placeholder: '20' },
        { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'enterprise technology and digital transformation' },
        { name: 'leadership_summary', label: 'Leadership Summary', type: 'textarea', required: true, placeholder: 'driving digital transformation initiatives, building high-performing teams, and delivering sustainable revenue growth' },
        { name: 'career_highlight', label: 'Career Highlight', type: 'textarea', required: true, placeholder: 'held leadership positions at three Fortune 500 companies, scaling technology organizations from 50 to 500+ team members' },
        { name: 'current_title', label: 'Current/Recent Title', type: 'text', required: true, placeholder: 'VP of Engineering' },
        { name: 'current_company', label: 'Current/Recent Company', type: 'text', required: true, placeholder: 'TechCorp International' },
        { name: 'leadership_achievement', label: 'Leadership Achievement', type: 'textarea', required: true, placeholder: 'a comprehensive cloud migration strategy across 15 business units' },
        { name: 'measurable_impact', label: 'Measurable Impact', type: 'textarea', required: true, placeholder: '$50M in cost savings and 40% improvement in system performance' },
        { name: 'leadership_philosophy', label: 'Leadership Philosophy', type: 'textarea', required: true, placeholder: 'empowering teams through clear vision, fostering innovation, and maintaining accountability' },
        { name: 'leadership_capability_1', label: 'Leadership Capability #1', type: 'text', required: true, placeholder: 'develop and execute strategic technology roadmaps' },
        { name: 'leadership_capability_2', label: 'Leadership Capability #2', type: 'text', required: true, placeholder: 'build and mentor world-class engineering teams' },
        { name: 'leadership_capability_3', label: 'Leadership Capability #3', type: 'text', required: true, placeholder: 'align technology initiatives with business objectives' },
        { name: 'team_achievement', label: 'Team Achievement', type: 'textarea', required: true, placeholder: 'achieved industry-leading retention rates and consistently exceeded performance targets' },
        { name: 'strategic_interest', label: 'Strategic Interest in Company', type: 'textarea', required: true, placeholder: 'your ambitious growth plans and commitment to innovation in the enterprise SaaS space' },
        { name: 'strategic_contribution', label: 'Strategic Contribution', type: 'textarea', required: true, placeholder: 'accelerate your product development velocity while enhancing architectural scalability' },
        { name: 'relevant_expertise', label: 'Relevant Expertise', type: 'text', required: true, placeholder: 'scaling technology organizations during hyper-growth phases' }
      ],
      tips: 'Focus on strategic thinking, measurable business impact, and leadership philosophy. Use specific metrics and demonstrate executive presence. Show understanding of business context.',
      example: null
    });

    // Template 6: Creative Industry
    this.registerTemplate({
      id: 'creative',
      name: 'Creative Industry',
      category: 'modern',
      industry: ['design', 'marketing', 'media', 'advertising', 'arts'],
      careerLevel: 'entry-mid-senior',
      tone: 'enthusiastic',
      description: 'Personality-driven with unique voice for creative roles',
      structure: {
        opening: 'Dear {{hiring_manager_name}},\n\n{{creative_opening}}\n\nThat\'s why I\'m thrilled to apply for the {{job_title}} position at {{company_name}}.',
        body1: 'I\'m a {{professional_identity}} with {{years_experience}} years of experience creating {{what_you_create}}. My approach? {{creative_philosophy}}.',
        body2: 'Some highlights from my portfolio:\n• {{portfolio_highlight_1}}\n• {{portfolio_highlight_2}}\n• {{portfolio_highlight_3}}\n\nYou can see my full portfolio at {{portfolio_url}}.',
        body3: 'What excites me about {{company_name}} is {{creative_appeal}}. I particularly admire {{specific_work}}, and I\'d love to bring my unique perspective on {{creative_strength}} to your team.',
        closing: 'Let\'s create something amazing together. I\'m available to chat about how my creative approach and proven track record can contribute to {{company_name}}\'s next big project.\n\n{{sign_off}}\n{{your_name}}\n{{your_phone}} | {{your_email}}\nPortfolio: {{portfolio_url}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'Maya Rivera' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '555-123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'maya.rivera@email.com' },
        { name: 'portfolio_url', label: 'Portfolio URL', type: 'url', required: true, placeholder: 'mayarivera.design' },
        { name: 'hiring_manager_name', label: 'Hiring Manager Name', type: 'text', required: false, placeholder: 'Creative Director or name' },
        { name: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'Senior Brand Designer' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Creative Collective' },
        { name: 'creative_opening', label: 'Creative Opening Hook', type: 'textarea', required: true, placeholder: 'Great design tells a story. It doesn\'t just look good - it makes people feel something, remember something, do something.' },
        { name: 'professional_identity', label: 'Professional Identity', type: 'text', required: true, placeholder: 'brand designer and visual storyteller' },
        { name: 'years_experience', label: 'Years of Experience', type: 'number', required: true, placeholder: '6' },
        { name: 'what_you_create', label: 'What You Create', type: 'text', required: true, placeholder: 'brand identities that connect with audiences and drive business results' },
        { name: 'creative_philosophy', label: 'Creative Philosophy', type: 'textarea', required: true, placeholder: 'I believe the best work comes from deep research, bold experimentation, and never settling for the first idea' },
        { name: 'portfolio_highlight_1', label: 'Portfolio Highlight #1', type: 'textarea', required: true, placeholder: 'Brand refresh for sustainable fashion startup that increased social engagement 300%' },
        { name: 'portfolio_highlight_2', label: 'Portfolio Highlight #2', type: 'textarea', required: true, placeholder: 'Campaign design for tech company that won an ADDY Award' },
        { name: 'portfolio_highlight_3', label: 'Portfolio Highlight #3', type: 'textarea', required: true, placeholder: 'Complete visual system for health-tech app with 50K+ downloads' },
        { name: 'creative_appeal', label: 'What Appeals Creatively', type: 'textarea', required: true, placeholder: 'how you blend strategic thinking with bold creative execution' },
        { name: 'specific_work', label: 'Specific Work You Admire', type: 'text', required: true, placeholder: 'your recent rebrand campaign' },
        { name: 'creative_strength', label: 'Your Creative Strength', type: 'text', required: true, placeholder: 'blending minimalist aesthetics with emotional storytelling' },
        { name: 'sign_off', label: 'Sign-off', type: 'text', required: true, placeholder: 'Creatively yours' }
      ],
      tips: 'Show personality and creativity. Include portfolio link prominently. Use vivid language and demonstrate your unique perspective. Mention specific creative work you admire.',
      example: null
    });

    // Template 7: Technical / Engineering
    this.registerTemplate({
      id: 'technical',
      name: 'Technical / Engineering',
      category: 'specialized',
      industry: ['engineering', 'data-science', 'IT', 'software', 'tech'],
      careerLevel: 'entry-mid-senior',
      tone: 'professional',
      description: 'Technical expertise focused with problem-solving emphasis',
      structure: {
        opening: 'Dear {{hiring_manager_name}},\n\nI am writing to apply for the {{job_title}} position at {{company_name}}. As a {{professional_title}} with {{years_experience}} years of experience in {{technical_domain}}, I am excited about the opportunity to contribute to {{company_project_or_mission}}.',
        body1: 'My technical expertise includes:\n• {{technical_skill_1}}\n• {{technical_skill_2}}\n• {{technical_skill_3}}\n• {{technical_skill_4}}\n\nI have successfully applied these skills to {{technical_application}}.',
        body2: 'In my current role at {{current_company}}, I {{technical_achievement_1}}. {{achievement_details}}. This resulted in {{technical_impact}}.',
        body3: 'I am particularly interested in {{company_name}}\'s work on {{specific_technical_interest}}. Having worked extensively with {{relevant_technology}}, I am confident I can contribute meaningfully to {{how_you_will_contribute}}. I am also eager to expand my expertise in {{learning_interest}}.',
        closing: 'I would welcome the opportunity to discuss how my technical skills and problem-solving approach can benefit your team. My GitHub profile ({{github_url}}) showcases some of my recent projects.\n\nThank you for your consideration.\n\nSincerely,\n{{your_name}}\n{{your_phone}}\n{{your_email}}\nGitHub: {{github_url}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'David Kim' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'david.kim@email.com' },
        { name: 'github_url', label: 'GitHub/Portfolio URL', type: 'url', required: false, placeholder: 'github.com/davidkim' },
        { name: 'hiring_manager_name', label: 'Hiring Manager Name', type: 'text', required: false, placeholder: 'Hiring Manager' },
        { name: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'Senior Backend Engineer' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'CloudTech Solutions' },
        { name: 'professional_title', label: 'Your Professional Title', type: 'text', required: true, placeholder: 'backend engineer specializing in distributed systems' },
        { name: 'years_experience', label: 'Years of Experience', type: 'number', required: true, placeholder: '7' },
        { name: 'technical_domain', label: 'Technical Domain', type: 'text', required: true, placeholder: 'scalable cloud architecture and microservices' },
        { name: 'company_project_or_mission', label: 'Company Project/Mission', type: 'text', required: true, placeholder: 'building next-generation cloud infrastructure' },
        { name: 'technical_skill_1', label: 'Technical Skill #1', type: 'text', required: true, placeholder: 'Python, Go, and Java for backend development' },
        { name: 'technical_skill_2', label: 'Technical Skill #2', type: 'text', required: true, placeholder: 'AWS, GCP, and Kubernetes for cloud deployment' },
        { name: 'technical_skill_3', label: 'Technical Skill #3', type: 'text', required: true, placeholder: 'PostgreSQL, Redis, and Kafka for data management' },
        { name: 'technical_skill_4', label: 'Technical Skill #4', type: 'text', required: true, placeholder: 'CI/CD pipelines and infrastructure as code (Terraform)' },
        { name: 'technical_application', label: 'Technical Application', type: 'textarea', required: true, placeholder: 'building systems that handle 10M+ requests per day with 99.99% uptime' },
        { name: 'current_company', label: 'Current Company', type: 'text', required: true, placeholder: 'DataFlow Inc.' },
        { name: 'technical_achievement_1', label: 'Technical Achievement', type: 'textarea', required: true, placeholder: 'architected and implemented a new microservices platform that replaced our monolithic architecture' },
        { name: 'achievement_details', label: 'Achievement Details', type: 'textarea', required: true, placeholder: 'The migration involved 12 services, handling data consistency challenges, and ensuring zero downtime during deployment' },
        { name: 'technical_impact', label: 'Technical Impact', type: 'textarea', required: true, placeholder: '50% reduction in deployment time, 3x improvement in system scalability, and $200K annual cost savings' },
        { name: 'specific_technical_interest', label: 'Specific Technical Interest', type: 'text', required: true, placeholder: 'edge computing and distributed caching solutions' },
        { name: 'relevant_technology', label: 'Relevant Technology', type: 'text', required: true, placeholder: 'distributed systems and high-performance APIs' },
        { name: 'how_you_will_contribute', label: 'How You Will Contribute', type: 'textarea', required: true, placeholder: 'optimizing your platform\'s performance and scalability' },
        { name: 'learning_interest', label: 'Learning Interest', type: 'text', required: true, placeholder: 'Rust and WebAssembly' }
      ],
      tips: 'Use technical language appropriately. Include specific technologies and metrics. Link to GitHub/portfolio. Show problem-solving approach and continuous learning.',
      example: null
    });

    // Template 8: Referral / Networking
    this.registerTemplate({
      id: 'referral',
      name: 'Referral / Networking',
      category: 'specialized',
      industry: ['any'],
      careerLevel: 'entry-mid-senior',
      tone: 'conversational',
      description: 'Mentions referral or mutual connection for warm introduction',
      structure: {
        opening: 'Dear {{hiring_manager_name}},\n\n{{referral_name}} suggested I reach out to you regarding the {{job_title}} position at {{company_name}}. {{referral_context}}.',
        body1: 'Based on {{referral_name}}\'s description of the role and team, I believe my background in {{your_background}} aligns well with what you\'re looking for. {{connection_to_role}}.',
        body2: 'In my current role at {{current_company}}, I {{key_achievement}}. {{achievement_impact}}. I\'m particularly proud of {{specific_accomplishment}}, which demonstrates {{what_it_demonstrates}}.',
        body3: 'What excites me about {{company_name}} is {{enthusiasm_statement}}. {{referral_name}} has shared great things about {{what_referral_shared}}, and I\'m eager to contribute to {{contribution_goal}}.',
        closing: '{{referral_name}} mentioned that you appreciate {{hiring_manager_preference}}, so I\'d love to {{call_to_action}}. Thank you for considering my application.\n\nBest regards,\n{{your_name}}\n{{your_phone}}\n{{your_email}}'
      },
      variables: [
        { name: 'your_name', label: 'Your Name', type: 'text', required: true, placeholder: 'Sarah Johnson' },
        { name: 'your_phone', label: 'Your Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
        { name: 'your_email', label: 'Your Email', type: 'email', required: true, placeholder: 'sarah.johnson@email.com' },
        { name: 'hiring_manager_name', label: 'Hiring Manager Name', type: 'text', required: true, placeholder: 'Jennifer Smith' },
        { name: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'Product Manager' },
        { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Innovation Labs' },
        { name: 'referral_name', label: 'Referral Name', type: 'text', required: true, placeholder: 'Tom Martinez' },
        { name: 'referral_context', label: 'Referral Context', type: 'textarea', required: true, placeholder: 'We worked together at TechCorp for three years, and when I mentioned I was looking for new opportunities in product management, he immediately thought of your team' },
        { name: 'your_background', label: 'Your Background Summary', type: 'text', required: true, placeholder: 'product management and user experience design' },
        { name: 'connection_to_role', label: 'Connection to Role', type: 'textarea', required: true, placeholder: 'My 5 years of experience leading cross-functional teams and launching B2B SaaS products seems like a strong match for the challenges you\'re tackling' },
        { name: 'current_company', label: 'Current/Recent Company', type: 'text', required: true, placeholder: 'TechCorp' },
        { name: 'key_achievement', label: 'Key Achievement', type: 'textarea', required: true, placeholder: 'led the development and launch of three major product features that increased user engagement by 45%' },
        { name: 'achievement_impact', label: 'Achievement Impact', type: 'textarea', required: true, placeholder: 'These initiatives contributed to a 25% increase in annual recurring revenue' },
        { name: 'specific_accomplishment', label: 'Specific Accomplishment', type: 'textarea', required: true, placeholder: 'coordinating a product pivot based on user research that prevented a potential product failure' },
        { name: 'what_it_demonstrates', label: 'What It Demonstrates', type: 'text', required: true, placeholder: 'my ability to make data-driven decisions and pivot quickly' },
        { name: 'enthusiasm_statement', label: 'Enthusiasm Statement', type: 'textarea', required: true, placeholder: 'your focus on building products that solve real customer problems rather than just chasing features' },
        { name: 'what_referral_shared', label: 'What Referral Shared', type: 'text', required: true, placeholder: 'the collaborative culture and the team\'s commitment to user-centered design' },
        { name: 'contribution_goal', label: 'Contribution Goal', type: 'text', required: true, placeholder: 'the upcoming product initiatives' },
        { name: 'hiring_manager_preference', label: 'Hiring Manager Preference', type: 'text', required: true, placeholder: 'direct communication and getting to know candidates\' thought processes' },
        { name: 'call_to_action', label: 'Call to Action', type: 'text', required: true, placeholder: 'schedule a time to discuss how I can contribute to your team\'s goals' }
      ],
      tips: 'Mention the referral early and naturally. Show you\'ve had a substantive conversation about the role. Keep tone warm but professional. Reference mutual connections or interests.',
      example: null
    });
  }

  /**
   * Register a template
   */
  registerTemplate(template) {
    this.templates.set(template.id, template);
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category) {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Get templates by career level
   */
  getTemplatesByCareerLevel(level) {
    return this.getAllTemplates().filter(t =>
      t.careerLevel === level || t.careerLevel.includes(level)
    );
  }

  /**
   * Get templates by industry
   */
  getTemplatesByIndustry(industry) {
    return this.getAllTemplates().filter(t =>
      t.industry.includes(industry) || t.industry.includes('any')
    );
  }

  /**
   * Set current template for editing
   */
  setCurrentTemplate(templateId, variables = {}) {
    this.currentTemplate = templateId;
    this.currentVariables = variables;
  }

  /**
   * Update variable value
   */
  updateVariable(variableName, value) {
    this.currentVariables[variableName] = value;
  }

  /**
   * Get current variables
   */
  getCurrentVariables() {
    return { ...this.currentVariables };
  }

  /**
   * Fill template with variables
   */
  fillTemplate(templateId, variables) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const filled = {
      opening: this.substituteVariables(template.structure.opening, variables),
      body1: this.substituteVariables(template.structure.body1, variables),
      body2: this.substituteVariables(template.structure.body2, variables),
      body3: this.substituteVariables(template.structure.body3, variables),
      closing: this.substituteVariables(template.structure.closing, variables)
    };

    return filled;
  }

  /**
   * Substitute variables in text
   */
  substituteVariables(text, variables) {
    let result = text;

    // Replace {{variable_name}} with actual values
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, variables[key] || `[${key}]`);
    });

    return result;
  }

  /**
   * Get full cover letter text
   */
  getFullCoverLetter(templateId, variables) {
    const filled = this.fillTemplate(templateId, variables);
    return `${filled.opening}\n\n${filled.body1}\n\n${filled.body2}\n\n${filled.body3}\n\n${filled.closing}`;
  }

  /**
   * Validate required variables
   */
  validateVariables(templateId, variables) {
    const template = this.getTemplate(templateId);
    if (!template) {
      return { valid: false, missing: [], message: 'Template not found' };
    }

    const missing = template.variables
      .filter(v => v.required && (!variables[v.name] || variables[v.name].trim() === ''))
      .map(v => v.label);

    return {
      valid: missing.length === 0,
      missing: missing,
      message: missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : 'All required fields filled'
    };
  }

  /**
   * Get template as HTML
   */
  getTemplateHTML(templateId, variables = {}) {
    const template = this.getTemplate(templateId);
    if (!template) return '';

    const filled = this.fillTemplate(templateId, variables);

    return `
      <div class="cover-letter-template" data-template="${templateId}">
        <div class="cover-letter-section opening">${this.formatParagraphs(filled.opening)}</div>
        <div class="cover-letter-section body1">${this.formatParagraphs(filled.body1)}</div>
        <div class="cover-letter-section body2">${this.formatParagraphs(filled.body2)}</div>
        <div class="cover-letter-section body3">${this.formatParagraphs(filled.body3)}</div>
        <div class="cover-letter-section closing">${this.formatParagraphs(filled.closing)}</div>
      </div>
    `;
  }

  /**
   * Format text with line breaks as HTML paragraphs
   */
  formatParagraphs(text) {
    return text
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  /**
   * Export template as JSON
   */
  exportTemplate(templateId, variables) {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return {
      template: {
        id: template.id,
        name: template.name,
        category: template.category
      },
      variables: variables,
      content: this.getFullCoverLetter(templateId, variables),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate example for a template
   */
  generateExample(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    // Generate example values from placeholders
    const exampleVariables = {};
    template.variables.forEach(v => {
      exampleVariables[v.name] = v.placeholder || `[${v.label}]`;
    });

    return this.getFullCoverLetter(templateId, exampleVariables);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoverLetterTemplateEngine;
}
