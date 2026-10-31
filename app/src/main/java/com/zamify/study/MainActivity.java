package com.zamify.study;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class MainActivity extends Activity {
    private WebView web;
    private OnBackInvokedCallback backCallback;
    private static final String HOST = "https://app.zamify.local/";
    private static final String PRODUCT_ID = "zamify_aif_c01_full_pack";
    private static final String PREFS_NAME = "zamify_entitlement_prefs";
    private static final String KEY_UNLOCKED = "full_pack_unlocked";

    @Override
    @SuppressWarnings("deprecation")
    public void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        int chrome = 0xffe7dfd0;
        window.setStatusBarColor(chrome);
        window.setNavigationBarColor(chrome);
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        web = new WebView(this);
        web.setBackgroundColor(chrome);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setSafeBrowsingEnabled(true);
        settings.setBlockNetworkLoads(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) == 0) {
            WebView.setWebContentsDebuggingEnabled(false);
        }
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("https".equals(u.getScheme()) && "app.zamify.local".equals(u.getHost()) && u.getPort() == -1 && "/index.html".equals(u.getPath())) {
                    try {
                        return new WebResourceResponse("text/html", "UTF-8", getAssets().open("index.html"));
                    } catch (IOException e) {
                        return notFoundResponse();
                    }
                }
                return notFoundResponse();
            }
            @Override
            public void onPageCommitVisible(WebView view, String url) {
                view.postVisualStateCallback(0, new WebView.VisualStateCallback() {
                    @Override
                    public void onComplete(long requestId) {
                        view.evaluateJavascript("window.zamifyNativeVisible=true;window.startZamifyWelcome && window.startZamifyWelcome()", null);
                        restoreLocalEntitlementIfPresent();
                    }
                });
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if (!req.isForMainFrame()) return true;
                if ("https".equals(uri.getScheme()) && "app.zamify.local".equals(uri.getHost())) {
                    if ("/billing/unlock".equals(uri.getPath()) || "/billing/restore".equals(uri.getPath())) {
                        // Scaffold only: no Google Play purchase, verification or acknowledgement exists yet.
                        restoreLocalEntitlementIfPresent();
                        return true;
                    }
                }
                if ("https".equals(uri.getScheme()) && "docs.aws.amazon.com".equals(uri.getHost()) && uri.getPort() == -1 && uri.getUserInfo() == null) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (ActivityNotFoundException e) {
                        Toast.makeText(MainActivity.this, "No browser is available to open the source.", Toast.LENGTH_SHORT).show();
                    }
                }
                return true;
            }
        });
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(chrome);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                int lightBars = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                controller.setSystemBarsAppearance(lightBars, lightBars);
            }
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                int handled = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
                Insets bars = insets.getInsets(handled);
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                // Leave IME insets available to WebView for viewport resizing.
                return new WindowInsets.Builder(insets).setInsets(handled, Insets.NONE).build();
            });
            root.requestApplyInsets();
        }
        if (Build.VERSION.SDK_INT >= 33) {
            backCallback = () -> dispatchBackToWebView();
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, backCallback);
        }
        web.loadUrl(HOST + "index.html#android");
    }
    private void dispatchBackToWebView() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript("window.appBack && window.appBack()", value -> {
            if (!"true".equals(value)) finish();
        });
    }
    private WebResourceResponse notFoundResponse() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
            Collections.singletonMap("Cache-Control", "no-store"), new ByteArrayInputStream(new byte[0]));
    }
    private void restoreLocalEntitlementIfPresent() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        // No writer is exposed: this preference is not proof of a Google Play purchase.
        if (prefs.getBoolean(KEY_UNLOCKED, false)) unlockEncryptedPaidPack();
    }
    private void unlockEncryptedPaidPack() {
        try (InputStream in = getAssets().open("paid_pack.enc")) {
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] chunk = new byte[4096];
            int n;
            while ((n = in.read(chunk)) != -1) buffer.write(chunk, 0, n);
            byte[] payload = buffer.toByteArray();
            if (payload.length < 28) throw new IOException("Invalid encrypted pack");
            byte[] iv = new byte[12];
            System.arraycopy(payload, 0, iv, 0, 12);
            byte[] cipherBytes = new byte[payload.length - 12];
            System.arraycopy(payload, 12, cipherBytes, 0, cipherBytes.length);
            byte[] key = MessageDigest.getInstance("SHA-256").digest((getPackageName() + ":" + PRODUCT_ID + ":v1").getBytes(StandardCharsets.UTF_8));
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
            // Escape characters that have special meaning in a JavaScript source string.
            String json = new String(cipher.doFinal(cipherBytes), StandardCharsets.UTF_8)
                .replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
            runOnUiThread(() -> web.evaluateJavascript("window.onZamifyPaidPackUnlocked && window.onZamifyPaidPackUnlocked(" + json + ")", null));
        } catch (Exception e) {
            // Fail closed; never enable paid content on missing assets or failed authentication.
            Toast.makeText(this, "Study pack unavailable. Please continue with the free pack.", Toast.LENGTH_SHORT).show();
        }
    }
    @Override
    // API 33+ uses the platform OnBackInvokedCallback registered above.
    // This override exists only as the API 26–32 fallback; no AndroidX is used.
    @SuppressLint("GestureBackNavigation")
    @SuppressWarnings("deprecation")
    public void onBackPressed() { dispatchBackToWebView(); }
    @Override
    public void onDestroy() {
        if (Build.VERSION.SDK_INT >= 33 && backCallback != null) getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backCallback);
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
