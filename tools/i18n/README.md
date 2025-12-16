# 🌍 i18n Translation Management Tools

Complete internationalization (i18n) translation management system for the Hono Auth Worker project.

## 🚀 Quick Start

Use the new tool from the project root:

```bash
# Compare translations between locales
node tools/i18n/master.js compare

# Find English values in locale files
node tools/i18n/master.js find-english

# Run complete workflow
node tools/i18n/master.js workflow
```

## 📋 Overview

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `compare, c` | Compare keys between locales |
| `find-english, fe` | Find English values in locale files |
| `export, e` | Export untranslated keys to separate files |
| `progress, p [locale]` | Check translation progress |
| `merge, m [locale]` | Merge translated keys back |
| `fix, f` | Auto-fix missing keys |
| `details, d <locale>` | Show detailed missing keys |
| `addkey, ak <key> <value>` | Add new key to all locales |
| `test, t` | Test dynamic i18n system |
| `add, a <code>` | Add new language |
| `verify, v` | Quick system verification |
| `diff` | Find differences in i18n files |
| `clean` | Clean auto-english files |
| `workflow, w` | Run complete translation workflow |

## 🛠️ i18n/master.js Tool

### 🎯 Main Features

#### **CORE COMMANDS:**
```bash
node tools/i18n/master.js test          # Test dynamic i18n system
node tools/i18n/master.js add fr "French"  # Add new language  
node tools/i18n/master.js verify       # Quick system verification
```

#### **KEY MANAGEMENT:**
```bash
node tools/i18n/master.js compare      # Compare translations
node tools/i18n/master.js fix          # Auto-fix missing keys
node tools/i18n/master.js details vi   # Show detailed missing keys
node tools/i18n/master.js addkey "new.key" "value"  # Add new key
```

#### **TRANSLATION WORKFLOW:**
```bash
node tools/i18n/master.js export       # Export untranslated keys
node tools/i18n/master.js progress vi  # Check translation progress
node tools/i18n/master.js merge de     # Merge translated keys
node tools/i18n/master.js find-english # Find English values
node tools/i18n/master.js clean        # Clean auto-english files
node tools/i18n/master.js workflow     # Run complete workflow
```

#### **DIAGNOSTIC COMMANDS:**
```bash
node tools/i18n/master.js analyze      # Analyze i18n system
node tools/i18n/master.js check        # Check system integrity
node tools/i18n/master.js diff         # Find differences in i18n files
node tools/i18n/master.js endpoints    # Test API endpoints
node tools/i18n/master.js routes       # Test i18n routes
```

#### **DEMO COMMANDS:**
```bash
node tools/i18n/master.js demo         # Run interactive demo
node tools/i18n/master.js demo-endpoints  # Run endpoints demo
```

## 🔄 Translation Workflow

### 1. Find Untranslated Content

```bash
# Check for English values in locale files
node tools/i18n/master.js find-english

# Compare translations between locales
node tools/i18n/master.js compare
```

### 2. Export for Translation

```bash
# Export untranslated keys to *-auto-english.js files
node tools/i18n/master.js export
```

### 3. Manual Translation

Edit the generated `*-auto-english.js` files:
- `de-auto-english.js` - German translations
- `es-auto-english.js` - Spanish translations
- `fr-auto-english.js` - French translations
- `ja-auto-english.js` - Japanese translations
- `th-auto-english.js` - Thai translations
- `vi-auto-english.js` - Vietnamese translations

**Important Notes:**
- ✅ Keep key structure intact
- ✅ Preserve placeholders like `{{variable}}`
- ✅ Translate accurately according to context
- ❌ Don't change key names

### 4. Check Progress

```bash
# Check overall progress
node tools/i18n/master.js progress

# Check specific language
node tools/i18n/master.js progress vi
```

### 5. Merge Translations Back

```bash
# Merge specific language
node tools/i18n/master.js merge de

# Merge all languages
node tools/i18n/master.js merge all

# Preview changes (dry run)
node tools/i18n/master.js merge --dry-run
```

### 6. Verify Completion

```bash
# Check for remaining English values
node tools/i18n/master.js find-english

# Compare keys between locales
node tools/i18n/master.js compare
```

## 🎯 Complete Workflow (Automated)

```bash
# Run complete workflow
node tools/i18n/master.js workflow
```

This will:
1. Find English values in locale files
2. Export untranslated keys
3. Display translation progress
4. Provide next step guidance

## 🔍 Key Consistency & Validation Tools

### find-extra-keys.js - Key Discrepancy Detection

This new tool helps identify key inconsistencies between locale files:

```bash
# Compare keys between target locale and base (en)
node tools/i18n/find-extra-keys.js <target-locale> [base-locale]

# Examples
node tools/i18n/find-extra-keys.js de en      # Compare German vs English
node tools/i18n/find-extra-keys.js vi         # Compare Vietnamese vs English (default)
node tools/i18n/find-extra-keys.js th de      # Compare Thai vs German
```

