package com.mycompany;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;

@WebFilter("/*")
public class MyFilter implements Filter {

    public void init(FilterConfig fConfig) throws ServletException {
        System.out.println("MyFilter initialized");
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        System.out.println("Request intercepted: " + req.getRequestURI());
        chain.doFilter(request, response);
    }

    public void destroy() {
        System.out.println("MyFilter destroyed");
    }
}

