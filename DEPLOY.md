## Publish steps

### 1. Log in (opens a browser)
```
npm login
```

### 2. Build and check types
```
npm run typecheck
npm run build
```

### 3. Preview exactly which files will be uploaded
```
cd packages/ui
npm pack --dry-run
```

### 4. Publish (a scoped package needs --access public, or npm treats it as private/paid)
```
npm publish --access public
```

Later releases

1. Bump the version with npm version patch|minor|major -w @jm/ui, or keep editing it by hand as you've been doing.
2. Build again, then run npm publish from packages/ui.
3. Optionally tag the release in git, e.g. git tag v0.40.0 && git push --tags.

If you want, I can do the prep for you: rename the package if needed, add the README, license and repository fields, then build and run the dry-run so you can review what would ship. You'd still need to run ! npm login yourself. I'll
only run the actual npm publish once you confirm, because a version can't be republished after it's live.