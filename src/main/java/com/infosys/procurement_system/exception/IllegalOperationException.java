package com.infosys.procurement_system.exception;

/**
 * Exception thrown when an operation violates domain business rules or integrity constraints.
 */
public class IllegalOperationException extends RuntimeException {

    public IllegalOperationException(String message) {
        super(message);
    }
}
