# Locales (i18n)

UI strings live in JSON files, one per language.

## Files

- `fr.json` - French (default)
- `en.json` - English

## Add a third language (example: Spanish)

1. Copy `en.json` to `es.json`.
2. Translate every value (keep the same keys).
3. Open `public/js/i18n.js` and add `'es'` to the `SUPPORTED` array:

```js
const SUPPORTED = ['fr', 'en', 'es'];
```

4. Restart the site and use the language button (it cycles through `SUPPORTED`).

## Key naming

Use dotted sections: `nav.home`, `home.lead`, `errors.login_failed`.

Dynamic text in JavaScript:

```js
ADL.t('home.count', { n: 3 });
```

Static HTML:

```html
<span data-i18n="nav.home"></span>
<input data-i18n-placeholder="home.searchPlaceholder" />
<title data-i18n-title="meta.titleHome"></title>
```
