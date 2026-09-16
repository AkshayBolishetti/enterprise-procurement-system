package com.infosys.procurement_system.email;

import java.util.Map;

public interface EmailTemplateService {
    String processTemplate(String templateName, Map<String, Object> variables);
}
