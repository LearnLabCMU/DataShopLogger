#!/bin/bash

# DataShop Logger TypeScript SDK Publishing Script

echo "📦 Preparing to publish @learnlab/datashop-logger..."

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the ts-sdk directory."
  exit 1
fi

# Run all checks
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix all tests before publishing."
  exit 1
fi

echo "🔍 Running type check..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Please fix all type errors before publishing."
  exit 1
fi

echo "✨ Running linter..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Please fix all lint errors before publishing."
  exit 1
fi

echo "📊 Running test coverage..."
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "❌ Coverage requirements not met. Please improve test coverage."
  exit 1
fi

echo "🔨 Building package..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix all build errors before publishing."
  exit 1
fi

echo "📋 Package contents:"
npm pack --dry-run

echo ""
echo "✅ All checks passed!"
echo ""
echo "To publish to npm:"
echo "  1. Make sure you're logged in: npm login"
echo "  2. Publish the package: npm publish --access public"
echo ""
echo "Note: The package name is @learnlab/datashop-logger"