**Features:**
- ✅ **Find missing keys** in target locale
- ✅ **Find extra keys** not in base locale  
- ✅ **Key count comparison** for consistency
- ✅ **Detailed reporting** with organized output
- ✅ **ES Module support** for modern JavaScript

**Usage Examples:**
```bash
# Check if Vietnamese has all English keys
node tools/i18n/find-extra-keys.js vi

# Find what's missing in German compared to English
node tools/i18n/find-extra-keys.js de en

# Compare Thai with German as base
node tools/i18n/find-extra-keys.js th de
```

**Sample Output:**
```
🔍 Comparing vi with base en...
📊 en: 1533 keys
📊 vi: 1533 keys

✅ vi perfectly matches en!
```

### master.js Integration

The key comparison functionality is also integrated into the master tool:

```bash
# Use master.js for comprehensive comparison
node tools/i18n/master.js compare    # Compare all locales
node tools/i18n/master.js diff       # Find differences in files
node tools/i18n/master.js fix        # Auto-fix missing keys
```

## 🧪 Testing & Analysis Tools

### System Testing

```bash
# Comprehensive i18n system test
node tools/i18n/master.js test

# Detailed system analysis
node tools/i18n/master.js analyze

# Check system integrity
node tools/i18n/master.js check
```

### API & Routes Testing

```bash
# Test API endpoints
node tools/i18n/master.js endpoints

# Test i18n routes
node tools/i18n/master.js routes
```

### Advanced Key Management

```bash
# Show detailed missing keys for Vietnamese
node tools/i18n/master.js details vi

# Auto-fix all missing keys
node tools/i18n/master.js fix

# Add new key to all locales
node tools/i18n/master.js addkey "validation.newField" "New field is required"

# Find key differences between locales
node tools/i18n/master.js diff

# Compare specific locales for inconsistencies
node tools/i18n/find-extra-keys.js de en
```

## 🚀 Usage Methods

### New Method (Recommended) - i18n/master.js

```bash
# Unified interface with all features
node tools/i18n/master.js [command]

# Examples
node tools/i18n/master.js compare
node tools/i18n/master.js find-english
node tools/i18n/master.js workflow
node tools/i18n/master.js add ko "Korean"
```

### Legacy Method (Still Works)

Individual tools are still available in `tools/i18n/` directory:

```bash
# Use tools directly (legacy)
node tools/i18n/find-english-values.js
node tools/i18n/export-untranslated-keys.js
node tools/i18n/check-translation-progress.js vi
node tools/i18n/test-dynamic-i18n.js
```

## 🎯 Typical Workflow for New Language

### 1. Add New Language
```bash
# Add Korean language
node tools/i18n/master.js add ko "Korean"
```

### 2. Test System
```bash
# Comprehensive test
node tools/i18n/master.js test

# Quick verification
node tools/i18n/master.js verify
```

### 3. Compare and Fix
```bash
# Compare translations
node tools/i18n/master.js compare

# Auto-fix missing keys
node tools/i18n/master.js fix
```

### 4. Verify Before Deploy
```bash
# Check system integrity
node tools/i18n/master.js check

# Test API endpoints
node tools/i18n/master.js endpoints
```

## 🌟 Key Features

### **🔄 Automatic Language Detection**
- No hardcoded language lists needed
- Auto-discovery from `src/i18n/locales/`
- Easy addition of new languages

### **⚡ Performance Optimization**
- Supported languages are cached
- Lazy loading of translations
- Full Cloudflare Workers compatibility

### **🛡️ Robust Validation**
- Translation structure verification
- Missing key detection
- Zod schema validation

### **🌐 API Localization**
- Language-specific translation endpoints
- Support for `?lang=` query parameter
- `Accept-Language` header detection

### **🔍 Translation Key Management**
- Compare keys between en.js and other locales
- Auto-fix missing translation keys
- Advanced CLI for key management
- Batch operations for translation maintenance

## 📋 Supported Languages

The system currently supports the following languages:

| Code | Language | File |
|------|----------|------|
| `en` | English (default) | `src/i18n/locales/en.js` |
| `vi` | Vietnamese | `src/i18n/locales/vi.js` |
| `fr` | French | `src/i18n/locales/fr.js` |
| `es` | Spanish | `src/i18n/locales/es.js` |
| `de` | German | `src/i18n/locales/de.js` |
| `ja` | Japanese | `src/i18n/locales/ja.js` |
| `th` | Thai | `src/i18n/locales/th.js` |

> **Note**: This list is automatically generated from files in `src/i18n/locales/`

## 🔧 Configuration

### Debug Mode
```bash
# In .dev.vars.development
DEBUG = "hono-auth-api:i18n:*"
```

### Environment Variables
```bash
# Default language
DEFAULT_LANGUAGE = "en"

# Enable/disable language detection
ENABLE_LANGUAGE_DETECTION = "true"
```

## 🎨 API Endpoints

