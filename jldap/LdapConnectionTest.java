import javax.net.SocketFactory;
import javax.net.ssl.*;
import javax.naming.Context;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.security.cert.X509Certificate;
import java.util.Hashtable;

public class LdapConnectionTest {

    public static void main(String[] args) {
        try {
            // Setup the SSL context to trust all certificates
            SSLContext sc = SSLContext.getInstance("TLS");
            TrustManager[] trustAllCerts = new TrustManager[]{new TrustAllCertificates()};
            sc.init(null, trustAllCerts, new java.security.SecureRandom());

            // LDAP server details
            //String ldapUrl = "ldaps://192.168.100.101"; // LDAP Server URL
            //String userDN = "cn=user1,ou=prv,ou=pf,o=novl"; // User DN
            //String password = "ot"; // Password

            String ldapUrl = "ldap://192.168.100.177"; // LDAP Server URL
            String userDN = "CN=JohnDoe,CN=Users,DC=corp,DC=iprint,DC=com"; // User DN
            String password = "P@ssOrd!"; // Password
            // Set up the environment for creating the initial context
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapUrl);
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, userDN);
            env.put(Context.SECURITY_CREDENTIALS, password);
//            env.put("java.naming.ldap.factory.socket", MySSLSocketFactory.class.getName());

            // Create the initial context
            DirContext ctx = new InitialDirContext(env);
            System.out.println("Connection successful.");

            // Close the context when done
            ctx.close();
        } catch (Exception e) {
            System.out.println("Connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static class TrustAllCertificates implements X509TrustManager {
        public void checkClientTrusted(X509Certificate[] xcs, String string) {
        }

        public void checkServerTrusted(X509Certificate[] xcs, String string) {
        }

        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }

    public static class MySSLSocketFactory extends SSLSocketFactory {
        private SSLSocketFactory socketFactory;

        public MySSLSocketFactory() {
            try {
                SSLContext ctx = SSLContext.getInstance("TLS");
                ctx.init(null, new TrustManager[]{new TrustAllCertificates()}, new java.security.SecureRandom());
                socketFactory = ctx.getSocketFactory();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        public static SocketFactory getDefault() {
            return new MySSLSocketFactory();
        }

        @Override
        public Socket createSocket(Socket socket, String string, int i, boolean bln) throws IOException {
            return socketFactory.createSocket(socket, string, i, bln);
        }

        @Override
        public Socket createSocket(String string, int i) throws IOException {
            return socketFactory.createSocket(string, i);
        }

        @Override
        public Socket createSocket(String string, int i, InetAddress ia, int i1) throws IOException {
            return socketFactory.createSocket(string, i, ia, i1);
        }

        @Override
        public Socket createSocket(InetAddress ia, int i) throws IOException {
            return socketFactory.createSocket(ia, i);
        }

        @Override
        public Socket createSocket(InetAddress ia, int i, InetAddress ia1, int i1) throws IOException {
            return socketFactory.createSocket(ia, i, ia1, i1);
        }

        @Override
        public String[] getDefaultCipherSuites() {
            return socketFactory.getDefaultCipherSuites();
        }

        @Override
        public String[] getSupportedCipherSuites() {
            return socketFactory.getSupportedCipherSuites();
        }
    }
}

