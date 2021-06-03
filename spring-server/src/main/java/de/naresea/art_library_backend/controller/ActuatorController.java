package de.naresea.art_library_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/actuator")
public class ActuatorController {

    @GetMapping("health")
    public boolean isAlive() {
        return true;
    }

    @PostMapping("shutdown")
    public boolean shutdownServer() {
        System.exit(0);
        return true;
    }
}
