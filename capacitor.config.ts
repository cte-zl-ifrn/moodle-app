import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.edu.ifrn.ava',
  appName: 'Moodle App IFRN',
  webDir: 'www',
  cordova: {
    preferences: {
      permissions: 'none',
      orientation: 'default',
      'target-device': 'universal',
      fullscreen: 'false',
      'stay-in-webview': 'false',
      webviewbounce: 'false',
      UIWebViewBounce: 'false',
      DisallowOverscroll: 'true',
      'prerendered-icon': 'true',
      AppendUserAgent: 'MoodleMobile 5.2.0 (52000)',
      BackupWebStorage: 'none',
      ScrollEnabled: 'true',
      KeyboardDisplayRequiresUserAction: 'false',
      HideKeyboardFormAccessoryBar: 'false',
      KeyboardResizeMode: 'none',
      AllowInlineMediaPlayback: 'true',
      LoadUrlTimeoutValue: '60000',
      'load-url-timeout': '60000',
      AutoHideSplashScreen: 'false',
      'android-minSdkVersion': '24',
      'android-targetSdkVersion': '36',
      AndroidPersistentFileLocation: 'Compatibility',
      AndroidInsecureFileModeEnabled: 'true',
      CustomURLSchemePluginClearsAndroidIntent: 'true',
      'deployment-target': '15.0',
      iosPersistentFileLocation: 'Compatibility',
      iosScheme: 'moodleappfs',
      WKWebViewOnly: 'true',
      WKFullScreenEnabled: 'true',
      AndroidXEnabled: 'true',
      GradlePluginGoogleServicesEnabled: 'true',
      GradlePluginGoogleServicesVersion: '4.4.2',
      GradlePluginKotlinVersion: '1.9.24',
      StatusBarOverlaysWebView: 'false',
      StatusBarBackgroundColor: '#FFFFFF',
      NavigationBarBackgroundColor: '#FFFFFF',
      AndroidEdgeToEdge: 'true'
    }
  }
};

export default config;
