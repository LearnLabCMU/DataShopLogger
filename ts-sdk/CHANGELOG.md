# Changelog

All notable changes to the DataShop Logger TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-30

### Added
- Initial release of DataShop Logger TypeScript SDK
- Full TypeScript support with comprehensive type definitions
- Zero runtime dependencies
- Support for all DataShop logging operations:
  - Session management (start, end)
  - Interface attempts logging
  - Hint request and response logging
  - Tutor response logging
  - Custom fields support
- Modern JavaScript features (ES2020+)
- Universal support for Node.js and browsers
- Automatic fallback from `navigator.sendBeacon` to `fetch` API
- Custom log listener support
- SAI Builder utility for constructing Selection-Action-Input objects
- Comprehensive error handling with custom error types
- Extensive test suite with >95% coverage
- Full API documentation with examples
- Example applications:
  - Basic usage
  - React integration
  - Node.js server

### Security
- Automatic XML escaping for all user inputs
- No eval() or dynamic code execution
- Secure HTTPS communication with DataShop servers

### Migration from JavaScript Version
- Maintains API compatibility with original JavaScript DataShopLogger
- Enhanced with TypeScript's type safety
- Improved error messages and debugging experience