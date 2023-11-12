// File: LdapServlet.java

import javax.naming.directory.DirContext;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LdapServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            String ldapUrl = "ldaps://192.168.100.101"; // Replace with your LDAP server URL
            String userDN = "cn=user1,ou=prv,ou=pf,o=novl"; // Replace with the user DN
            String password = "ot"; // Replace with the password

            DirContext ctx = LdapUtility.getLdapContext(ldapUrl, userDN, password);
            // Perform LDAP operations with the context...

            ctx.close(); // Make sure to close the context after use
            response.getWriter().write("LDAP Connection Successful");
        } catch (Exception e) {
            throw new RuntimeException("LDAP Connection Failed", e);
        }
    }
}

