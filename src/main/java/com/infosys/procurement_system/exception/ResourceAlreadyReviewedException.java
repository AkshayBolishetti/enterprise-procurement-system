package com.infosys.procurement_system.exception;

/**
 * Exception thrown when attempting to review an issue that has already been reviewed.
 */
public class ResourceAlreadyReviewedException extends RuntimeException {

    public ResourceAlreadyReviewedException(String message) {
        super(message);
    }
}
