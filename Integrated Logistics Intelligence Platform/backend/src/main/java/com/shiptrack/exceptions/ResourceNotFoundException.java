package com.shiptrack.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value=HttpStatus.NOT_FOUND)
public class ResourceNotFoundException  extends RuntimeException {

	public ResourceNotFoundException(String message) {
		super(message);
		// TODO Auto-generated constructor stub
	}
	
}
