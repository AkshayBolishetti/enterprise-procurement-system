package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.User;
import lombok.Getter;

@Getter
public class UserRegisteredEvent {
    private final User user;

    public UserRegisteredEvent(User user) {
        this.user = user;
    }
}
