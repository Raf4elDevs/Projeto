package com.tcc.bitebyte.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) {

        String method = request.getMethod();

        // GET pode ser público
        if (method.equalsIgnoreCase("GET")) {
            return true;
        }

        Boolean logado =
                (Boolean) request
                        .getSession()
                        .getAttribute("ADMIN_LOGADO");

        if (Boolean.TRUE.equals(logado)) {
            return true;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        return false;
    }
}