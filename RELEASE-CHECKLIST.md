# Release Checklist for Tauri 2.0 Boilerplate

Use this checklist before tagging a new release to ensure the codebase is production-ready.

## Code Quality

- [ ] All TypeScript/JavaScript files pass ESLint without errors
- [ ] All Rust files pass `cargo clippy` without warnings
- [ ] Code formatting is consistent (run prettier and rustfmt)
- [ ] No debug console.log statements remain in code
- [ ] No TODO comments remain for critical features

## Testing

- [ ] All Jest tests pass successfully
- [ ] Core components have unit tests
- [ ] API integration has tests for success and error cases
- [ ] UI renders correctly on all supported platforms

## Security

- [ ] Tauri capabilities are configured with least privilege
- [ ] No sensitive data is stored in plaintext
- [ ] All user inputs are validated and sanitized
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are checked for vulnerabilities (`npm audit` and `cargo audit`)

## Documentation

- [ ] README is up-to-date with setup instructions
- [ ] Code has appropriate comments for complex sections
- [ ] API functions have JSDoc or Rust doc comments
- [ ] CHANGELOG is updated with all notable changes
- [ ] DOCUMENTATION.md is updated with any new features

## Performance

- [ ] UI is responsive and doesn't block the main thread
- [ ] Large data operations are handled efficiently
- [ ] Memory usage is reasonable for expected operations
- [ ] App startup time is optimized

## Build Process

- [ ] Application builds successfully for all target platforms
- [ ] Bundle size is optimized (check unused dependencies)
- [ ] Environment-specific configuration is properly set up
- [ ] Package.json version is updated
- [ ] Cargo.toml version is updated
- [ ] Application icons are present for all platforms

## Cross-Platform Compatibility

- [ ] App functions correctly on Windows
- [ ] App functions correctly on macOS
- [ ] App functions correctly on Linux
- [ ] File path handling is compatible with all platforms
- [ ] UI layout adapts to different screen sizes

## Accessibility

- [ ] UI components have proper ARIA attributes
- [ ] Color contrast meets accessibility standards
- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility is verified

## Final Verification

- [ ] Test fresh install from packaged build
- [ ] Verify all core functionality works in release build
- [ ] Run a final review of code changes since last release
- [ ] Update documentation with latest release information
- [ ] Tag the release in version control

## Post-Release

- [ ] Create GitHub release with release notes
- [ ] Notify relevant stakeholders of the release
- [ ] Monitor for immediate issues after release
- [ ] Document lessons learned for future releases

This checklist helps ensure that your Tauri application is robust, secure, and ready for production use. 