package com.zamify.study;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.widget.Toast;
import android.net.Uri;
import android.graphics.Insets;
import android.graphics.Color;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.widget.FrameLayout;
import java.io.IOException;

public class MainActivity extends Activity {
    private WebView web;
    private static final String HOST = "https://app.zamify.local/";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(0xffe7dfd0);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setMixedContentMode(0);
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                if ("https".equals(req.getUrl().getScheme()) && "app.zamify.local".equals(req.getUrl().getHost()) && "/index.html".equals(req.getUrl().getPath())) {
                    try { return new WebResourceResponse("text/html", "UTF-8", getAssets().open("index.html")); }
                    catch (IOException e) { return new WebResourceResponse("text/plain", "UTF-8", null); }
                }
                return new WebResourceResponse("text/plain", "UTF-8", null);
            }
            @Override public void onPageCommitVisible(WebView view, String url) {
                view.postVisualStateCallback(0, new WebView.VisualStateCallback() {
                    @Override public void onComplete(long requestId) {
                        view.evaluateJavascript("window.zamifyNativeVisible=true;window.startZamifyWelcome && window.startZamifyWelcome()", null);
                    }
                });
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if ("https".equals(uri.getScheme()) && "docs.aws.amazon.com".equals(uri.getHost())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (ActivityNotFoundException e) { Toast.makeText(MainActivity.this, "No browser is available to open the source.", Toast.LENGTH_SHORT).show(); }
                }
                return true;
            }
        });
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xffe7dfd0);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        setContentView(root);
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            getWindow().setStatusBarColor(Color.TRANSPARENT);
            getWindow().setNavigationBarColor(Color.TRANSPARENT);
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                int handled = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
                Insets bars = insets.getInsets(handled);
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                // WebView still receives changing IME insets for visual-viewport resizing.
                // Only the system bars/cutout already handled by this root are zeroed.
                return new WindowInsets.Builder(insets).setInsets(handled, Insets.NONE).build();
            });
            root.requestApplyInsets();
        }
        web.loadUrl(HOST + "index.html#android");
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("window.appBack && window.appBack()", value -> {
            if (!"true".equals(value)) MainActivity.super.onBackPressed();
        });
    }
    @Override public void onDestroy() { web.destroy(); super.onDestroy(); }
}
