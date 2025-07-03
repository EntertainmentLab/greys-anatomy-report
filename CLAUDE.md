# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React web application that presents research findings on the impact of a Grey's Anatomy heat wave episode on climate beliefs and health risk perceptions. The application displays interactive data visualizations built with D3.js and includes both quantitative charts and qualitative survey results.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (must pass before committing)
- `npm run deploy` - Build and deploy to GitHub Pages

## Architecture

### Data Pipeline
- R script (`8-write_data_json.R`) processes raw research data and generates JSON files
- JSON files are stored in `public/` directory and consumed by React hooks
- Data includes knowledge accuracy, health worry levels, system impacts, policy support, and climate temporal proximity

### Component Structure
- **Main sections**: Study overview, methodology, and key findings with subsections
- **Chart components**: Numbered 3.1-3.5 for different data visualizations
- **Base components**: Reusable chart components (`EnhancedChart`, `LikertChart`, `TemporalChart`)
- **Data hooks**: Custom hooks for loading and processing JSON data (`useKnowledgeData`, `usePolicyData`, etc.)

### Chart Types
1. **Enhanced Charts**: Dot plots with connecting lines for means/percentages
2. **Likert Charts**: Stacked horizontal bar charts for survey responses
3. **Temporal Charts**: Line charts showing changes over time

### Styling
- CSS modules organized by component type in `src/styles/`
- Responsive design with mobile-first approach
- Custom color schemes defined in `constants.js`

## Key Technologies

- **React 18** with hooks for state management
- **D3.js** for custom data visualizations
- **Vite** for build tooling and development
- **ESLint** for code quality
- **Chart.js** and **Plotly.js** for additional chart types

## Data Structure

Research data is organized by:
- **Waves**: Baseline (Wave 1), Immediate (Wave 2), 15 days later (Wave 3)
- **Conditions**: Control, Treatment (Heat Wave episode), Handoff (episode + Instagram videos)
- **Political parties**: Democrat, Independent, Republican, Overall
- **Categories**: Knowledge areas, health concerns, system impacts, policy support

## Deployment

The application is deployed to GitHub Pages with base path `/greys-anatomy-report/`. The build process handles proper asset paths and routing for the GitHub Pages environment.