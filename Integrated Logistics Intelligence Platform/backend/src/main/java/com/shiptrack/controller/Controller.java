package com.shiptrack.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@ResponseBody
@org.springframework.stereotype.Controller

public class Controller {

    @GetMapping("/dashboard")
    public String getDashPage(){
        return "Dashboard";
    }
    
}
