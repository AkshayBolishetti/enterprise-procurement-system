package com.infosys.procurement_system.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailTemplateServiceImpl implements EmailTemplateService {

    private final TemplateEngine templateEngine;

    @Value("${app.email.company-name:Enterprise Procurement System}")
    private String companyName;

    @Override
    public String processTemplate(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        if (variables != null) {
            context.setVariables(variables);
        }
        context.setVariable("companyName", companyName);
        try {
            return templateEngine.process(templateName, context);
        } catch (Exception e) {
            log.error("Failed to render email template '{}': {}", templateName, e.getMessage(), e);
            throw new EmailException("Error processing email template: " + templateName, e);
        }
    }
}
