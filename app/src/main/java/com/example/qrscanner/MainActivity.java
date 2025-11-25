package com.example.qrscanner;

import android.content.Context;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private TextView statusText;
    private boolean isOnline;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        statusText = findViewById(R.id.statusText);
        webView = findViewById(R.id.webView);
        
        checkNetworkStatus();
        setupWebView();
    }
    
    private void checkNetworkStatus() {
        isOnline = isNetworkAvailable();
        if (isOnline) {
            statusText.setText("🟢 Online Mode - Live Website");
            statusText.setBackgroundColor(Color.parseColor("#4CAF50"));
            webView.loadUrl("https://codesca.blogspot.com");
        } else {
            statusText.setText("🟡 Offline Mode - Local Scanner");
            statusText.setBackgroundColor(Color.parseColor("#FFC107"));
            webView.loadUrl("file:///android_asset/index.html");
        }
    }
    
    private boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager = 
            (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }
    
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (isOnline) {
                    isOnline = false;
                    checkNetworkStatus();
                }
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }
        });
        
        webView.setWebChromeClient(new WebChromeClient());
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
