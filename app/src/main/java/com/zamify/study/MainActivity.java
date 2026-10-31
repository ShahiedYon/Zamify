package com.zamify.study;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
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
    private Object backCallback;
    private static final int MIN_WEBVIEW_MAJOR = 80;
    private static final String HOST = "https://app.zamify.local/";
    private static final String PRODUCT_ID = "zamify_aif_c01_full_pack";

    @Override
    @SuppressWarnings("deprecation")
    public void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        int chrome = 0xffe7dfd0;
        window.setStatusBarColor(chrome);
        window.setNavigationBarColor(chrome);
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        PackageInfo provider = WebView.getCurrentWebViewPackage();
        if (!supportedWebView(provider)) {
            showWebViewUpdate();
            return;
        }
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
                        if (web != view || isFinishing() || isDestroyed()) return;
                        view.evaluateJavascript("window.zamifyNativeVisible=true;window.startZamifyWelcome && window.startZamifyWelcome()", null);
                    }
                });
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if (!req.isForMainFrame()) return true;
                if ("https".equals(uri.getScheme()) && "app.zamify.local".equals(uri.getHost())) {
                    if ("/billing/unlock".equals(uri.getPath()) || "/billing/restore".equals(uri.getPath())) {
                        // Never grant content based on a URL or a locally editable flag.
                        Toast.makeText(MainActivity.this, "Purchases are not available in this version.", Toast.LENGTH_SHORT).show();
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
        if (Build.VERSION.SDK_INT >= 30) Api30Insets.install(window, root);
        if (Build.VERSION.SDK_INT >= 33) backCallback = Api33Back.register(this);
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
    private boolean supportedWebView(PackageInfo provider) {
        if (provider == null || provider.versionName == null) return false;
        try {
            int separator = provider.versionName.indexOf('.');
            String major = separator < 0 ? provider.versionName : provider.versionName.substring(0, separator);
            return Integer.parseInt(major) >= MIN_WEBVIEW_MAJOR;
        } catch (NumberFormatException e) { return false; }
    }
    private void showWebViewUpdate() {
        LinearLayout notice = new LinearLayout(this);
        notice.setOrientation(LinearLayout.VERTICAL);
        notice.setGravity(Gravity.CENTER_VERTICAL);
        int padding = (int) (24 * getResources().getDisplayMetrics().density);
        notice.setPadding(padding, padding, padding, padding);
        notice.setBackgroundColor(0xffe7dfd0);
        TextView title = new TextView(this);
        title.setText(R.string.webview_update_title);
        title.setTextSize(24);
        title.setTextColor(0xff242534);
        notice.addView(title);
        TextView message = new TextView(this);
        message.setText(R.string.webview_update_message);
        message.setTextSize(18);
        message.setTextColor(0xff242534);
        notice.addView(message);
        Button update = new Button(this);
        update.setText(R.string.webview_update_button);
        update.setOnClickListener(v -> {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=com.google.android.webview")));
            } catch (ActivityNotFoundException e) {
                Toast.makeText(this, "Open your app store and update Android System WebView or Chrome.", Toast.LENGTH_LONG).show();
            }
        });
        notice.addView(update);
        setContentView(notice);
    }
    // API-specific types stay inside guarded helpers so API 26–29 can load the Activity.
    @TargetApi(30)
    private static class Api30Insets {
        static void install(Window window, FrameLayout root) {
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
                return new WindowInsets.Builder(insets).setInsets(handled, Insets.NONE).build();
            });
            root.requestApplyInsets();
        }
    }
    @TargetApi(33)
    private static class Api33Back {
        static Object register(MainActivity activity) {
            OnBackInvokedCallback callback = activity::dispatchBackToWebView;
            activity.getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, callback);
            return callback;
        }
        static void unregister(MainActivity activity, Object callback) {
            activity.getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback((OnBackInvokedCallback) callback);
        }
    }
    // Reserved for a future verified Play Billing callback. There is deliberately
    // no caller in this free version and no SharedPreferences entitlement shortcut.
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
            runOnUiThread(() -> {
                if (web != null && !isFinishing() && !isDestroyed())
                    web.evaluateJavascript("window.onZamifyPaidPackUnlocked && window.onZamifyPaidPackUnlocked(" + json + ")", null);
            });
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
        if (Build.VERSION.SDK_INT >= 33 && backCallback != null) Api33Back.unregister(this, backCallback);
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
