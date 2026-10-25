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
import android.view.WindowInsets;
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
                if (req.getUrl().toString().equals(HOST + "index.html")) {
                    try { return new WebResourceResponse("text/html", "UTF-8", getAssets().open("index.html")); }
                    catch (IOException e) { return new WebResourceResponse("text/plain", "UTF-8", null); }
                }
                return new WebResourceResponse("text/plain", "UTF-8", null);
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
        setContentView(web);
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            web.setOnApplyWindowInsetsListener((v, insets) -> {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
        }
        web.loadUrl(HOST + "index.html");
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("window.appBack && window.appBack()", value -> {
            if (!"true".equals(value)) MainActivity.super.onBackPressed();
        });
    }
    @Override public void onDestroy() { web.destroy(); super.onDestroy(); }
}
