#!/usr/bin/env python3
"""
Script to check Tauri capabilities for security issues.
This script:
1. Verifies that capabilities follow the principle of least privilege
2. Ensures that wildcard permissions are justified
3. Checks for any overly permissive capabilities
"""

import os
import json
import sys
from glob import glob

# Define high-risk permissions that should be flagged
HIGH_RISK_PERMISSIONS = [
    "fs:default",  # Full filesystem access
    "path:all",    # Access to all paths
    "shell:all",   # Access to all shell commands
    "window:all",  # Access to all window APIs
    "*"            # Wildcard permission
]

def load_json_file(filepath):
    """Load and parse a JSON file"""
    try:
        with open(filepath, 'r') as file:
            return json.load(file)
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {filepath}")
        return None
    except Exception as e:
        print(f"❌ Error: Could not open file {filepath}: {e}")
        return None

def check_capability_file(filepath):
    """Check a capability file for security issues"""
    issues = []
    
    capability = load_json_file(filepath)
    if not capability:
        return [f"Invalid capability file: {filepath}"]
    
    # Check for identifier
    if not capability.get("identifier"):
        issues.append(f"Missing identifier in {filepath}")
    
    # Check for description
    if not capability.get("description"):
        issues.append(f"Missing description in {filepath}")
    
    # Check for windows
    windows = capability.get("windows", [])
    if not windows:
        issues.append(f"No windows specified in {filepath}")
    elif "*" in windows:
        issues.append(f"⚠️ Warning: Wildcard window access in {filepath}")
    
    # Check permissions
    permissions = capability.get("permissions", [])
    if not permissions:
        issues.append(f"No permissions specified in {filepath}")
    
    for permission in permissions:
        if permission in HIGH_RISK_PERMISSIONS:
            issues.append(f"⚠️ Warning: High-risk permission {permission} in {filepath}")
    
    # Check for remote access
    remote = capability.get("remote", {})
    if remote:
        urls = remote.get("urls", [])
        for url in urls:
            if url == "*" or url.startswith("*"):
                issues.append(f"⚠️ Warning: Wildcard URL access {url} in {filepath}")
    
    return issues

def main():
    """Main function to check all capability files"""
    print("Checking Tauri capabilities for security issues...")
    
    # Find all capability files
    capability_files = glob("src-tauri/capabilities/*.json")
    if not capability_files:
        print("No capability files found!")
        return 0
    
    all_issues = []
    
    # Check each capability file
    for file in capability_files:
        print(f"Checking {file}...")
        issues = check_capability_file(file)
        if issues:
            all_issues.extend(issues)
            for issue in issues:
                print(f"  {issue}")
    
    # Summary
    if all_issues:
        print(f"\n❌ Found {len(all_issues)} issues in capability files!")
        return 1
    else:
        print("\n✅ No issues found in capability files!")
        return 0

if __name__ == "__main__":
    sys.exit(main()) 