# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains the DataShopLogger implementation for logging educational data to Carnegie Mellon's DataShop system. It includes:

- **JavaScript Library** (root directory): Original JavaScript implementation of the DataShop logger
- **TypeScript SDK** (ts-sdk directory): Modern TypeScript version with full type safety and comprehensive testing

## Common Commands

### JavaScript Library (Root Directory)
```bash
# Install dependencies
npm install

# Build the library
npm run build      # Production build
npm run dev        # Development mode with watch

# Run tests
npm test           # Opens test page in browser (index.html)

# Clean build artifacts
npm run clean
```

### TypeScript SDK (ts-sdk Directory)
```bash
cd ts-sdk

# Install dependencies  
npm install

# Development
npm run dev        # Watch mode
npm run build      # Build for production

# Testing
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code quality
npm run lint       # Run ESLint
npm run lint:fix   # Fix lint issues
npm run typecheck  # TypeScript type checking

# Publishing
./publish.sh       # Run all checks before publishing
npm publish --access public  # Publish to npm
```

## Architecture

### JavaScript Library Structure
- `src/index.js` - Main entry point, exports all public classes
- `src/loglibrary/ctat-logginglibrary.js` - Core logging implementation
- `src/loglibrary/ctat-logmessagebuilder.js` - XML message builder for DataShop format
- `src/sai.js` - Selection-Action-Input (SAI) data structure
- `src/simon-*.js` - Base classes and utilities
- `webpack.*.js` - Webpack configuration for building

### TypeScript SDK Structure
- `src/index.ts` - Main exports
- `src/DataShopLogger.ts` - Main logger class implementation with all features
- `src/types/index.ts` - TypeScript interfaces including Skill support
- `src/utils/` - Utility classes (SAIBuilder, LogMessageBuilder, GUID generator)
- `src/errors/` - Custom error classes
- `src/__tests__/` - Jest unit tests
- `examples/` - Integration tests and usage examples

## Key Implementation Details

### Message Format
Both implementations generate XML messages conforming to DataShop's DTD v4 specification. Messages include:
- Context messages (session/problem information with multiple dataset levels)
- Tool messages (student actions with custom fields)
- Tutor messages (system responses/evaluations with skills/KC support)

### Session Management
- Sessions are identified by auto-generated UUIDs
- Context message IDs track problem instances
- Transaction IDs link tool and tutor messages

### Network Communication
- JavaScript: Uses `navigator.sendBeacon` for fire-and-forget logging
- TypeScript: Falls back to `fetch` API when sendBeacon unavailable

## Testing Approach

### JavaScript Library
- Manual testing via `index.html` demo page
- No automated tests in original implementation

### TypeScript SDK
- Jest for unit testing
- >95% code coverage requirement
- Tests for all public APIs and error cases
- Mock network calls for testing

## Important Notes

1. **Backward Compatibility**: The TypeScript SDK maintains API compatibility with the JavaScript version
2. **Zero Dependencies**: Both implementations have no runtime dependencies
3. **Browser Support**: Works in modern browsers and Node.js (TypeScript version)
4. **XML Escaping**: Both versions properly escape XML special characters in user input
5. **Logging URLs**: 
   - QA: https://pslc-qa.andrew.cmu.edu/log/server
   - Production: https://learnlab.web.cmu.edu/log/server (default in examples)
6. **XML Format**: Custom fields use individual `<custom_field>` elements (no wrapper)
7. **Tutor Advice**: Feedback is in separate `<tutor_advice>` element
8. **Object-Based API**: All public methods now accept object parameters for clarity

## Development Tips

1. When modifying the JavaScript library, test changes using `index.html`
2. For TypeScript changes, always run tests and ensure coverage remains >90%
3. Use Task Master for managing complex development tasks
4. Follow existing code style and patterns
5. Update documentation when adding new features

## TypeScript SDK Features

The TypeScript SDK includes all features from the JavaScript version plus:

### Knowledge Component (KC) / Skills Support
- Track learning objectives with the `skills` parameter in `logResponse`
- Support for skill categories, opportunities, and predicted error rates
- Properly formatted in XML as `<skills>` elements

### Multiple Dataset Levels
- Support for up to 10 hierarchical dataset levels
- Use `setDatasetLevelName(level, name)` and `setDatasetLevelType(level, type)`
- Levels are properly nested in the XML output

### Additional Methods
- `setUseSessionLog(boolean)` - Enable/disable session log messages
- `getLastSAI()` - Get the last logged SAI object
- All setter methods from JavaScript version are included

### XML Format Compliance
- Custom fields as individual `<custom_field>` elements (no wrapper)
- Tutor advice in separate `<tutor_advice>` element
- Proper escaping of XML special characters

### Object-Based API (v1.0+)
- All public methods now use object parameters instead of positional parameters
- Backward compatibility maintained through method overloading
- Example: `logger.logResponse({ transactionId, selection, action, input, ... })`
- Benefits: Better IDE support, self-documenting code, easier to extend

## Task Master Integration

The `.taskmaster/` directory contains Task Master AI configuration for project management. Use it for:
- Breaking down complex features
- Tracking implementation progress
- Managing dependencies between tasks
- Research-backed development decisions