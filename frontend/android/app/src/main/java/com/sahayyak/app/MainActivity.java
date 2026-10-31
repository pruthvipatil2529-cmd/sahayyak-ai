package com.sahayyak.app;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private boolean ttsReady = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Android Native TextToSpeech
        try {
            tts = new TextToSpeech(this, this);
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    runOnUiThread(() -> {
                        try {
                            WebView webView = bridge.getWebView();
                            if (webView != null) {
                                webView.evaluateJavascript("window.onAndroidTTSStart && window.onAndroidTTSStart();", null);
                            }
                        } catch (Exception ignored) {}
                    });
                }

                @Override
                public void onDone(String utteranceId) {
                    runOnUiThread(() -> {
                        try {
                            WebView webView = bridge.getWebView();
                            if (webView != null) {
                                webView.evaluateJavascript("window.onAndroidTTSDone && window.onAndroidTTSDone();", null);
                            }
                        } catch (Exception ignored) {}
                    });
                }

                @Override
                public void onError(String utteranceId) {
                    runOnUiThread(() -> {
                        try {
                            WebView webView = bridge.getWebView();
                            if (webView != null) {
                                webView.evaluateJavascript("window.onAndroidTTSDone && window.onAndroidTTSDone();", null);
                            }
                        } catch (Exception ignored) {}
                    });
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Configure WebView for audio permissions, microphone access, and TTS interface
        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setDomStorageEnabled(true);

                // Add Javascript interface for native Android Text-to-Speech
                webView.addJavascriptInterface(new AndroidTTSInterface(), "AndroidTTS");

                webView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onPermissionRequest(final PermissionRequest request) {
                        // Automatically grant microphone and media audio capture to the web app
                        request.grant(request.getResources());
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            ttsReady = true;
            try {
                tts.setLanguage(new Locale("en", "IN"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public class AndroidTTSInterface {
        @JavascriptInterface
        public boolean isAvailable() {
            return ttsReady && tts != null;
        }

        @JavascriptInterface
        public void speak(String text, String lang) {
            if (tts == null || !ttsReady || text == null || text.trim().isEmpty()) {
                return;
            }
            try {
                Locale locale;
                if ("hi".equalsIgnoreCase(lang) || "hi-IN".equalsIgnoreCase(lang)) {
                    locale = new Locale("hi", "IN");
                } else if ("mr".equalsIgnoreCase(lang) || "mr-IN".equalsIgnoreCase(lang)) {
                    locale = new Locale("mr", "IN");
                } else {
                    locale = new Locale("en", "IN");
                }

                int result = tts.setLanguage(locale);
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(Locale.US);
                }

                tts.setSpeechRate(0.9f);
                tts.setPitch(1.0f);

                Bundle params = new Bundle();
                params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "SahayyakTTS");
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, "SahayyakTTS");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) {
                try {
                    tts.stop();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Override
    public void onDestroy() {
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        super.onDestroy();
    }
}

