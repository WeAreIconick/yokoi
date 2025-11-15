# Cozy Mode Debugging Checklist

## 1. Check if the block is enabled in settings
- Go to WordPress Editor → Yokoi sidebar
- Look for "Cozy Mode" in the block toggle list
- Make sure it's **enabled** (toggle should be ON)

## 2. Check if the block appears in the inserter
- Open the block inserter (click + button)
- Search for "Cozy Mode"
- Check if it appears under the "Yokoi" category
- If it doesn't appear, try:
  - Click "Refresh Block Inserter" button in Yokoi sidebar
  - Close and reopen the inserter
  - Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)

## 3. Check browser console for errors
- Open browser DevTools (F12 or Cmd+Option+I)
- Go to Console tab
- Look for any red errors mentioning:
  - "cozy-mode"
  - "CozyMode"
  - "cozyMode"
- Check for JavaScript errors

## 4. Check if block is registered (PHP)
Add this to your theme's functions.php temporarily to check:
```php
add_action('wp_footer', function() {
    if (class_exists('WP_Block_Type_Registry')) {
        $registry = WP_Block_Type_Registry::get_instance();
        $is_registered = $registry->is_registered('yokoi/cozy-mode');
        echo '<!-- Cozy Mode registered: ' . ($is_registered ? 'YES' : 'NO') . ' -->';
    }
});
```

## 5. Check if JavaScript is loading
- Open browser DevTools → Network tab
- Filter by "cozy-mode" or "view.js"
- Reload the page
- Check if `view.js` is loading (should be 200 status)
- Check if `window.cozyMode` exists:
  - In Console, type: `console.log(window.cozyMode)`
  - Should show an object with `postId`, `version`, `strings`, etc.

## 6. Check if modal HTML is rendered
- View page source (Cmd+U / Ctrl+U)
- Search for "cozy-mode-modal"
- Should find: `<div id="cozy-mode-modal" class="cozy-mode-modal"`
- If not found, the render.php might not be executing

## 7. Check if button appears on frontend
- Add the Cozy Mode block to a post/page
- Publish and view on frontend
- Look for a button with text "Read in Cozy Mode"
- Check browser console for errors when clicking

## Quick Test Commands

### Check if block files exist:
```bash
ls -la build/blocks/cozy-mode/
```

### Check if block is in manifest:
```bash
grep -i "cozy-mode" build/blocks-manifest.php
```

### Check WordPress debug log:
```bash
tail -50 wp-content/debug.log | grep -i "cozy\|yokoi"
```

## Common Issues:

1. **Block not enabled**: Check Yokoi sidebar settings
2. **Cache issue**: Clear WordPress cache, browser cache, hard refresh
3. **JavaScript error**: Check console for errors
4. **Block not registered**: Check if block.json exists and is valid
5. **Modal not rendering**: Check if render.php is being called

