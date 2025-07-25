# DataShop Logger SDK Testing Guide

This guide explains how to test all three SDKs: TypeScript, React, and Next.js.

## Quick Start

All SDKs are configured to log to:
- **Server**: DataShop QA server (https://pslc-qa.andrew.cmu.edu/log/server)
- **Dataset**: eason-test-0720
- **Session IDs**: Auto-generated with SDK-specific prefixes
  - TypeScript: `typescript_session_[uuid]`
  - React: `react_session_[uuid]`
  - Next.js: `nextjs_session_[uuid]`

## TypeScript SDK Testing

```bash
cd ts-sdk
npm test  # Run unit tests
npm run build  # Build the SDK

# Run example
cd examples
npx ts-node basic-usage.ts
```

Look for console output showing XML messages being sent.

## React SDK Testing

The React example uses Create React App with a proxy to bypass CORS issues.

```bash
cd react-sdk-example
npm start  # Starts on http://localhost:3000
```

### Testing Steps:
1. Open http://localhost:3000 in your browser
2. Open Developer Console (F12)
3. Look for `[DataShopLogger] Sending message:` logs
4. Answer quiz questions to trigger logging
5. Check Network tab for requests to `/datashop-proxy`

### Features to Test:
- ✅ Session persistence (refresh page, session ID remains)
- ✅ User GUID persistence (stored in localStorage)
- ✅ Multiple choice questions with skills tracking
- ✅ Open-ended questions
- ✅ Clear Session button

## Next.js SDK Testing

The Next.js example also includes a proxy configuration.

```bash
cd react-sdk-example-nextjs
npm run dev  # Starts on http://localhost:3000
```

Testing steps are the same as React SDK above.

## Debugging CORS Issues

If you see `ERR_BLOCKED_BY_CLIENT` errors:

1. **Check Ad Blockers**: Disable ad blockers or privacy extensions
2. **Use Proxy**: Both React and Next.js examples include proxy configuration for development
3. **Direct Testing**: Try the production URL instead: https://learnlab.web.cmu.edu/log/server

## Verifying Logs

To verify logs are being sent:

1. **Console Logs**: All SDKs log messages to console with `[DataShopLogger]` prefix
2. **Network Tab**: Check for POST requests to the logging endpoint
3. **Request Payload**: Should contain XML in DataShop format

## Common Issues

### "Invalid hook call" Error
- Make sure React is only in peerDependencies for the SDK
- Run `npm run build` in react-sdk folder after changes

### Blank Page
- Check browser console for errors
- Ensure all dependencies are installed
- Try clearing node_modules and reinstalling

### CORS Errors
- Use the proxy configuration (automatic in development)
- Or disable browser security for testing (not recommended)

## SDK Features

All SDKs support:
- ✅ Session management with custom IDs
- ✅ User GUID persistence
- ✅ Dynamic configuration (setProblemName, setDatasetLevelName, etc.)
- ✅ Skills/KC tracking
- ✅ Custom fields
- ✅ Multiple dataset levels
- ✅ Log listeners for debugging