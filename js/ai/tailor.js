/**
 * Resume Tailoring Engine
 * Generates specific, actionable suggestions to tailor resume to job descriptions
 */

class ResumeTailor {
    constructor() {
        this.suggestionTypes = {
            ADD_KEYWORD: 'add_keyword',
            REWRITE_BULLET: 'rewrite_bullet',
            ADD_SKILL: 'add_skill',
            REORDER_SECTION: 'reorder_section',
            EMPHASIZE_EXPERIENCE: 'emphasize_experience',
            ADD_BULLET: 'add_bullet',
            MODIFY_SUMMARY: 'modify_summary'
        };
    }

    /**
     * Generate tailoring suggestions for resume
     * @param {Object} resumeData - Current resume data
     * @param {Object} jobData - Parsed job description
     * @param {Object} matchData - Match analysis from mapper
     * @param {string} apiKey - Claude API key
     * @returns {Promise<Object>} Tailoring suggestions with before/after
     */
    async generateSuggestions(resumeData, jobData, matchData, apiKey) {
        console.log('[Tailor] Generating tailoring suggestions...');

        try {
            // Build comprehensive prompt for Claude
            const prompt = this.buildTailoringPrompt(resumeData, jobData, matchData);

            // Call Claude API
            const response = await this.callClaudeAPI(apiKey, prompt);

            // Parse suggestions from response
            const suggestions = this.parseSuggestions(response, resumeData, jobData);

            // Track base version
            const tailoringSession = {
                sessionId: this.generateSessionId(),
                createdAt: new Date().toISOString(),
                jobTitle: jobData.jobTitle || 'Unknown Position',
                company: jobData.company || '',
                matchScore: matchData.overallScore,
                suggestions: suggestions,
                appliedSuggestions: [],
                baseResume: JSON.parse(JSON.stringify(resumeData)) // Deep copy
            };

            console.log(`[Tailor] Generated ${suggestions.length} suggestions`);
            return tailoringSession;

        } catch (error) {
            console.error('[Tailor] Error generating suggestions:', error);
            throw new Error('Failed to generate tailoring suggestions: ' + error.message);
        }
    }

    /**
     * Build comprehensive tailoring prompt
     * @param {Object} resumeData - Resume data
     * @param {Object} jobData - Job data
     * @param {Object} matchData - Match analysis
     * @returns {string} Prompt for Claude
     */
    buildTailoringPrompt(resumeData, jobData, matchData) {
        const resumeText = this.serializeResume(resumeData);

        return `You are an expert resume consultant specializing in tailoring resumes to specific job descriptions.

CURRENT RESUME:
${resumeText}

TARGET JOB:
Title: ${jobData.jobTitle || 'N/A'}
Company: ${jobData.company || 'N/A'}

Required Skills: ${(jobData.requiredSkills || []).join(', ')}
Preferred Skills: ${(jobData.preferredSkills || []).join(', ')}
Key Tools: ${(jobData.tools || []).join(', ')}
Important Keywords: ${(jobData.keywords || []).join(', ')}

CURRENT MATCH ANALYSIS:
Overall Score: ${matchData.overallScore}%
Missing Required Skills: ${matchData.gaps.missingRequiredSkills.join(', ')}
Missing Keywords: ${matchData.gaps.missingKeywords.join(', ')}

TASK:
Provide specific, actionable suggestions to improve this resume for the target job. Return ONLY valid JSON without any markdown formatting or code blocks.

For each suggestion, provide:
1. The type of change (add_keyword, rewrite_bullet, add_skill, modify_summary, etc.)
2. The section affected
3. The specific location (section ID or index if applicable)
4. The current content (before)
5. The suggested content (after)
6. A brief explanation of why this change helps
7. Estimated impact (high/medium/low)

Return in this JSON format:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "rewrite_bullet",
      "section": "experience",
      "sectionId": "section-123",
      "itemIndex": 0,
      "bulletIndex": 0,
      "before": "current bullet text",
      "after": "improved bullet text with relevant keywords",
      "reason": "Incorporates required skills X and Y, adds quantification",
      "impact": "high",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}

Focus on:
1. Incorporating missing required skills naturally
2. Rewriting bullet points to include relevant keywords
3. Emphasizing experiences that match job requirements
4. Adding specific achievements that align with job responsibilities
5. Optimizing the summary/objective for this role

Provide 5-10 high-impact suggestions. Return ONLY the JSON object.`;
    }

    /**
     * Parse suggestions from Claude response
     * @param {string} response - Claude API response
     * @param {Object} resumeData - Resume data for context
     * @param {Object} jobData - Job data for context
     * @returns {Array<Object>} Parsed suggestions
     */
    parseSuggestions(response, resumeData, jobData) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : response;
            const parsed = JSON.parse(jsonText);

            const suggestions = parsed.suggestions || [];

