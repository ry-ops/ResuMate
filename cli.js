#!/usr/bin/env node
/**
 * ATSFlow CLI - Command-line interface for Claude Code integration
 *
 * Usage with Claude Code:
 *   node cli.js <command> [options]
 *
 * Commands:
 *   generate <type>       Generate content (resume, cover-letter, summary, etc.)
 *   analyze <file>        Run ATS analysis on resume
 *   parse <file>          Parse resume from PDF/DOCX
 *   tailor <resume> <job> Tailor resume to job description
 *   export <file> <format> Export resume (pdf, docx, txt, json)
 *   benchmark <file>      Run industry benchmarking analysis
 */

const fs = require('fs');
const path = require('path');

// Command routing
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command) {
    showHelp();
    process.exit(1);
  }

  switch (command) {
    case 'generate':
      await require('./js/ai/cli-generate.js')(args.slice(1));
      break;
    case 'analyze':
      await require('./js/analyzer/cli-analyze.js')(args.slice(1));
      break;
    case 'parse':
      await require('./js/export/cli-parse.js')(args.slice(1));
      break;
    case 'tailor':
      await require('./js/ai/cli-tailor.js')(args.slice(1));
      break;
    case 'export':
      await require('./js/export/cli-export.js')(args.slice(1));
      break;
    case 'benchmark':
      await require('./js/insights/cli-benchmark.js')(args.slice(1));
      break;
    case 'version':
      await require('./js/versions/cli-version.js')(args.slice(1));
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
ATSFlow CLI - AI-Powered Resume Optimization for Claude Code

USAGE:
  node cli.js <command> [options]

COMMANDS:
  generate <type> [options]     Generate AI content
    Types: summary, experience, skills, cover-letter
    Options: --input <file> --output <file> --tone <professional|creative>

  analyze <file>                Run ATS analysis
    Options: --output <file> --format <json|text>

  parse <file>                  Parse resume from PDF/DOCX
    Options: --output <file>

  tailor <resume> <job>         Tailor resume to job description
    Options: --output <file> --auto-apply

  export <file> <format>        Export resume
    Formats: pdf, docx, txt, json, html

  benchmark <file>              Industry benchmarking analysis
    Options: --industry <tech|finance|healthcare|marketing>

  version list                  List all resume versions
  version diff <v1> <v2>        Compare two versions

  help                          Show this help message

EXAMPLES:
  # Generate AI content
  node cli.js generate summary --input resume.json --tone professional

  # Analyze resume for ATS compatibility
  node cli.js analyze resume.pdf --output analysis.json

  # Tailor resume to job
  node cli.js tailor resume.json job-description.txt --output tailored.json

  # Export to PDF
  node cli.js export resume.json pdf --output resume.pdf

API SERVER:
  Start API server for programmatic access:
    node server.js

  API will be available at http://localhost:3000
  See API documentation in server.js

For use with Claude Code, call commands directly or via the API server.
`);
}

// Run main
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
