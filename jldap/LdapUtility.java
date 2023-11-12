// File: LdapUtility.java
package com.novell;


import javax.net.ssl.*;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.security.cert.X509Certificate;
import java.util.Hashtable;

public class LdapUtility {

    static {
        // Trust all SSL certificates (Note: only for testing purposes)
        try {
            SSLContext sc = SSLContext.getInstance("TLS");
            sc.init(null, new TrustManager[]{new TrustAllCertificates()}, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize SSL context", e);
        }
    }

    public static DirContext getLdapContext(String ldapUrl, String userDN, String password) throws Exception {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.factory.initial", "com.sun.jndi.ldap.LdapCtxFactory");
        env.put("java.naming.provider.url", ldapUrl);
        env.put("java.naming.security.authentication", "simple");
        env.put("java.naming.security.principal", userDN);
        env.put("java.naming.security.credentials", password);
        return new InitialDirContext(env);
    }

    private static class TrustAllCertificates implements X509TrustManager {
        public void checkClientTrusted(X509Certificate[] xcs, String string) {
        }
        public void checkServerTrusted(X509Certificate[] xcs, String string) {
        }
        public X509Certificate[] getAcceptedIssuers() {
            return null;
        }
    }
}

