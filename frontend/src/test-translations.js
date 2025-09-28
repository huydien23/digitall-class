// Test script to verify all translation keys are working properly
import i18n from './i18n/index.js'

// Function to check if a translation key exists
function checkKey(namespace, key, lang) {
  const fullKey = namespace ? `${namespace}:${key}` : key
  const translation = i18n.t(fullKey, { lng: lang })
  
  if (translation === fullKey || translation.includes('settings.tabs.')) {
    console.error(`❌ Missing translation: ${fullKey} (${lang})`)
    return false
  }
  
  return true
}

// Test all critical keys for both languages
function testTranslations() {
  console.log('Testing Vietnamese translations...')
  let viErrors = 0
  let enErrors = 0
  
  const commonKeys = [
    'settings',
    'teacher_settings', 
    'save',
    'cancel',
    'restore',
    'interface',
    'language',
    'preview',
    'comfortable',
    'compact',
    'vietnamese',
    'english'
  ]
  
  const settingsKeys = [
    'tabs.account',
    'tabs.qr',
    'tabs.notifications',
    'tabs.interface',
    'tabs.data',
    'desc.account',
    'desc.qr',
    'desc.notifications',
    'desc.interface',
    'desc.data'
  ]
  
  // Test Vietnamese
  i18n.changeLanguage('vi')
  commonKeys.forEach(key => {
    if (!checkKey('', key, 'vi')) viErrors++
  })
  settingsKeys.forEach(key => {
    if (!checkKey('settings', key, 'vi')) viErrors++
  })
  
  console.log('Testing English translations...')
  
  // Test English
  i18n.changeLanguage('en')
  commonKeys.forEach(key => {
    if (!checkKey('', key, 'en')) enErrors++
  })
  settingsKeys.forEach(key => {
    if (!checkKey('settings', key, 'en')) enErrors++
  })
  
  console.log('\n===== Translation Test Results =====')
  console.log(`Vietnamese: ${viErrors === 0 ? '✅ All keys present' : `❌ ${viErrors} missing keys`}`)
  console.log(`English: ${enErrors === 0 ? '✅ All keys present' : `❌ ${enErrors} missing keys`}`)
  
  if (viErrors === 0 && enErrors === 0) {
    console.log('\n✅ All translations are properly configured!')
  } else {
    console.log('\n❌ Some translations are missing. Check the errors above.')
  }
}

// Run test
testTranslations()

export default testTranslations