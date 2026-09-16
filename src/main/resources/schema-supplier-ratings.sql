-- Create supplier_ratings table schema reference
CREATE TABLE IF NOT EXISTS supplier_ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    purchase_order_id BIGINT NOT NULL,
    rating INT NOT NULL,
    review TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    CONSTRAINT fk_supplier_rating_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_supplier_rating_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_supplier_rating_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    CONSTRAINT uk_supplier_rating_po UNIQUE (purchase_order_id),
    CONSTRAINT chk_supplier_rating_val CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_rating_supplier ON supplier_ratings(supplier_id);
CREATE INDEX idx_rating_user ON supplier_ratings(user_id);
