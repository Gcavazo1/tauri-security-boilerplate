#[cfg(test)]
mod memory_safe_tests {
    use super::super::memory_safe::{SecureString, BoundaryValidator};
    
    #[test]
    fn test_secure_string() {
        let test_string = "sensitive data";
        let secure = SecureString::new(test_string);
        
        // Verify we can access the content
        assert_eq!(secure.as_str(), test_string);
        
        // Verify length calculation
        assert_eq!(secure.len(), test_string.len());
    }
    
    #[test]
    fn test_secure_string_clearing() {
        let test_string = "sensitive data";
        let mut secure = SecureString::new(test_string);
        
        // Clear the string
        secure.clear();
        
        // Verify it's properly cleared
        assert_eq!(secure.as_str(), "");
        assert_eq!(secure.len(), 0);
    }
    
    #[test]
    fn test_boundary_validator() {
        // Test valid strings
        assert!(BoundaryValidator::validate_string("Hello, world!"));
        assert!(BoundaryValidator::validate_string("12345"));
        assert!(BoundaryValidator::validate_string("test@example.com"));
        
        // Test invalid strings
        assert!(!BoundaryValidator::validate_string("<script>alert(1)</script>"));
        assert!(!BoundaryValidator::validate_string("javascript:alert(1)"));
        assert!(!BoundaryValidator::validate_string("'; DROP TABLE users; --"));
        
        // Test valid paths
        assert!(BoundaryValidator::validate_path("documents/myfile.txt"));
        assert!(BoundaryValidator::validate_path("images/photo.jpg"));
        
        // Test invalid paths
        assert!(!BoundaryValidator::validate_path("../../../etc/passwd"));
        assert!(!BoundaryValidator::validate_path("/etc/shadow"));
    }
} 