            // Enhance suggestions with IDs and metadata
            return suggestions.map((suggestion, index) => ({
                id: suggestion.id || `suggestion-${Date.now()}-${index}`,
                type: suggestion.type || 'rewrite_bullet',
                section: suggestion.section || '',
                sectionId: suggestion.sectionId || '',
                itemIndex: suggestion.itemIndex,
                bulletIndex: suggestion.bulletIndex,
                before: suggestion.before || '',
                after: suggestion.after || '',
                reason: suggestion.reason || '',
                impact: suggestion.impact || 'medium',
                keywords: suggestion.keywords || [],
                applied: false,
                appliedAt: null
            }));

        } catch (error) {
            console.error('[Tailor] Failed to parse suggestions JSON:', error);
            // Return basic suggestions based on gaps
            return this.generateBasicSuggestions(resumeData, jobData);
        }
    }

    /**
     * Generate basic suggestions as fallback
     * @param {Object} resumeData - Resume data
     * @param {Object} jobData - Job data
     * @returns {Array<Object>} Basic suggestions
     */
    generateBasicSuggestions(resumeData, jobData) {
        const suggestions = [];

        // Suggest adding missing required skills
        if (jobData.requiredSkills && jobData.requiredSkills.length > 0) {
            const skillsSection = resumeData.sections?.find(s => s.type === 'skills');

            suggestions.push({
                id: `suggestion-skills-${Date.now()}`,
                type: this.suggestionTypes.ADD_SKILL,
                section: 'skills',
                sectionId: skillsSection?.id || '',
                before: skillsSection?.content?.text || '',
                after: `Add these required skills: ${jobData.requiredSkills.slice(0, 5).join(', ')}`,
                reason: 'These skills are required for the position',
                impact: 'high',
                keywords: jobData.requiredSkills,
                applied: false
            });
        }

        // Suggest modifying summary
        const summarySection = resumeData.sections?.find(s =>
            s.type === 'summary' || s.type === 'objective'
        );

        if (summarySection) {
            suggestions.push({
                id: `suggestion-summary-${Date.now()}`,
                type: this.suggestionTypes.MODIFY_SUMMARY,
                section: 'summary',
                sectionId: summarySection.id,
                before: summarySection.content?.text || '',
                after: `Tailor your summary to emphasize: ${(jobData.requiredSkills || []).slice(0, 3).join(', ')}`,
                reason: `Align summary with ${jobData.jobTitle || 'target role'} requirements`,
                impact: 'high',
                keywords: jobData.requiredSkills || [],
                applied: false
            });
        }

        return suggestions;
    }

    /**
     * Apply a suggestion to resume data
     * @param {Object} resumeData - Current resume data
     * @param {Object} suggestion - Suggestion to apply
     * @returns {Object} Updated resume data
     */
    applySuggestion(resumeData, suggestion) {
        console.log(`[Tailor] Applying suggestion: ${suggestion.id}`);

        // Deep copy to avoid mutation
        const updated = JSON.parse(JSON.stringify(resumeData));

        // Find the section
        const section = updated.sections?.find(s => s.id === suggestion.sectionId);

        if (!section) {
            console.warn('[Tailor] Section not found:', suggestion.sectionId);
            return updated;
        }

        // Apply based on suggestion type
        switch (suggestion.type) {
            case this.suggestionTypes.REWRITE_BULLET:
                if (section.content?.items && suggestion.itemIndex !== undefined) {
                    const item = section.content.items[suggestion.itemIndex];
                    if (item && item.bullets && suggestion.bulletIndex !== undefined) {
                        item.bullets[suggestion.bulletIndex] = suggestion.after;
                    }
                }
                break;

            case this.suggestionTypes.MODIFY_SUMMARY:
                if (section.content) {
                    section.content.text = suggestion.after;
                }
                break;

            case this.suggestionTypes.ADD_SKILL:
                if (section.content) {
                    section.content.text = suggestion.after;
                }
                break;

            case this.suggestionTypes.ADD_BULLET:
                if (section.content?.items && suggestion.itemIndex !== undefined) {
                    const item = section.content.items[suggestion.itemIndex];
                    if (item && item.bullets) {
                        item.bullets.push(suggestion.after);
                    }
                }
                break;

            default:
                console.warn('[Tailor] Unknown suggestion type:', suggestion.type);
        }

        // Mark suggestion as applied
        suggestion.applied = true;
        suggestion.appliedAt = new Date().toISOString();

        return updated;
    }

    /**
     * Apply multiple suggestions at once
     * @param {Object} resumeData - Current resume data
     * @param {Array<Object>} suggestions - Suggestions to apply
     * @returns {Object} Updated resume data
     */
    applyAllSuggestions(resumeData, suggestions) {
        console.log(`[Tailor] Applying ${suggestions.length} suggestions...`);

        let updated = resumeData;

        suggestions.forEach(suggestion => {
            updated = this.applySuggestion(updated, suggestion);
        });

        console.log('[Tailor] All suggestions applied');
        return updated;
    }

    /**
     * Serialize resume for prompting
     * @param {Object} resumeData - Resume data
     * @returns {string} Serialized resume text
     */
    serializeResume(resumeData) {
        let text = '';

        if (resumeData.sections) {
            resumeData.sections.forEach((section, sectionIndex) => {
                text += `\n[SECTION ${sectionIndex}: ${section.type} - ID: ${section.id}]\n`;
                text += `Title: ${section.title || 'Untitled'}\n`;

                if (section.content) {
                    if (section.content.text) {
                        text += `${section.content.text}\n`;
                    }
                    if (section.content.items) {
                        section.content.items.forEach((item, itemIndex) => {
                            text += `\n[Item ${itemIndex}]\n`;
                            Object.entries(item).forEach(([key, value]) => {
                                if (key === 'bullets' && Array.isArray(value)) {
                                    value.forEach((bullet, bulletIndex) => {
                                        text += `  [Bullet ${bulletIndex}] ${bullet}\n`;
                                    });
                                } else if (typeof value === 'string') {
                                    text += `  ${key}: ${value}\n`;
                                }
                            });
                        });
                    }
                }
            });
        }

        return text;
    }

    /**
     * Call Claude API
     * @param {string} apiKey - Claude API key
     * @param {string} prompt - Prompt text
     * @returns {Promise<string>} API response
     */
    async callClaudeAPI(apiKey, prompt) {
        const response = await fetch('http://localhost:3101/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey: apiKey,
                prompt: prompt,
                maxTokens: 4096,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();
        return data.content;
    }

    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return 'tailor-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Create singleton instance
const resumeTailor = new ResumeTailor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = resumeTailor;
}
