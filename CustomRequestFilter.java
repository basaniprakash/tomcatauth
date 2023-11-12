package com.example.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class CustomRequestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) {
        // Initialization code here
        System.out.println("CustomRequestFilter initialized");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpReq = (HttpServletRequest) request;
        // Log the request URI
        System.out.println("Intercepted request for URI: " + httpReq.getRequestURI());

        // Continue with the next filter in the chain
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // Cleanup code here
        System.out.println("CustomRequestFilter destroyed");
    }
}