### Translation Management
```bash
# Get all languages
GET /translations

# Get translations by language
GET /translations/:lang

# Validate translations
GET /translations/:lang/validate

# Get specific section
GET /translations/:lang/section/:section
```

### Testing Endpoints
```bash
# Test with default language
curl http://localhost:8787/

# Test with Accept-Language header
curl -H "Accept-Language: vi" http://localhost:8787/

# Test with query parameter
curl http://localhost:8787/?lang=vi
```

## 🚨 Troubleshooting

### Common Issues

1. **Language not detected**
   ```bash
   # Check if files exist
   ls -la src/i18n/locales/
   
   # Check system integrity
   node tools/i18n/master.js check
   ```

2. **Missing translations**
   ```bash
   # Check translation structure
   node tools/i18n/master.js find-english
   
   # Compare translations
   node tools/i18n/master.js compare
   ```

3. **Workers import errors**
   ```bash
   # Test Workers compatibility
   node tools/i18n/master.js test
   ```

4. **Merge failures**
   ```bash
   # Dry run to check before applying
   node tools/i18n/master.js merge --dry-run
   ```

### Debug Commands
```bash
# Comprehensive debug
DEBUG="hono-auth-api:i18n:*" node tools/i18n/master.js test

# Detailed system analysis
node tools/i18n/master.js analyze
```

## 📚 Tips & Best Practices

### Efficient Translation
- **Prioritize Vietnamese first** (fewer keys - good for testing workflow)
- **Translate by module**: auth, admin, validation, etc.
- **Use translation tools** like Google Translate as a foundation
- **Review and edit** to ensure quality

### Quality Control
- **Test application** after merging each language
- **Check placeholders** `{{variable}}` are preserved
- **Verify context** messages fit the context appropriately

### Progress Management
- **Commit frequently** when completing sections
- **Track progress** using `progress` command
- **Backup files** before merging (automatic backups created)

## 📁 File Structure

```
/user_demo_hono_worker/
├── tools/
│   └── i18n/                              # i18n tools directory
│       ├── master.js                      # 🆕 Main i18n tool
│       ├── README.md                      # This file (English)
│       ├── README_vi.md                   # Vietnamese documentation
│       ├── find-english-values.js         # Find English values in locales
│       ├── find-extra-keys.js             # 🆕 Find key discrepancies between locales
│       ├── export-untranslated-keys.js    # Export keys for translation
│       ├── check-translation-progress.js  # Check translation progress
│       ├── merge-translated-keys.js       # Merge translations back
│       ├── i18n-compare.js                # Compare locale keys
│       ├── i18n-key-diff.js               # Quick key difference check
│       ├── add-language-demo.js           # Add new languages
│       ├── test-dynamic-i18n.js           # Comprehensive testing
│       ├── analyze-i18n-files.js          # System analysis
│       ├── check-i18n.js                  # Check system integrity
│       ├── test-workers-i18n.js           # Workers compatibility
│       ├── test-endpoints-i18n.js         # Test API endpoints
│       ├── final-verification.js          # Quick verification
│       ├── i18n-auto-fix.js               # Auto-fix missing keys
│       ├── check-i18n-usage.sh            # Check tError/tSuccess usage
│       ├── demo-i18n.sh                   # Interactive demo
│       └── demo-endpoints-i18n.sh         # API endpoints demo
├── *-auto-english.js                      # Generated translation files
└── src/i18n/locales/                      # Source locale files
    ├── en.js                              # English (base)
    ├── de.js                              # German
    ├── es.js                              # Spanish
    ├── fr.js                              # French
    ├── ja.js                              # Japanese
    ├── th.js                              # Thai
    └── vi.js                              # Vietnamese
```

---

## 🎉 Conclusion

The i18n system has been **fully optimized** with:

✅ **Single unified tool** `tools/i18n/master.js`  
✅ **Bilingual Vietnamese-English interface**  
✅ **Automatic language detection**  
✅ **No hardcoding**  
✅ **Cloudflare Workers compatibility**  
✅ **Powerful management tools**  
✅ **Complete API localization**  
✅ **Comprehensive testing**  
✅ **Professional workflow management**

### 🚀 New Highlights:

- **Single tool** replaces 4 old tools
- **Short commands** with abbreviations (c, f, e, p, m, t, v, w...)
- **Unified functionality** all important features
- **Backward compatible** with legacy tools
- **Easier to use** with unified interface

**Created by**: GitHub Copilot  
**Date**: August 13, 2025  
**Version**: 3.1.0 - Enhanced Key Consistency Management

### 🆕 Latest Updates (v3.1.0):

- **New Tool**: `find-extra-keys.js` for precise key discrepancy detection
- **Enhanced master.js**: Added `diff` command and improved key comparison
- **Better Workflow**: Key count consistency checking and validation
- **Improved Integration**: Seamless workflow for maintaining translation consistency
- **Professional Output**: Enhanced error reporting and key analysis
