/**
 * Real-time Data Validator - Validates extracted data BEFORE saving
 * Ensures accuracy by checking data during extraction, not after
 */
class DataValidator {
  
  /**
   * Validate page data before accepting it
   * @param {Array} pageVoters - Voters extracted from a page
   * @param {number} pageNumber - Page number
   * @param {number} expectedCount - Expected voter count (default 30)
   * @returns {Object} Validation result with errors and warnings
   */
  static validatePage(pageVoters, pageNumber, expectedCount = 30) {
    const errors = [];
    const warnings = [];
    const voterCount = pageVoters.length;
    
    // Critical: Check voter count
    if (voterCount === 0) {
      errors.push(`Page ${pageNumber}: ZERO voters extracted - CRITICAL ERROR`);
    } else if (voterCount < 25) {
      errors.push(`Page ${pageNumber}: Only ${voterCount} voters (expected ${expectedCount}) - TOO LOW`);
    } else if (voterCount < expectedCount) {
      warnings.push(`Page ${pageNumber}: ${voterCount} voters (expected ${expectedCount}) - Missing ${expectedCount - voterCount}`);
    }
    
    // Validate each voter
    pageVoters.forEach((voter, index) => {
      const voterErrors = this.validateVoter(voter, index + 1, pageNumber);
      errors.push(...voterErrors);
    });
    
    return {
      valid: errors.length === 0,
      voterCount,
      expectedCount,
      errors,
      warnings,
      accuracy: voterCount > 0 ? ((voterCount / expectedCount) * 100).toFixed(1) + '%' : '0%'
    };
  }
  
  /**
   * Validate individual voter data
   */
  static validateVoter(voter, position, pageNumber) {
    const errors = [];
    
    // Validate Voter ID
    if (!voter.voterId) {
      errors.push(`Page ${pageNumber}, Position ${position}: Missing Voter ID`);
    } else if (!/^[A-Z]{3}\d{7}$/.test(voter.voterId)) {
      errors.push(`Page ${pageNumber}, Position ${position}: Invalid Voter ID format: ${voter.voterId}`);
    }
    
    // Validate Name
    if (!voter.name || voter.name.trim().length < 2) {
      errors.push(`Page ${pageNumber}, Position ${position}: Missing or invalid name`);
    }
    
    // Validate Age
    if (!voter.age) {
      errors.push(`Page ${pageNumber}, Position ${position}: Missing age`);
    } else {
      const age = parseInt(voter.age);
      if (isNaN(age) || age < 18 || age > 120) {
        errors.push(`Page ${pageNumber}, Position ${position}: Invalid age: ${voter.age}`);
      }
    }
    
    // Validate Gender
    if (!voter.gender) {
      errors.push(`Page ${pageNumber}, Position ${position}: Missing gender`);
    } else if (!['M', 'F', 'पुरुष', 'स्त्री', 'Male', 'Female'].includes(voter.gender)) {
      errors.push(`Page ${pageNumber}, Position ${position}: Invalid gender: ${voter.gender}`);
    }
    
    return errors;
  }
  
  /**
   * Validate serial number sequence
   */
  static validateSerialSequence(voters) {
    const errors = [];
    const warnings = [];
    
    const withSerial = voters.filter(v => v.serialNumber);
    if (withSerial.length === 0) {
      errors.push('No serial numbers found in any voter');
      return { valid: false, errors, warnings };
    }
    
    // Check for gaps in sequence
    const serials = withSerial.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
    
    for (let i = 1; i < serials.length; i++) {
      const expected = serials[i - 1] + 1;
      const actual = serials[i];
      
      if (actual !== expected && actual !== serials[i - 1]) {
        warnings.push(`Serial number gap: ${serials[i - 1]} → ${actual} (expected ${expected})`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      minSerial: serials[0],
      maxSerial: serials[serials.length - 1],
      totalWithSerial: withSerial.length
    };
  }
  
  /**
   * Validate entire PDF extraction
   */
  static validatePDFExtraction(allVoters, expectedPages, expectedVotersPerPage = 30) {
    const errors = [];
    const warnings = [];
    
    // Calculate expected total
    const expectedTotal = (expectedPages - 1) * expectedVotersPerPage; // -1 for metadata page
    const actualTotal = allVoters.length;
    const accuracy = ((actualTotal / expectedTotal) * 100).toFixed(1);
    
    // Check total count
    if (actualTotal === 0) {
      errors.push('CRITICAL: No voters extracted from entire PDF');
    } else if (actualTotal < expectedTotal * 0.8) {
      errors.push(`Only ${actualTotal}/${expectedTotal} voters extracted (${accuracy}%) - TOO LOW`);
    } else if (actualTotal < expectedTotal) {
      warnings.push(`${actualTotal}/${expectedTotal} voters extracted (${accuracy}%)`);
    }
    
    // Check for duplicates
    const voterIds = allVoters.map(v => v.voterId).filter(Boolean);
    const uniqueIds = new Set(voterIds);
    const duplicateCount = voterIds.length - uniqueIds.size;
    
    if (duplicateCount > 0) {
      errors.push(`Found ${duplicateCount} duplicate voter IDs`);
    }
    
    // Validate serial sequence
    const serialValidation = this.validateSerialSequence(allVoters);
    errors.push(...serialValidation.errors);
    warnings.push(...serialValidation.warnings);
    
    // Gender distribution check
    const maleCount = allVoters.filter(v => v.gender === 'M' || v.gender === 'पुरुष').length;
    const femaleCount = allVoters.filter(v => v.gender === 'F' || v.gender === 'स्त्री').length;
    const unknownGender = allVoters.length - maleCount - femaleCount;
    
    if (unknownGender > allVoters.length * 0.1) {
      warnings.push(`${unknownGender} voters with unknown gender (${((unknownGender/allVoters.length)*100).toFixed(1)}%)`);
    }
    
    return {
      valid: errors.length === 0,
      accuracy,
      expectedTotal,
      actualTotal,
      duplicates: duplicateCount,
      maleCount,
      femaleCount,
      unknownGender,
      errors,
      warnings
    };
  }
  
  /**
   * Print validation report
   */
  static printValidationReport(validation, title = 'VALIDATION REPORT') {
    console.log('\n' + '='.repeat(80));
    console.log(`📋 ${title}`);
    console.log('='.repeat(80));
    
    if (validation.valid) {
      console.log('✅ VALIDATION PASSED');
    } else {
      console.log('❌ VALIDATION FAILED');
    }
    
    if (validation.accuracy) {
      console.log(`📊 Accuracy: ${validation.accuracy}`);
    }
    
    if (validation.voterCount !== undefined) {
      console.log(`👥 Voters: ${validation.voterCount}/${validation.expectedCount}`);
    }
    
    if (validation.actualTotal !== undefined) {
      console.log(`👥 Total Voters: ${validation.actualTotal}/${validation.expectedTotal}`);
      console.log(`   Male: ${validation.maleCount}`);
      console.log(`   Female: ${validation.femaleCount}`);
      if (validation.unknownGender > 0) {
        console.log(`   Unknown: ${validation.unknownGender}`);
      }
      if (validation.duplicates > 0) {
        console.log(`   ⚠️ Duplicates: ${validation.duplicates}`);
      }
    }
    
    if (validation.errors && validation.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (validation.warnings && validation.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      validation.warnings.slice(0, 10).forEach(warning => console.log(`   - ${warning}`));
      if (validation.warnings.length > 10) {
        console.log(`   ... and ${validation.warnings.length - 10} more warnings`);
      }
    }
    
    console.log('='.repeat(80) + '\n');
  }
}

module.exports = DataValidator;
